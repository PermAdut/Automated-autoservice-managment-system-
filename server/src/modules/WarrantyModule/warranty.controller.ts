import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WarrantyService } from './warranty.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../AuthModule/types/auth.types';

@ApiTags('Warranty')
@UseGuards(JwtAuthGuard)
@Controller('api/v1.0/warranty')
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
  create(@Body() body: {
    orderId: string;
    sparePartId?: string;
    type: 'work' | 'spare_part' | 'complex';
    description?: string;
    durationMonths: number;
  }) {
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
  getMyClaims(@Request() req: AuthenticatedRequest) {
    return this.warrantyService.getUserClaims(req.user.userId);
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
  createClaim(
    @Request() req: AuthenticatedRequest,
    @Body() body: { warrantyId: string; description: string },
  ) {
    return this.warrantyService.createClaim({
      ...body,
      userId: req.user.userId,
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

  @Get(':id/certificate')
  @ApiOperation({ summary: 'Download warranty certificate as PDF' })
  async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.warrantyService.generateCertificatePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="warranty-${id.slice(0, 8)}.pdf"`,
    );
    res.send(pdf);
  }
}
