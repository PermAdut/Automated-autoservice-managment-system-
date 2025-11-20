import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResponseDto } from './Dto/order.response';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';

@Controller('api/v1.0/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Public()
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<OrderResponseDto[]> {
    return await this.orderService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  @Public()
  async findById(@Param('id') id: string): Promise<OrderResponseDto> {
    return await this.orderService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager', 'customer')
  async create(@Body() orderData: any): Promise<OrderResponseDto> {
    return await this.orderService.create(orderData);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() orderData: any
  ): Promise<OrderResponseDto> {
    return await this.orderService.update(id, orderData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.orderService.delete(id);
  }
}
