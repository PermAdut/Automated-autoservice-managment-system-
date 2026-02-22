import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';
import { ScheduledNotificationsService } from './scheduled-notifications.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    SmsService,
    EmailService,
    ScheduledNotificationsService,
  ],
  exports: [NotificationService, SmsService, EmailService],
})
export class NotificationModule {}
