import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateStoreDto) {
    const exists = await this.prisma.stores.findUnique({
      where: { owner_id: ownerId },
    });

    if (exists) throw new ConflictException('Owner sudah memiliki toko');

    return this.prisma.stores.create({
      data: { owner_id: ownerId, name: dto.name },
    });
  }

  async findMine(ownerId: string) {
    const store = await this.prisma.stores.findUnique({
      where: { owner_id: ownerId },
    });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');
    return store;
  }

  async update(ownerId: string, dto: UpdateStoreDto) {
    const store = await this.findMine(ownerId);
    return this.prisma.stores.update({
      where: { id: store.id },
      data: dto,
    });
  }
}
