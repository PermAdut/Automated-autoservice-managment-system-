import { Injectable, Logger } from '@nestjs/common';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email sending service using SMTP (Nodemailer).
 * Configure via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Supports any SMTP provider: Gmail, Yandex, Mailgun, SendGrid, etc.
 * Import nodemailer with:  npm install nodemailer @types/nodemailer
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Email sending disabled.');
      return;
    }

    try {
      // Dynamic import to avoid hard dependency if nodemailer not installed
      const nodemailer = await import('nodemailer').catch(() => null);
      if (!nodemailer) {
        this.logger.warn('nodemailer not installed. Run: npm install nodemailer @types/nodemailer');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      this.logger.log(`SMTP configured: ${host}:${port} (${user})`);
    } catch (err) {
      this.logger.error(`Failed to init SMTP: ${err}`);
    }
  }

  async send(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
  }): Promise<EmailSendResult> {
    if (!this.transporter) {
      this.logger.warn('Email skipped: SMTP not configured');
      return { success: false, error: 'SMTP not configured' };
    }

    const from = options.from ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent: ${info.messageId} → ${options.to}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      this.logger.error(`Email failed: ${err}`);
      return { success: false, error: String(err) };
    }
  }

  // Pre-built templates
  buildOrderStatusEmail(params: {
    customerName: string;
    orderNumber: string;
    status: string;
    companyName: string;
  }): { subject: string; html: string } {
    const statusLabels: Record<string, string> = {
      pending: 'принят в обработку',
      in_progress: 'в работе',
      completed: 'готов к выдаче',
      cancelled: 'отменён',
    };
    const label = statusLabels[params.status] ?? params.status;

    return {
      subject: `${params.companyName}: заказ #${params.orderNumber} — ${label}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${params.companyName}</h2>
          <p>Уважаемый(ая) ${params.customerName},</p>
          <p>Статус вашего заказа <strong>#${params.orderNumber}</strong> изменён на: <strong>${label}</strong>.</p>
          <hr/>
          <p style="color: #666; font-size: 12px;">Это автоматическое уведомление. Не отвечайте на это письмо.</p>
        </div>
      `,
    };
  }

  buildAppointmentConfirmationEmail(params: {
    customerName: string;
    dateStr: string;
    confirmationCode: string;
    serviceName?: string;
    companyName: string;
    companyPhone?: string;
  }): { subject: string; html: string } {
    return {
      subject: `${params.companyName}: запись подтверждена — ${params.dateStr}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${params.companyName}</h2>
          <p>Уважаемый(ая) ${params.customerName},</p>
          <p>Ваша запись подтверждена!</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Дата и время</td>
              <td style="padding: 8px;">${params.dateStr}</td>
            </tr>
            ${params.serviceName ? `<tr>
              <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Услуга</td>
              <td style="padding: 8px;">${params.serviceName}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px; background: #f3f4f6; font-weight: bold;">Код подтверждения</td>
              <td style="padding: 8px; font-size: 20px; font-weight: bold; color: #4f46e5;">${params.confirmationCode}</td>
            </tr>
          </table>
          ${params.companyPhone ? `<p>По вопросам звоните: <a href="tel:${params.companyPhone}">${params.companyPhone}</a></p>` : ''}
          <hr/>
          <p style="color: #666; font-size: 12px;">Это автоматическое уведомление.</p>
        </div>
      `,
    };
  }

  buildMaintenanceReminderEmail(params: {
    customerName: string;
    carInfo: string;
    reminderType: string;
    dueDate?: string;
    dueMileage?: number;
    companyName: string;
    companyPhone?: string;
  }): { subject: string; html: string } {
    const typeLabels: Record<string, string> = {
      oil_change: 'Замена масла',
      tire_rotation: 'Ротация шин',
      brake_service: 'Обслуживание тормозов',
      scheduled_maintenance: 'Плановое ТО',
      timing_belt: 'Замена ремня ГРМ',
      other: 'Техническое обслуживание',
    };
    const label = typeLabels[params.reminderType] ?? params.reminderType;

    return {
      subject: `${params.companyName}: напоминание о ТО — ${label}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">${params.companyName}</h2>
          <p>Уважаемый(ая) ${params.customerName},</p>
          <p>Напоминаем о предстоящем техническом обслуживании вашего автомобиля <strong>${params.carInfo}</strong>.</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; background: #fef3c7; font-weight: bold;">Вид работ</td>
              <td style="padding: 8px;">${label}</td>
            </tr>
            ${params.dueDate ? `<tr>
              <td style="padding: 8px; background: #fef3c7; font-weight: bold;">Срок</td>
              <td style="padding: 8px;">${params.dueDate}</td>
            </tr>` : ''}
            ${params.dueMileage ? `<tr>
              <td style="padding: 8px; background: #fef3c7; font-weight: bold;">По пробегу</td>
              <td style="padding: 8px;">${params.dueMileage.toLocaleString('ru')} км</td>
            </tr>` : ''}
          </table>
          <p>Запишитесь на удобное время на нашем сайте или по телефону${params.companyPhone ? ` <a href="tel:${params.companyPhone}">${params.companyPhone}</a>` : ''}.</p>
          <hr/>
          <p style="color: #666; font-size: 12px;">Это автоматическое напоминание.</p>
        </div>
      `,
    };
  }
}
