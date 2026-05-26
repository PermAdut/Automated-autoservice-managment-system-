import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from '../database/database.module';
import { SpareModule } from '../SpareModule/spare.module';
import { NotificationModule } from '../NotificationModule/notification.module';
import { ScheduleOptimizationModule } from '../ScheduleModule/schedule.module';
import { PromotionsModule } from '../PromotionsModule/promotions.module';
import { CorporateModule } from '../CorporateModule/corporate.module';
import { WarrantyModule } from '../WarrantyModule/warranty.module';

@Module({
  imports: [
    DatabaseModule,
    SpareModule,
    NotificationModule,
    PromotionsModule,
    CorporateModule,
    WarrantyModule,
    forwardRef(() => ScheduleOptimizationModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
