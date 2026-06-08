import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private gatewayService: GatewayService,
  ) {}

  async getMenuByToken(token: string) {
    // Cari meja berdasarkan QR token
    const table = await this.prisma.tables.findUnique({
      where: { qr_token: token },
    });
    if (!table) throw new NotFoundException('QR code tidak valid');
    if (!table.is_active) throw new BadRequestException('Meja tidak aktif');

    // Cek toko buka atau tidak
    const store = await this.prisma.stores.findUnique({
      where: { id: table.store_id },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    if (!store.is_open) throw new BadRequestException('Toko sedang tutup');

    // Ambil semua kategori + menu + addon (hanya yang available)
    const categories = await this.prisma.categories.findMany({
      where: { store_id: store.id },
      include: {
        menus: {
          where: { is_available: true },
          include: {
            addons: { where: { is_available: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return {
      store: { id: store.id, name: store.name },
      table: { id: table.id, code: table.code },
      categories,
    };
  }

  async createOrder(dto: CreateOrderDto) {
    // Validasi QR token & meja
    const table = await this.prisma.tables.findUnique({
      where: { qr_token: dto.qr_token },
    });
    if (!table) throw new NotFoundException('QR code tidak valid');
    if (!table.is_active) throw new BadRequestException('Meja tidak aktif');

    // Validasi toko buka
    const store = await this.prisma.stores.findUnique({
      where: { id: table.store_id },
    });
    if (!store?.is_open) throw new BadRequestException('Toko sedang tutup');

    // Hitung subtotal dari setiap item
    let subtotal = 0;

    // Validasi setiap menu dan addon, lalu kumpulkan data
    const orderItemsData = await Promise.all(
      dto.items.map(async (item) => {
        const menu = await this.prisma.menus.findFirst({
          where: {
            id: item.menu_id,
            is_available: true,
            category: { store_id: store.id },
          },
        });
        if (!menu) {
          throw new NotFoundException(`Menu ${item.menu_id} tidak ditemukan`);
        }

        // Harga dasar item = harga menu × jumlah
        const menuPrice = Number(menu.price);
        let itemTotal = menuPrice * item.quantity;

        // Validasi dan hitung harga addon
        const addonsData: {
          addon_id: string;
          addon_name: string;
          addon_price: number;
          quantity: number;
        }[] = [];

        if (item.addons && item.addons.length > 0) {
          for (const addonReq of item.addons) {
            const addon = await this.prisma.addons.findFirst({
              where: {
                id: addonReq.addon_id,
                menu_id: menu.id,
                is_available: true,
              },
            });
            if (!addon) {
              throw new NotFoundException(
                `Addon ${addonReq.addon_id} tidak ditemukan`,
              );
            }
            const addonQty = addonReq.quantity ?? 1;
            const addonPrice = Number(addon.price);
            itemTotal += addonPrice * addonQty * item.quantity;

            addonsData.push({
              addon_id: addon.id,
              addon_name: addon.name,
              addon_price: addonPrice,
              quantity: addonQty,
            });
          }
        }

        subtotal += itemTotal;

        return {
          menu_id: menu.id,
          quantity: item.quantity,
          base_price: menuPrice,
          total_price: itemTotal,
          note: item.note,
          addons: addonsData,
        };
      }),
    );

    // Grand total (tax & service = 0 untuk MVP)
    const grandTotal = subtotal;

    // Generate order number: ORD-YYYYMMDD-XXXX
    const orderNumber = await this.generateOrderNumber();

    // Buat order + items + addons dalam satu transaksi
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          table_id: table.id,
          order_number: orderNumber,
          customer_name: dto.customer_name,
          note: dto.note,
          subtotal,
          grand_total: grandTotal,
          order_status: 'waiting_payment',
          payment_status: 'unpaid',
        },
      });

      // Buat setiap order item + addon-nya
      for (const itemData of orderItemsData) {
        const createdItem = await tx.order_items.create({
          data: {
            order_id: newOrder.id,
            menu_id: itemData.menu_id,
            quantity: itemData.quantity,
            base_price: itemData.base_price,
            total_price: itemData.total_price,
            note: itemData.note,
          },
        });

        if (itemData.addons.length > 0) {
          await tx.order_item_addons.createMany({
            data: itemData.addons.map((a) => ({
              order_item_id: createdItem.id,
              addon_id: a.addon_id,
              addon_name: a.addon_name,
              addon_price: a.addon_price,
              quantity: a.quantity,
            })),
          });
        }
      }

      return newOrder;
    });

    // Kembalikan order lengkap
    const fullOrder = await this.getOrderById(order.id);
    this.gatewayService.emitNewOrder(fullOrder);
    return fullOrder;
  }

  // Customer track status order
  async getOrderById(orderId: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        table: { select: { code: true } },
        order_items: {
          include: {
            menu: { select: { name: true, image_url: true } },
            order_item_addons: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  // Helper: generate order number unik
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // "20260605"

    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const count = await this.prisma.orders.count({
      where: { created_at: { gte: startOfDay } },
    });

    const seq = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${seq}`;
  }
}
