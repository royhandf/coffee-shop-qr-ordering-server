import { CustomerGateway } from './customer.gateway';
import { Module } from '@nestjs/common';
import { DashboardGateway } from './dashboard.gateway';
import { GatewayService } from './gateway.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CustomerGateway, DashboardGateway, GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
