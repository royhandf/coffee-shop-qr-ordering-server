import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  // POST /api/tables
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateTableDto) {
    return this.tablesService.create(user.id, dto);
  }

  // GET /api/tables
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tablesService.findAll(user.id);
  }

  // GET /api/tables/:id/qr  →  ambil QR image base64 (FR-19, FR-20)
  @Get(':id/qr')
  getQRCode(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tablesService.getQRCode(user.id, id);
  }

  // PATCH /api/tables/:id/qr/regenerate  →  buat token QR baru
  @Patch(':id/qr/regenerate')
  regenerateQR(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tablesService.regenerateQR(user.id, id);
  }

  // PATCH /api/tables/:id/toggle  →  aktif/nonaktif meja
  @Patch(':id/toggle')
  toggleActive(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tablesService.toggleActive(user.id, id);
  }

  // DELETE /api/tables/:id
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tablesService.remove(user.id, id);
  }
}
