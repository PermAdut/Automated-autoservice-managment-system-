import { Injectable, Logger } from '@nestjs/common';

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * SMS.ru integration service
 * Docs: https://sms.ru/api/send
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiId = process.env.SMS_RU_API_ID;
  private readonly baseUrl = 'https://sms.ru/sms/send';

  async send(phone: string, message: string): Promise<SmsSendResult> {
    if (!this.apiId) {
      this.logger.warn('SMS_RU_API_ID not configured, SMS skipped');
      return { success: false, error: 'SMS service not configured' };
    }

    const isTest = process.env.NODE_ENV !== 'production' ? '1' : '0';
    const url = new URL(this.baseUrl);
    url.searchParams.set('api_id', this.apiId);
    url.searchParams.set('to', phone);
    url.searchParams.set('msg', message);
    url.searchParams.set('json', '1');
    url.searchParams.set('test', isTest);

    try {
      const response = await fetch(url.toString());
      const data = (await response.json());

      if (data.status === 'OK') {
        const firstPhone = Object.keys(data.sms)[0];
        const smsResult = data.sms[firstPhone];

        if (smsResult.status === 'OK') {
          this.logger.log(`SMS sent to ${phone}, id=${smsResult.sms_id}`);
          return { success: true, messageId: smsResult.sms_id };
        }

        this.logger.warn(`SMS failed for ${phone}: ${smsResult.status_text}`);
        return { success: false, error: smsResult.status_text };
      }

      this.logger.error(`SMS API error: ${data.status_text}`);
      return { success: false, error: data.status_text };
    } catch (err) {
      this.logger.error(`SMS request failed: ${err}`);
      return { success: false, error: String(err) };
    }
  }

  formatOrderStatusMessage(orderStatus: string, orderNumber: string): string {
    const statusMap: Record<string, string> = {
      pending: 'принят в обработку',
      in_progress: 'в работе',
      completed: 'готов к выдаче',
      cancelled: 'отменён',
    };
    const label = statusMap[orderStatus] ?? orderStatus;
    return `АвтоСервис: заказ #${orderNumber} ${label}`;
  }

  formatAppointmentConfirmation(code: string, dateStr: string): string {
    return `АвтоСервис: запись подтверждена на ${dateStr}. Код: ${code}`;
  }
}
