import { Module } from '@nestjs/common';
import { SpareService } from './spare.service';
import { SpareController } from './spare.controller';
import { StockService } from './stock.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SpareController],
  providers: [SpareService, StockService],
  exports: [SpareService, StockService],
})
export class SpareModule {}
