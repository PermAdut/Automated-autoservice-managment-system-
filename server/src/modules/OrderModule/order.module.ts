import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, DatabaseService],
  exports: [OrderService],
})
export class OrderModule {}
