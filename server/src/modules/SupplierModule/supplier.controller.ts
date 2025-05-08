import { Controller, Get } from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Controller('api/v1.0/supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  async getSuppliers() {
    return await this.supplierService.findAll();
  }
}
