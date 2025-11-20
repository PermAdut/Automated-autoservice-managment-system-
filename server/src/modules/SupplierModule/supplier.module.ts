import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';

@Module({
  imports: [],
  providers: [SupplierService],
  exports: [SupplierService],
  controllers: [SupplierController],
})
export class SupplierModule {}
