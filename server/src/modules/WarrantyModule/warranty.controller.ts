import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WarrantyService } from './warranty.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Warranty')
@UseGuards(JwtAuthGuard)
@Controller('warranty')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Get('active')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all active warranties' })
  findActive() {
    return this.warrantyService.findActive();
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get warranties for an order' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.warrantyService.findByOrder(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warranty by ID' })
  findOne(@Param('id') id: string) {
    return this.warrantyService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Issue warranty for an order' })
  create(@Body() body: any) {
    return this.warrantyService.create(body);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update warranty status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'expired' | 'claimed' | 'voided' },
  ) {
    return this.warrantyService.updateStatus(id, body.status);
  }

  @Get('claims/my')
  @ApiOperation({ summary: 'Get warranty claims for current user' })
  getMyClaims(@Request() req: any) {
    return this.warrantyService.getUserClaims(req.user.id);
  }

  @Get('claims')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all warranty claims (admin/manager)' })
  getClaims(@Query('warrantyId') warrantyId?: string) {
    return this.warrantyService.getClaims(warrantyId);
  }

  @Post('claims')
  @ApiOperation({ summary: 'File a warranty claim' })
  createClaim(@Request() req: any, @Body() body: any) {
    return this.warrantyService.createClaim({
      ...body,
      userId: req.user.id,
    });
  }

  @Patch('claims/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update warranty claim status' })
  updateClaimStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'under_review' | 'approved' | 'rejected' | 'resolved';
      resolution?: string;
    },
  ) {
    return this.warrantyService.updateClaimStatus(id, body.status, body.resolution);
  }
}
