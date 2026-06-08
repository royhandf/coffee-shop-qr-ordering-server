import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
