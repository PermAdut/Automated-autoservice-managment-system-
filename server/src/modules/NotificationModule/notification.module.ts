import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SmsService } from './sms.service';
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
    SmsService,
    EmailService,
    ScheduledNotificationsService,
    PredictiveMaintenanceService,
  ],
  exports: [NotificationService, SmsService, EmailService],
})
export class NotificationModule {}
