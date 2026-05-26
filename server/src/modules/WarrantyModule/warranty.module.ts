import { Module } from '@nestjs/common';
import { WarrantyService } from './warranty.service';
import { WarrantyController } from './warranty.controller';
import { DatabaseModule } from '../database/database.module';
import { NotificationModule } from '../NotificationModule/notification.module';

@Module({
  imports: [DatabaseModule, NotificationModule],
  controllers: [WarrantyController],
  providers: [WarrantyService],
  exports: [WarrantyService],
})
export class WarrantyModule {}
