import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/customer',
  cors: { origin: '*' },
})
export class CustomerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[Customer] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Customer] disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_order')
  handleSubscribeOrder(
    @MessageBody() data: { order_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.order_id) {
      client.emit('error', { message: 'order_id diperlukan' });
      return;
    }

    const room = `order:${data.order_id}`;
    client.join(room);
    client.emit('subscribed', {
      message: `Berhasil subscribe order ${data.order_id}`,
      room,
    });

    console.log(`[Customer] ${client.id} joined room: ${room}`);
  }

  emitStatusUpdate(orderId: string, status: string, order: any) {
    const room = `order:${orderId}`;
    this.server.to(room).emit('order_status_updated', {
      order_id: orderId,
      status,
      order,
    });
  }
}
