import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [],
  providers: [SupplierService, DatabaseService],
  exports: [SupplierService],
  controllers: [SupplierController],
})
export class SupplierModule {}
