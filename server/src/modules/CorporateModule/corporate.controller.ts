import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CorporateService } from './corporate.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Corporate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('api/v1.0/corporate')
export class CorporateController {
  constructor(private readonly corporateService: CorporateService) {}

  @Get('companies')
  @ApiOperation({ summary: 'List all companies' })
  findAll() {
    return this.corporateService.findAll();
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID' })
  findOne(@Param('id') id: string) {
    return this.corporateService.findById(id);
  }

  @Post('companies')
  @Roles('admin')
  @ApiOperation({ summary: 'Create company' })
  create(@Body() body: {
    name: string;
    inn?: string;
    address?: string;
    city?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    managerUserId?: string;
    bankAccount?: string;
    bic?: string;
  }) {
    return this.corporateService.create(body);
  }

  @Patch('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  update(@Param('id') id: string, @Body() body: Partial<{
    name: string;
    inn: string;
    address: string;
    city: string;
    contactPerson: string;
    phone: string;
    email: string;
    managerUserId: string;
    bankAccount: string;
    bic: string;
    isActive: boolean;
  }>) {
    return this.corporateService.update(id, body);
  }

  @Get('companies/:id/contracts')
  @ApiOperation({ summary: 'Get contracts for company' })
  getContracts(@Param('id') id: string) {
    return this.corporateService.getContracts(id);
  }

  @Post('companies/:id/contracts')
  @ApiOperation({ summary: 'Create contract for company' })
  createContract(@Param('id') id: string, @Body() body: {
    contractNumber?: string;
    discountPercent?: string;
    creditLimit?: string;
    paymentTermDays?: string;
    startDate: string;
    endDate: string;
    notes?: string;
  }) {
    return this.corporateService.createContract({ ...body, companyId: id });
  }

  @Patch('contracts/:contractId/status')
  @ApiOperation({ summary: 'Update contract status' })
  updateContractStatus(
    @Param('contractId') contractId: string,
    @Body()
    body: {
      status: 'draft' | 'active' | 'suspended' | 'expired' | 'terminated';
    },
  ) {
    return this.corporateService.updateContractStatus(contractId, body.status);
  }

  @Get('companies/:id/cars')
  @ApiOperation({ summary: 'Get cars assigned to company' })
  getCars(@Param('id') id: string) {
    return this.corporateService.getCompanyCars(id);
  }

  @Post('companies/:id/cars')
  @ApiOperation({ summary: 'Assign car to company' })
  addCar(
    @Param('id') id: string,
    @Body() body: { carId: string; notes?: string },
  ) {
    return this.corporateService.addCar(id, body.carId, body.notes);
  }

  @Delete('companies/:id/cars/:carId')
  @ApiOperation({ summary: 'Remove car from company' })
  removeCar(@Param('id') id: string, @Param('carId') carId: string) {
    return this.corporateService.removeCar(id, carId);
  }

  @Get('companies/:id/drivers')
  @ApiOperation({ summary: 'Get company drivers' })
  getDrivers(@Param('id') id: string) {
    return this.corporateService.getDrivers(id);
  }

  @Post('companies/:id/drivers')
  @ApiOperation({ summary: 'Assign driver to company' })
  addDriver(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.corporateService.addDriver(id, body.userId);
  }

  @Delete('companies/:id/drivers/:userId')
  @ApiOperation({ summary: 'Remove driver from company' })
  removeDriver(@Param('id') id: string, @Param('userId') userId: string) {
    return this.corporateService.removeDriver(id, userId);
  }

  @Get('companies/:id/spend')
  @ApiOperation({ summary: 'Get total spend for company' })
  getSpend(@Param('id') id: string) {
    return this.corporateService.getCompanySpend(id).then(total => ({ total }));
  }

  @Get('companies/:id/monthly-act')
  @ApiOperation({ summary: 'Download monthly act PDF' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'month', required: false })
  async downloadMonthlyAct(
    @Param('id') id: string,
    @Query('year') yearStr?: string,
    @Query('month') monthStr?: string,
    @Res() res?: Response,
  ) {
    const now = new Date();
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const pdf = await this.corporateService.generateMonthlyActPdf(id, year, month);

    res!.setHeader('Content-Type', 'application/pdf');
    res!.setHeader(
      'Content-Disposition',
      `attachment; filename="act-${id.slice(0, 8)}-${year}-${month}.pdf"`,
    );
    res!.send(pdf);
  }
}
