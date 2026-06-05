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
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // POST /api/menus
  @Post()
  @Roles('owner')
  create(@CurrentUser() user: any, @Body() dto: CreateMenuDto) {
    return this.menusService.create(user.id, dto);
  }

  // GET /api/menus
  @Get()
  @Roles('owner', 'staff')
  findAll(@CurrentUser() user: any) {
    return this.menusService.findAll(user.id);
  }

  // PATCH /api/menus/:id
  @Patch(':id')
  @Roles('owner')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menusService.update(user.id, id, dto);
  }

  // PATCH /api/menus/:id/availability
  @Patch(':id/availability')
  @Roles('owner', 'staff')
  toggleAvailability(@CurrentUser() user: any, @Param('id') id: string) {
    return this.menusService.toggleAvailability(user.id, id);
  }

  // DELETE /api/menus/:id
  @Delete(':id')
  @Roles('owner')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.menusService.remove(user.id, id);
  }
}
