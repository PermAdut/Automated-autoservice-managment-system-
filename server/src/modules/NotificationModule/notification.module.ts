import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailService } from './email.service';
import { ScheduledNotificationsService } from './scheduled-notifications.service';
import { PredictiveMaintenanceService } from './predictive-maintenance.service';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../QueueModule/queue.module';

@Module({
  imports: [DatabaseModule, QueueModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailService,
    ScheduledNotificationsService,
    PredictiveMaintenanceService,
  ],
  exports: [NotificationService, EmailService],
})
export class NotificationModule {}
