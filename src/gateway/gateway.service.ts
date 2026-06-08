import { Injectable } from '@nestjs/common';
import { CustomerGateway } from './customer.gateway';
import { DashboardGateway } from './dashboard.gateway';

// GatewayService adalah "jembatan" antara HTTP service (orders, public)
// dan Socket gateway. Service lain tinggal inject ini untuk emit event.
@Injectable()
export class GatewayService {
  constructor(
    private customerGateway: CustomerGateway,
    private dashboardGateway: DashboardGateway,
  ) {}

  // Dipanggil saat order baru dibuat (dari PublicService)
  emitNewOrder(order: any) {
    this.dashboardGateway.emitNewOrder(order);
  }

  //   Dipanggil saat order status diupdate
  emitOrderStatusUpdated(orderId: string, status: string, order: any) {
    this.customerGateway.emitStatusUpdate(orderId, status, order);
    this.dashboardGateway.emitOrderStatusUpdated(orderId, status, order);
  }
}
