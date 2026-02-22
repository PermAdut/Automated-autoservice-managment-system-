import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Promotions')
@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('discounts/active')
  @ApiOperation({ summary: 'Get currently active discounts' })
  getActiveDiscounts() {
    return this.promotionsService.findActiveDiscounts();
  }

  @Get('discounts')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all discounts (admin/manager)' })
  getAllDiscounts() {
    return this.promotionsService.findAll();
  }

  @Post('discounts')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create discount' })
  createDiscount(@Body() body: any) {
    return this.promotionsService.createDiscount(body);
  }

  @Patch('discounts/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update discount' })
  updateDiscount(@Param('id') id: string, @Body() body: any) {
    return this.promotionsService.updateDiscount(id, body);
  }

  @Post('discounts/apply')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Apply discount code to an order' })
  applyDiscount(
    @Body() body: { orderId: string; discountCode: string; orderAmount: number },
  ) {
    return this.promotionsService.applyDiscountToOrder(
      body.orderId,
      body.discountCode,
      body.orderAmount,
    );
  }

  @Get('loyalty/my')
  @ApiOperation({ summary: 'Get current user loyalty program info' })
  getMyLoyalty(@Request() req: any) {
    return this.promotionsService.getLoyaltyByUser(req.user.id);
  }

  @Get('loyalty/my/transactions')
  @ApiOperation({ summary: 'Get current user loyalty transactions' })
  getMyTransactions(@Request() req: any) {
    return this.promotionsService.getLoyaltyTransactions(req.user.id);
  }

  @Post('loyalty/add-points')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Add loyalty points to user' })
  addPoints(
    @Body()
    body: {
      userId: string;
      points: number;
      type: 'earn' | 'bonus' | 'adjustment';
      orderId?: string;
      description?: string;
    },
  ) {
    return this.promotionsService.addPoints(
      body.userId,
      body.points,
      body.type,
      body.orderId,
      body.description,
    );
  }

  @Post('loyalty/spend-points')
  @ApiOperation({ summary: 'Spend loyalty points (current user)' })
  spendPoints(
    @Request() req: any,
    @Body() body: { points: number; orderId?: string; description?: string },
  ) {
    return this.promotionsService.spendPoints(
      req.user.id,
      body.points,
      body.orderId,
      body.description,
    );
  }
}
