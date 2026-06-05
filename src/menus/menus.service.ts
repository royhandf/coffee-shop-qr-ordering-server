import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  private async getStore(ownerId: string) {
    const store = await this.prisma.stores.findUnique({
      where: { owner_id: ownerId },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    return store;
  }

  async create(ownerId: string, dto: CreateMenuDto) {
    const store = await this.getStore(ownerId);

    // Pastikan category milik toko ini
    const cat = await this.prisma.categories.findFirst({
      where: { id: dto.category_id, store_id: store.id },
    });
    if (!cat) throw new NotFoundException('Kategori tidak ditemukan');

    return this.prisma.menus.create({
      data: {
        category_id: dto.category_id,
        name: dto.name,
        description: dto.description,
        image_url: dto.image_url,
        price: dto.price,
        is_available: dto.is_available ?? true,
      },
    });
  }

  async findAll(ownerId: string) {
    const store = await this.getStore(ownerId);
    return this.prisma.menus.findMany({
      where: { category: { store_id: store.id } },
      include: { category: true, addons: true },
      orderBy: { created_at: 'asc' },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateMenuDto) {
    const store = await this.getStore(ownerId);
    const menu = await this.prisma.menus.findFirst({
      where: { id, category: { store_id: store.id } },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return this.prisma.menus.update({ where: { id }, data: dto });
  }

  async remove(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const menu = await this.prisma.menus.findFirst({
      where: { id, category: { store_id: store.id } },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return this.prisma.menus.delete({ where: { id } });
  }

  async toggleAvailability(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const menu = await this.prisma.menus.findFirst({
      where: { id, category: { store_id: store.id } },
    });
    if (!menu) throw new NotFoundException('Menu tidak ditemukan');
    return this.prisma.menus.update({
      where: { id },
      data: { is_available: !menu.is_available },
    });
  }
}
