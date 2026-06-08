import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private gatewayService: GatewayService,
  ) {}

  //   Helper: cari store milik user ini
  private async getStore(ownerId: string) {
    const store = await this.prisma.stores.findUnique({
      where: {
        owner_id: ownerId,
      },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    return store;
  }

  async findAll(ownerId: string, status?: string) {
    const store = await this.getStore(ownerId);

    return this.prisma.orders.findMany({
      where: {
        table: { store_id: store.id },
        ...(status ? { order_status: status as any } : {}),
      },
      include: {
        table: { select: { code: true } },
        order_items: {
          include: {
            menu: { select: { name: true } },
            order_item_addons: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(ownerId: string, orderId: string) {
    const store = await this.getStore(ownerId);

    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, table: { store_id: store.id } },
      include: {
        table: {
          select: { code: true },
        },
        order_items: {
          include: {
            menu: { select: { name: true, image_url: true } },
            order_item_addons: true,
          },
        },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async updateStatus(
    ownerId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const store = await this.getStore(ownerId);
    const order = await this.prisma.orders.findFirst({
      where: { id: orderId, table: { store_id: store.id } },
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    const allowedTransitions: Record<string, string[]> = {
      waiting_payment: ['queued', 'cancelled'],
      queued: ['processing', 'cancelled'],
      processing: ['ready', 'cancelled'],
      ready: ['completed'],
      completed: [],
      cancelled: [],
    };
    const current = order.order_status as string;
    const next = dto.order_status;
    if (!allowedTransitions[current]?.includes(next)) {
      throw new BadRequestException(
        `Tidak bisa mengubah status dari "${current}" ke "${next}"`,
      );
    }

    const updated = await this.prisma.orders.update({
      where: { id: orderId },
      data: { order_status: next as any },
    });

    this.gatewayService.emitOrderStatusUpdated(orderId, next, updated);
    return updated;
  }

  async cancelOrder(ownerId: string, orderId: string) {
    return this.updateStatus(ownerId, orderId, { order_status: 'cancelled' });
  }
}
