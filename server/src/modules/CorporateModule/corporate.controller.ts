import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CorporateService } from './corporate.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Corporate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
@Controller('corporate')
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
  create(@Body() body: any) {
    return this.corporateService.create(body);
  }

  @Patch('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.corporateService.update(id, body);
  }

  @Get('companies/:id/contracts')
  @ApiOperation({ summary: 'Get contracts for company' })
  getContracts(@Param('id') id: string) {
    return this.corporateService.getContracts(id);
  }

  @Post('companies/:id/contracts')
  @ApiOperation({ summary: 'Create contract for company' })
  createContract(@Param('id') id: string, @Body() body: any) {
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
}
