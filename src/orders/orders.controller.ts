import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('owner', 'staff')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // GET /api/orders
  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.ordersService.findAll(user.id, status);
  }

  // GET /api/orders/:id
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findOne(user.id, id);
  }

  // PATCH /api/orders/:id/status
  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(user.id, id, dto);
  }

  // PATCH /api/orders/:id/cancel
  @Patch(':id/cancel')
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }
}
