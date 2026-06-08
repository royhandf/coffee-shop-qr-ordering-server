import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

const DASHBOARD_ROOM = 'dashboard';

@WebSocketGateway({
  namespace: '/dashboard',
  cors: { origin: '*' },
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!token) throw new UnauthorizedException('Token tidak ada');

      const cleanToken = token.replace('Bearer ', '');
      const payload = this.jwtService.verify(cleanToken);

      client.data.user = payload;
      console.log(`[Dashboard] connected: ${client.id} (${payload.email})`);
    } catch {
      console.log(`[Dashboard] unauthorized, disconnecting ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Dashboard] disconnected: ${client.id}`);
  }

  // Staff join room dashboard agar dapat semua broadcast order
  @SubscribeMessage('join_dashboard')
  handleJoinDashboard(@ConnectedSocket() client: Socket) {
    client.join(DASHBOARD_ROOM);
    client.emit('joined', {
      message: 'Berhasil join dashboard',
      user: client.data.user,
    });
    console.log(`[Dashboard] ${client.data.user?.email} joined dashboard`);
  }

  emitNewOrder(order: any) {
    this.server.to(DASHBOARD_ROOM).emit('new_order', { order });
  }

  emitOrderStatusUpdated(orderId: string, status: string, order: any) {
    this.server.to(DASHBOARD_ROOM).emit('order_status_updated', {
      order_id: orderId,
      status,
      order,
    });
  }
}
