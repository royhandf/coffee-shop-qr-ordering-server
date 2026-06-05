import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dt';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Helper: cari store milik owner ini
  private async getStore(ownerId: string) {
    const store = await this.prisma.stores.findUnique({
      where: { owner_id: ownerId },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    return store;
  }

  async create(ownerId: string, dto: CreateCategoryDto) {
    const store = await this.getStore(ownerId);
    return this.prisma.categories.create({
      data: { store_id: store.id, name: dto.name },
    });
  }

  async findAll(ownerId: string) {
    const store = await this.getStore(ownerId);
    return this.prisma.categories.findMany({
      where: { store_id: store.id },
      orderBy: { created_at: 'asc' },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateCategoryDto) {
    const store = await this.getStore(ownerId);
    const cat = await this.prisma.categories.findFirst({
      where: { id, store_id: store.id },
    });
    if (!cat) throw new NotFoundException('Kategori tidak ditemukan');
    return this.prisma.categories.update({ where: { id }, data: dto });
  }

  async remove(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const cat = await this.prisma.categories.findFirst({
      where: { id, store_id: store.id },
    });
    if (!cat) throw new NotFoundException('Kategori tidak ditemukan');

    return this.prisma.categories.delete({ where: { id } });
  }
}
