import { Controller, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResponseDto } from './Dto/order.response';

@Controller('api/v1.0/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    return await this.orderService.findAll();
  }
}
