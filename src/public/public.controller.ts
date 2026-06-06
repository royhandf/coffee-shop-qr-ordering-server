import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // GET /api/public/menu?token=<qr_token>
  @Get('menu')
  getMenu(@Query('token') token: string) {
    return this.publicService.getMenuByToken(token);
  }

  // POST /api/public/orders
  // Body: { qr_token, customer_name?, note?, items: [...] }
  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.publicService.createOrder(dto);
  }

  // GET /api/public/orders/:id
  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.publicService.getOrderById(id);
  }
}
