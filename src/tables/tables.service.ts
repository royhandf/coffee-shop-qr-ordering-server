import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private async getStore(ownerId: string) {
    const store = await this.prisma.stores.findUnique({
      where: { owner_id: ownerId },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    return store;
  }

  // Buat meja baru + generate QR token unik
  async create(ownerId: string, dto: CreateTableDto) {
    const store = await this.getStore(ownerId);

    return this.prisma.tables.create({
      data: {
        store_id: store.id,
        code: dto.code,
        qr_token: uuidv4(),
      },
    });
  }

  async findAll(ownerId: string) {
    const store = await this.getStore(ownerId);
    return this.prisma.tables.findMany({
      where: { store_id: store.id },
      orderBy: { created_at: 'asc' },
    });
  }

  // Generate QR code image dalam format base64 (FR-20)
  async getQRCode(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const table = await this.prisma.tables.findFirst({
      where: { id, store_id: store.id },
    });
    if (!table) throw new NotFoundException('Meja tidak ditemukan');

    // URL yang akan di-encode ke QR
    // Saat customer scan, browser buka URL ini → load halaman menu
    const baseUrl = this.config.get<string>('CUSTOMER_APP_URL');
    const qrUrl = `${baseUrl}/menu?token=${table.qr_token}`;

    // Generate QR sebagai base64 PNG
    const qrImage = await QRCode.toDataURL(qrUrl);

    return {
      table_id: table.id,
      code: table.code,
      qr_url: qrUrl,
      qr_image: qrImage,
    };
  }

  // Buat QR token baru (jika QR lama bocor)
  async regenerateQR(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const table = await this.prisma.tables.findFirst({
      where: { id, store_id: store.id },
    });
    if (!table) throw new NotFoundException('Meja tidak ditemukan');
    return this.prisma.tables.update({
      where: { id },
      data: { qr_token: uuidv4() },
    });
  }

  // Aktifkan / nonaktifkan meja
  async toggleActive(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const table = await this.prisma.tables.findFirst({
      where: { id, store_id: store.id },
    });
    if (!table) throw new NotFoundException('Meja tidak ditemukan');
    return this.prisma.tables.update({
      where: { id },
      data: { is_active: !table.is_active },
    });
  }

  async remove(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const table = await this.prisma.tables.findFirst({
      where: { id, store_id: store.id },
    });
    if (!table) throw new NotFoundException('Meja tidak ditemukan');
    return this.prisma.tables.delete({ where: { id } });
  }
}
