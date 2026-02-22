import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from './queue.constants';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationProcessor } from './processors/notification.processor';
import { SmsService } from '../NotificationModule/sms.service';
import { EmailService } from '../NotificationModule/email.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      }),
    }),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    DatabaseModule,
  ],
  providers: [
    NotificationQueueService,
    NotificationProcessor,
    SmsService,
    EmailService,
  ],
  exports: [NotificationQueueService, BullModule],
})
export class QueueModule {}
