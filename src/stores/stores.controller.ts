import { Controller, Body, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  //POST /api/stores
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateStoreDto) {
    return this.storesService.create(user.id, dto);
  }

  // GET /api/stores/me
  @Get('me')
  findMine(@CurrentUser() user: any) {
    return this.storesService.findMine(user.id);
  }

  // PATCH /api/stores/me  →  update nama atau buka/tutup toko
  @Patch('me')
  update(@CurrentUser() user: any, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(user.id, dto);
  }
}
