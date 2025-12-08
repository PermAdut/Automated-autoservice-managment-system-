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
import { CreateOrderDto, UpdateOrderDto } from './Dto/create-order.dto';
import { ParseIntPipe } from '@nestjs/common';

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
  async findById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<OrderResponseDto> {
    return await this.orderService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager', 'customer')
  async create(@Body() orderData: CreateOrderDto): Promise<OrderResponseDto> {
    return await this.orderService.create(orderData);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() orderData: UpdateOrderDto
  ): Promise<OrderResponseDto> {
    return await this.orderService.update(id, orderData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.orderService.delete(id);
  }
}
