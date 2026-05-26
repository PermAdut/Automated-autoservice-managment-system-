import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  notifications,
  notificationTemplates,
  notificationChannels,
  users,
} from '../database/schema';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async notifyUser(
    userId: string,
    subject: string,
    body: string,
    recipient?: string,
  ) {
    const [notification] = await this.databaseService.db
      .insert(notifications)
      .values({
        userId,
        channel: 'push',
        status: 'sent',
        subject,
        body,
        recipient: recipient ?? userId,
        sentAt: new Date(),
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

    const [notification] = await this.databaseService.db
      .insert(notifications)
      .values({
        userId,
        templateId: template.id,
        channel: template.channel === 'sms' ? 'push' : template.channel,
        status: template.channel === 'email' ? 'pending' : 'sent',
        subject: template.subject ?? undefined,
        body,
        recipient,
        sentAt: template.channel === 'email' ? undefined : new Date(),
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
      .select({
        id: notifications.id,
        userId: notifications.userId,
        templateId: notifications.templateId,
        channel: notifications.channel,
        status: notifications.status,
        subject: notifications.subject,
        body: notifications.body,
        recipient: notifications.recipient,
        sentAt: notifications.sentAt,
        errorMessage: notifications.errorMessage,
        createdAt: notifications.createdAt,
        userName: users.name,
        userSurName: users.surName,
        userEmail: users.email,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.userId, users.id))
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
    channel: 'email' | 'push';
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
    channel: 'email' | 'push',
    address: string,
  ) {
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
