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
import { AddonsService } from './addons.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('addons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner')
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  // POST /api/addons
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateAddonDto) {
    return this.addonsService.create(user.id, dto);
  }

  // GET /api/addons/menu/:menuId
  @Get('menu/:menuId')
  findByMenu(@Param('menuId') menuId: string) {
    return this.addonsService.findByMenu(menuId);
  }

  // PATCH /api/addons/:id
  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddonDto,
  ) {
    return this.addonsService.update(user.id, id, dto);
  }

  // DELETE /api/addons/:id
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addonsService.remove(user.id, id);
  }
}
