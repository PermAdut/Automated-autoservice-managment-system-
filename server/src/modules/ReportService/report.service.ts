import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportService {
  constructor(private readonly databaseService: DatabaseService) {}

  private generateHtmlReport(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            box-sizing: border-box;
          }
          h1 {
            text-align: center;
            color: #2c3e50;
            margin: 20px 0;
            font-size: 24px;
          }
          .report-container {
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow: auto;
          }
          table {
            width: 100%;
            min-width: 100%;
            border-collapse: collapse;
            margin: 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            table-layout: auto;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            font-size: 14px;
            word-wrap: break-word;
          }
          th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
          }
          td {
            background-color: #fff;
          }
          tr:nth-child(even) td {
            background-color: #f9f9f9;
          }
          tr:hover td {
            background-color: #e6f3ff;
          }
          .no-data {
            text-align: center;
            padding: 20px;
            font-style: italic;
            font-size: 16px;
            color: #7f8c8d;
          }
          @media (max-width: 768px) {
            th, td {
              padding: 8px;
              font-size: 12px;
            }
            h1 {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <h1>${title}</h1>
          ${content}
        </div>
      </body>
      </html>
    `;
  }

  async generateReport(type: string): Promise<string> {
    try {
      await this.databaseService.query('BEGIN');

      let title: string;
      let content: string;

      switch (type) {
        case 'orders':
          title = 'Отчёт о заказах клиентов';
          content = await this.generateOrdersReport();
          break;
        case 'stock':
          title = 'Отчёт о запасах на складах';
          content = await this.generateStockReport();
          break;
        case 'services':
          title = 'Отчёт о доходах по услугам';
          content = await this.generateServicesReport();
          break;
        case 'employees':
          title = 'Отчёт о работе сотрудников';
          content = await this.generateEmployeesReport();
          break;
        case 'subscriptions':
          title = 'Отчёт о подписках и отзывах клиентов';
          content = await this.generateSubscriptionsReport();
          break;
        default:
          throw new BadRequestException('Invalid report type');
      }

      await this.databaseService.query('COMMIT');
      return this.generateHtmlReport(title, content);
    } catch (error) {
      await this.databaseService.query('ROLLBACK');
      console.error(`Error generating ${type} report:`, error);
      throw new BadRequestException(`Failed to generate ${type} report`);
    }
  }

  private async generateOrdersReport(): Promise<string> {
    const result = await this.databaseService.query(`
      SELECT 
        o.id AS order_id,
        u.name || ' ' || u."surName" AS client_name,
        c.name AS car_name,
        c."licensePlate",
        e.id AS employee_id,
        p.name AS employee_position,
        o.status,
        o."createdAt",
        COALESCE(
          (SELECT json_agg(json_build_object(
            'name', s.name,
            'price', s.price
          ))
          FROM public."Services_Orders" so
          JOIN public."Services" s ON so."servicesId" = s.id
          WHERE so."orderId" = o.id),
          '[]'
        ) AS services,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'name', sp.name,
            'price', sp.price
          ))
          FROM public."SparePart_Orders" spo
          JOIN public."SparePart" sp ON spo."sparePartId" = sp.id
          WHERE spo."ordersId" = o.id),
          '[]'
        ) AS spare_parts,
        pmt.amount AS payment_amount,
        pmt.status AS payment_status
      FROM public."Orders" o
      JOIN public."Users" u ON o."userId" = u.id
      JOIN public."Cars" c ON o."carId" = c.id
      LEFT JOIN public."Employees" e ON o."employeeId" = e.id
      LEFT JOIN public."Position" p ON e."positionId" = p.id
      LEFT JOIN public."Payment" pmt ON pmt."orderId" = o.id
    `);

    if (!result.length) {
      return '<p class="no-data">Нет данных для отчёта</p>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>ID заказа</th>
            <th>Клиент</th>
            <th>Автомобиль</th>
            <th>Номер</th>
            <th>Сотрудник</th>
            <th>Должность</th>
            <th>Статус</th>
            <th>Дата</th>
            <th>Услуги</th>
            <th>Запчасти</th>
            <th>Платёж</th>
            <th>Статус платежа</th>
          </tr>
        </thead>
        <tbody>
          ${result
            .map(
              (row: any) => `
                <tr>
                  <td>${row.order_id}</td>
                  <td>${row.client_name}</td>
                  <td>${row.car_name}</td>
                  <td>${row.licensePlate}</td>
                  <td>${row.employee_id || 'Не назначен'}</td>
                  <td>${row.employee_position || '-'}</td>
                  <td>${row.status}</td>
                  <td>${new Date(row.createdAt).toLocaleDateString()}</td>
                  <td>${
                    row.services
                      .map((s: any) => `${s.name} (${s.price} руб.)`)
                      .join(', ') || '-'
                  }</td>
                  <td>${
                    row.spare_parts
                      .map((sp: any) => `${sp.name} (${sp.price} руб.)`)
                      .join(', ') || '-'
                  }</td>
                  <td>${row.payment_amount || '-'}</td>
                  <td>${row.payment_status ? 'Оплачено' : 'Не оплачено'}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async generateStockReport(): Promise<string> {
    const result = await this.databaseService.query(`
      SELECT 
        s.id AS store_id,
        s.location,
        sp.id AS spare_part_id,
        sp.name AS spare_part_name,
        sp."partNumber",
        sp.price,
        c.name AS category_name,
        sps.quantity,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'supplier_name', sup.name,
            'delivery_date', pfb."deliveryDate"
          ))
          FROM public."PositionsForBuying" pfb
          JOIN public."Suppliers" sup ON pfb."supplierId" = sup.id
          WHERE pfb.id IN (
            SELECT i."positionForBuyingId"
            FROM public."Invoices" i
            WHERE i.status = 'paid'
          )),
          '[]'
        ) AS suppliers
      FROM public."SparePart_Store" sps
      JOIN public."Store" s ON sps."storeId" = s.id
      JOIN public."SparePart" sp ON sps."sparePartId" = sp.id
      JOIN public."Categories" c ON sp."categoryId" = c.id
    `);

    if (!result.length) {
      return '<p class="no-data">Нет данных для отчёта</p>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>ID склада</th>
            <th>Местоположение</th>
            <th>Запчасть</th>
            <th>Артикул</th>
            <th>Категория</th>
            <th>Количество</th>
            <th>Цена (руб.)</th>
            <th>Поставщики</th>
          </tr>
        </thead>
        <tbody>
          ${result
            .map(
              (row: any) => `
                <tr>
                  <td>${row.store_id}</td>
                  <td>${row.location}</td>
                  <td>${row.spare_part_name}</td>
                  <td>${row.partNumber}</td>
                  <td>${row.category_name}</td>
                  <td>${row.quantity}</td>
                  <td>${row.price}</td>
                  <td>${
                    row.suppliers
                      .map(
                        (sup: any) =>
                          `${sup.supplier_name} (${new Date(sup.delivery_date).toLocaleDateString()})`
                      )
                      .join(', ') || '-'
                  }</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private async generateServicesReport(): Promise<string> {
    const result = await this.databaseService.query(`
      SELECT 
        s.id AS service_id,
        s.name AS service_name,
        s.description,
        COUNT(so."orderId") AS order_count,
        SUM(s.price * so.quantity) AS total_revenue,
        AVG(s.price) AS avg_price
      FROM public."Services" s
      JOIN public."Services_Orders" so ON s.id = so."servicesId"
      JOIN public."Orders" o ON so."orderId" = o.id
      JOIN public."Payment" pmt ON pmt."orderId" = o.id
      WHERE pmt.status = TRUE
      GROUP BY s.id, s.name, s.description
    `);

    if (!result.length) {
      return '<p class="no-data">Нет данных для отчёта</p>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>ID услуги</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Количество заказов</th>
            <th>Общий доход (руб.)</th>
            <th>Средняя цена (руб.)</th>
          </tr>
        </thead>
        <tbody>
          ${result
            .map(
              (row: any) => `
                <tr>
                  <td>${row.service_id}</td>
                  <td>${row.service_name}</td>
                  <td>${row.description}</td>
                  <td>${row.order_count}</td>
                  <td>${row.total_revenue}</td>
                  <td>${Math.round(row.avg_price)}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private async generateEmployeesReport(): Promise<string> {
    const result = await this.databaseService.query(`
      SELECT 
        e.id AS employee_id,
        p.name AS position_name,
        e."hireDate",
        e.salary,
        COUNT(o.id) AS order_count,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'start_time', ws."startTime",
            'end_time', ws."endTime",
            'is_available', ws."isAvailable"
          ))
          FROM public."WorkSchedule" ws
          WHERE ws."employeeId" = e.id),
          '[]'
        ) AS schedule
      FROM public."Employees" e
      JOIN public."Position" p ON e."positionId" = p.id
      LEFT JOIN public."Orders" o ON o."employeeId" = e.id
      GROUP BY e.id, p.name, e."hireDate", e.salary
    `);

    if (!result.length) {
      return '<p class="no-data">Нет данных для отчёта</p>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>ID сотрудника</th>
            <th>Должность</th>
            <th>Дата найма</th>
            <th>Зарплата (руб.)</th>
            <th>Количество заказов</th>
            <th>Расписание</th>
          </tr>
        </thead>
        <tbody>
          ${result
            .map(
              (row: any) => `
                <tr>
                  <td>${row.employee_id}</td>
                  <td>${row.position_name}</td>
                  <td>${new Date(row.hireDate).toLocaleDateString()}</td>
                  <td>${row.salary}</td>
                  <td>${row.order_count}</td>
                  <td>${
                    row.schedule
                      .map(
                        (ws: any) =>
                          `${new Date(ws.start_time).toLocaleString()} - ${new Date(ws.end_time).toLocaleString()} (${
                            ws.is_available ? 'Доступен' : 'Недоступен'
                          })`
                      )
                      .join(', ') || '-'
                  }</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private async generateSubscriptionsReport(): Promise<string> {
    const result = await this.databaseService.query(`
      SELECT 
        u.id AS user_id,
        u.name || ' ' || u."surName" AS client_name,
        s.id AS subscription_id,
        s."subscriptonName" AS subscription_name,
        s."subscriptionDescription",
        s."dateStart",
        s."dateEnd",
        COALESCE(
          (SELECT json_agg(json_build_object(
            'description', r.description,
            'rate', r.rate,
            'createdAt', r."createdAt"
          ))
          FROM public."Reviews" r
          WHERE r."userId" = u.id AND r."deletedAt" IS NULL),
          '[]'
        ) AS reviews
      FROM public."Users" u
      JOIN public."Subscriptions" s ON s."userId" = u.id
      WHERE s."dateEnd" > CURRENT_TIMESTAMP
    `);

    if (!result.length) {
      return '<p class="no-data">Нет данных для отчёта</p>';
    }

    return `
      <table>
        <thead>
          <tr>
            <th>ID клиента</th>
            <th>Клиент</th>
            <th>ID подписки</th>
            <th>Название подписки</th>
            <th>Описание</th>
            <th>Начало</th>
            <th>Окончание</th>
            <th>Отзывы</th>
          </tr>
        </thead>
        <tbody>
          ${result
            .map(
              (row: any) => `
                <tr>
                  <td>${row.user_id}</td>
                  <td>${row.client_name}</td>
                  <td>${row.subscription_id}</td>
                  <td>${row.subscription_name}</td>
                  <td>${row.subscriptionDescription}</td>
                  <td>${new Date(row.dateStart).toLocaleDateString()}</td>
                  <td>${new Date(row.dateEnd).toLocaleDateString()}</td>
                  <td>${
                    row.reviews
                      .map(
                        (r: any) =>
                          `${r.description} (Рейтинг: ${r.rate}, ${new Date(r.createdAt).toLocaleDateString()})`
                      )
                      .join(', ') || '-'
                  }</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }
}
