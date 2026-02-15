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
  Req,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from './order.service';
import { OrderResponseDto } from './Dto/order.response';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { CreateOrderDto, UpdateOrderDto } from './Dto/create-order.dto';

@Controller('api/v1.0/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private getAuth(req?: Request) {
    const authUser = (req as any)?.user as
      | { userId?: string; roleName?: string }
      | undefined;
    return {
      userId: authUser?.userId,
      role: authUser?.roleName,
    };
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('isAdmin') isAdmin?: string,
    @Req() req?: Request
  ): Promise<OrderResponseDto[]> {
    const { userId, role } = this.getAuth(req);
    const isAdminOrManager = role === 'admin' || role === 'manager';

    // Если isAdmin === 'true' из query параметров, возвращаем все заказы
    const shouldReturnAllOrders = isAdmin === 'true' || isAdminOrManager;

    return await this.orderService.findAll(
      search,
      sortBy,
      sortOrder,
      shouldReturnAllOrders ? undefined : userId
    );
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req?: Request
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.findById(id);

    const { userId, role } = this.getAuth(req);
    const isAdminOrManager = role === 'admin' || role === 'manager';

    if (!isAdminOrManager && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager', 'customer')
  async create(
    @Body() orderData: CreateOrderDto,
    @Req() req?: Request
  ): Promise<OrderResponseDto> {
    const { userId: tokenUserId } = this.getAuth(req);
    const userId = orderData.userId ?? tokenUserId;
    return await this.orderService.create({ ...orderData, userId: userId! });
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() orderData: UpdateOrderDto
  ): Promise<OrderResponseDto> {
    return await this.orderService.update(id, orderData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.orderService.delete(id);
  }
}
