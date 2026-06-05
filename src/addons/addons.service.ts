import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';

@Injectable()
export class AddonsService {
  constructor(private prisma: PrismaService) {}

  private async getStore(ownerId: string) {
    const store = await this.prisma.stores.findUnique({
      where: { owner_id: ownerId },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    return store;
  }

  async create(ownerId: string, dto: CreateAddonDto) {
    const store = await this.getStore(ownerId);

    const menu = await this.prisma.menus.findFirst({
      where: {
        id: dto.menu_id,
        category: { store_id: store.id },
      },
    });

    if (!menu) throw new NotFoundException('Menu tidak ditemukan');

    return this.prisma.addons.create({
      data: {
        menu_id: dto.menu_id,
        name: dto.name,
        price: dto.price,
        is_available: dto.is_available ?? true,
      },
    });
  }

  async findByMenu(menuId: string) {
    return this.prisma.addons.findMany({ where: { menu_id: menuId } });
  }

  async update(ownerId: string, id: string, dto: UpdateAddonDto) {
    const store = await this.getStore(ownerId);
    const addon = await this.prisma.addons.findFirst({
      where: { id, menu: { category: { store_id: store.id } } },
    });
    if (!addon) throw new NotFoundException('Addon tidak ditemukan');
    return this.prisma.addons.update({ where: { id }, data: dto });
  }

  async remove(ownerId: string, id: string) {
    const store = await this.getStore(ownerId);
    const addon = await this.prisma.addons.findFirst({
      where: { id, menu: { category: { store_id: store.id } } },
    });
    if (!addon) throw new NotFoundException('Addon tidak ditemukan');
    return this.prisma.addons.delete({ where: { id } });
  }
}
