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
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';
import { Public } from '../AuthModule/decorators/public.decorator';
import { CreateSupplierDto } from './Dto/create-supplier.dto';
import { UpdateSupplierDto } from './Dto/update-supplier.dto';
import { CreateInvoiceDto } from './Dto/create-invoice.dto';
import { UpdateInvoiceDto } from './Dto/update-invoice.dto';

@Controller('api/v1.0/supplier')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  })
)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @Public()
  async getSuppliers(
    @Query('search') search?: string,
    @Query('sortBy') sortBy: 'name' | 'id' | undefined = 'name',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    return await this.supplierService.findAll(search, sortBy, sortOrder);
  }

  @Get(':id')
  @Public()
  async getSupplierById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.supplierService.findById(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
  async createSupplier(@Body() supplierData: CreateSupplierDto) {
    return await this.supplierService.create(supplierData);
  }

  @Put(':id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async updateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() supplierData: UpdateSupplierDto
  ) {
    return await this.supplierService.update(id, supplierData);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async deleteSupplier(@Param('id', ParseUUIDPipe) id: string) {
    return await this.supplierService.delete(id);
  }

  @Get('position/:positionId/invoices')
  @Public()
  async getInvoicesByPosition(@Param('positionId', ParseUUIDPipe) positionId: string) {
    return await this.supplierService.getInvoicesByPosition(positionId);
  }

  @Get('invoice/:id')
  @Public()
  async getInvoiceById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.supplierService.getInvoiceById(id);
  }

  @Post('invoice')
  @HttpCode(201)
  @Roles('admin', 'manager')
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return await this.supplierService.createInvoice(dto);
  }

  @Put('invoice/:id')
  @HttpCode(200)
  @Roles('admin', 'manager')
  async updateInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto
  ) {
    return await this.supplierService.updateInvoice(id, dto);
  }

  @Delete('invoice/:id')
  @HttpCode(204)
  @Roles('admin')
  async deleteInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return await this.supplierService.deleteInvoice(id);
  }
}
