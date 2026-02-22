import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  notifications,
  notificationTemplates,
  notificationChannels,
} from '../database/schema';
import { eq, desc, and } from 'drizzle-orm';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly smsService: SmsService,
  ) {}

  async sendSms(userId: string, phone: string, message: string) {
    const result = await this.smsService.send(phone, message);

    const [notification] = await this.databaseService.db
      .insert(notifications)
      .values({
        userId,
        channel: 'sms',
        status: result.success ? 'sent' : 'failed',
        body: message,
        recipient: phone,
        sentAt: result.success ? new Date() : undefined,
        errorMessage: result.error,
      })
      .returning();

    return notification;
  }

  async sendFromTemplate(
    userId: string,
    templateName: string,
    recipient: string,
    variables: Record<string, string> = {},
  ) {
    const [template] = await this.databaseService.db
      .select()
      .from(notificationTemplates)
      .where(
        and(
          eq(notificationTemplates.name, templateName),
          eq(notificationTemplates.isActive, true),
        ),
      )
      .limit(1);

    if (!template) {
      throw new NotFoundException(`Template "${templateName}" not found`);
    }

    let body = template.body;
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    if (template.channel === 'sms') {
      return this.sendSms(userId, recipient, body);
    }

    // For email/push — save as pending for future integration
    const [notification] = await this.databaseService.db
      .insert(notifications)
      .values({
        userId,
        templateId: template.id,
        channel: template.channel,
        status: 'pending',
        subject: template.subject ?? undefined,
        body,
        recipient,
      })
      .returning();

    return notification;
  }

  async findByUser(userId: string) {
    return this.databaseService.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async findAll(limit = 50) {
    return this.databaseService.db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getTemplates() {
    return this.databaseService.db
      .select()
      .from(notificationTemplates)
      .orderBy(notificationTemplates.name);
  }

  async createTemplate(data: {
    name: string;
    channel: 'email' | 'sms' | 'push';
    subject?: string;
    body: string;
    variables?: string;
  }) {
    const [created] = await this.databaseService.db
      .insert(notificationTemplates)
      .values(data)
      .returning();
    return created;
  }

  async getUserChannels(userId: string) {
    return this.databaseService.db
      .select()
      .from(notificationChannels)
      .where(eq(notificationChannels.userId, userId));
  }

  async upsertChannel(
    userId: string,
    channel: 'email' | 'sms' | 'push',
    address: string,
  ) {
    // Delete existing for same user+channel, then insert
    await this.databaseService.db
      .delete(notificationChannels)
      .where(
        and(
          eq(notificationChannels.userId, userId),
          eq(notificationChannels.channel, channel),
        ),
      );

    const [created] = await this.databaseService.db
      .insert(notificationChannels)
      .values({ userId, channel, address })
      .returning();

    return created;
  }
}
