import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportData {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
}

@Injectable()
export class ReportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async generateReport(type: string): Promise<ReportData> {
    switch (type) {
      case 'orders':
        return this.generateOrdersReport();
      case 'stock':
        return this.generateStockReport();
      case 'services':
        return this.generateServicesReport();
      case 'employees':
        return this.generateEmployeesReport();
      case 'subscriptions':
        return this.generateSubscriptionsReport();
      default:
        throw new BadRequestException('Invalid report type');
    }
  }

  private async generateOrdersReport(): Promise<ReportData> {
    const result = await this.databaseService.query(`
      SELECT
        o.id AS order_id,
        u.name || ' ' || u."surName" AS client_name,
        c.brand || ' ' || c.model AS car_name,
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
          FROM autoservice."Services_Orders" so
          JOIN autoservice."Services" s ON so."servicesId" = s.id
          WHERE so."orderId" = o.id),
          '[]'
        ) AS services,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'name', sp.name,
            'price', sp.price
          ))
          FROM autoservice."SparePart_Orders" spo
          JOIN autoservice."SparePart" sp ON spo."sparePartId" = sp.id
          WHERE spo."ordersId" = o.id),
          '[]'
        ) AS spare_parts,
        pmt.amount AS payment_amount,
        pmt.status AS payment_status
      FROM autoservice."Orders" o
      JOIN autoservice."Users" u ON o."userId" = u.id
      JOIN autoservice."Cars" c ON o."carId" = c.id
      LEFT JOIN autoservice."Employees" e ON o."employeeId" = e.id
      LEFT JOIN autoservice."Position" p ON e."positionId" = p.id
      LEFT JOIN autoservice."Payment" pmt ON pmt."orderId" = o.id
    `);

    const rows = (result.rows || []).map((row: Record<string, unknown>) => {
      const services = Array.isArray(row.services)
        ? (row.services as Array<{ name: string; price: number }>)
            .map((s) => `${s.name} (${s.price} руб.)`)
            .join(', ')
        : '-';
      const spareParts = Array.isArray(row.spare_parts)
        ? (row.spare_parts as Array<{ name: string; price: number }>)
            .map((sp) => `${sp.name} (${sp.price} руб.)`)
            .join(', ')
        : '-';
      const paymentStatus =
        row.payment_status === null || row.payment_status === undefined
          ? 'Нет платежа'
          : row.payment_status
            ? 'Оплачено'
            : 'Не оплачено';

      return {
        order_id: (row.order_id as string).slice(0, 8),
        client_name: row.client_name,
        car_name: row.car_name,
        licensePlate: row.licensePlate || '-',
        employee_id: row.employee_id
          ? (row.employee_id as string).slice(0, 8)
          : 'Не назначен',
        employee_position: row.employee_position || '-',
        status: row.status,
        createdAt: new Date(row.createdAt as string).toLocaleDateString('ru-RU'),
        services,
        spare_parts: spareParts,
        payment_amount: row.payment_amount || '-',
        payment_status: paymentStatus,
      };
    });

    return {
      title: 'Отчёт о заказах клиентов',
      columns: [
        { key: 'order_id', label: 'ID заказа' },
        { key: 'client_name', label: 'Клиент' },
        { key: 'car_name', label: 'Автомобиль' },
        { key: 'licensePlate', label: 'Номер' },
        { key: 'employee_id', label: 'Сотрудник' },
        { key: 'employee_position', label: 'Должность' },
        { key: 'status', label: 'Статус' },
        { key: 'createdAt', label: 'Дата' },
        { key: 'services', label: 'Услуги' },
        { key: 'spare_parts', label: 'Запчасти' },
        { key: 'payment_amount', label: 'Платёж' },
        { key: 'payment_status', label: 'Статус платежа' },
      ],
      rows,
    };
  }

  private async generateStockReport(): Promise<ReportData> {
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
          FROM autoservice."PositionsForBuying" pfb
          JOIN autoservice."Suppliers" sup ON pfb."supplierId" = sup.id
          WHERE pfb.id IN (
            SELECT i."positionForBuyingId"
            FROM autoservice."Invoices" i
            WHERE i.status = 'paid'
          )),
          '[]'
        ) AS suppliers
      FROM autoservice."SparePart_Store" sps
      JOIN autoservice."Store" s ON sps."storeId" = s.id
      JOIN autoservice."SparePart" sp ON sps."sparePartId" = sp.id
      JOIN autoservice."Categories" c ON sp."categoryId" = c.id
    `);

    const rows = (result.rows || []).map((row: Record<string, unknown>) => {
      const suppliers = Array.isArray(row.suppliers)
        ? (row.suppliers as Array<{ supplier_name: string; delivery_date: string }>)
            .map(
              (sup) =>
                `${sup.supplier_name} (${new Date(sup.delivery_date).toLocaleDateString('ru-RU')})`,
            )
            .join(', ')
        : '-';

      return {
        store_id: (row.store_id as string).slice(0, 8),
        location: row.location,
        spare_part_name: row.spare_part_name,
        partNumber: row.partNumber,
        category_name: row.category_name,
        quantity: row.quantity,
        price: row.price,
        suppliers,
      };
    });

    return {
      title: 'Отчёт о запасах на складах',
      columns: [
        { key: 'store_id', label: 'ID склада' },
        { key: 'location', label: 'Местоположение' },
        { key: 'spare_part_name', label: 'Запчасть' },
        { key: 'partNumber', label: 'Артикул' },
        { key: 'category_name', label: 'Категория' },
        { key: 'quantity', label: 'Количество' },
        { key: 'price', label: 'Цена (руб.)' },
        { key: 'suppliers', label: 'Поставщики' },
      ],
      rows,
    };
  }

  private async generateServicesReport(): Promise<ReportData> {
    const result = await this.databaseService.query(`
      SELECT
        s.id AS service_id,
        s.name AS service_name,
        s.description,
        COUNT(so."orderId") AS order_count,
        SUM(s.price * so.quantity) AS total_revenue,
        AVG(s.price) AS avg_price
      FROM autoservice."Services" s
      JOIN autoservice."Services_Orders" so ON s.id = so."servicesId"
      JOIN autoservice."Orders" o ON so."orderId" = o.id
      JOIN autoservice."Payment" pmt ON pmt."orderId" = o.id
      WHERE pmt.status = TRUE
      GROUP BY s.id, s.name, s.description
    `);

    const rows = (result.rows || []).map((row: Record<string, unknown>) => ({
      service_id: (row.service_id as string).slice(0, 8),
      service_name: row.service_name,
      description: row.description || '-',
      order_count: row.order_count,
      total_revenue: row.total_revenue || '0',
      avg_price: Math.round(Number(row.avg_price) || 0),
    }));

    return {
      title: 'Отчёт о доходах по услугам',
      columns: [
        { key: 'service_id', label: 'ID услуги' },
        { key: 'service_name', label: 'Название' },
        { key: 'description', label: 'Описание' },
        { key: 'order_count', label: 'Кол-во заказов' },
        { key: 'total_revenue', label: 'Общий доход (руб.)' },
        { key: 'avg_price', label: 'Средняя цена (руб.)' },
      ],
      rows,
    };
  }

  private async generateEmployeesReport(): Promise<ReportData> {
    const result = await this.databaseService.query(`
      SELECT
        e.id AS employee_id,
        e.name || ' ' || e."surName" AS employee_name,
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
          FROM autoservice."WorkSchedule" ws
          WHERE ws."employeeId" = e.id),
          '[]'
        ) AS schedule
      FROM autoservice."Employees" e
      JOIN autoservice."Position" p ON e."positionId" = p.id
      LEFT JOIN autoservice."Orders" o ON o."employeeId" = e.id
      GROUP BY e.id, e.name, e."surName", p.name, e."hireDate", e.salary
    `);

    const rows = (result.rows || []).map((row: Record<string, unknown>) => {
      const schedule = Array.isArray(row.schedule)
        ? (row.schedule as Array<{ start_time: string; end_time: string; is_available: boolean }>)
            .map(
              (ws) =>
                `${new Date(ws.start_time).toLocaleString('ru-RU')} - ${new Date(ws.end_time).toLocaleString('ru-RU')} (${ws.is_available ? 'Доступен' : 'Недоступен'})`,
            )
            .join('; ')
        : '-';

      return {
        employee_id: (row.employee_id as string).slice(0, 8),
        employee_name: row.employee_name,
        position_name: row.position_name,
        hireDate: new Date(row.hireDate as string).toLocaleDateString('ru-RU'),
        salary: row.salary,
        order_count: row.order_count,
        schedule,
      };
    });

    return {
      title: 'Отчёт о работе сотрудников',
      columns: [
        { key: 'employee_id', label: 'ID сотрудника' },
        { key: 'employee_name', label: 'ФИО' },
        { key: 'position_name', label: 'Должность' },
        { key: 'hireDate', label: 'Дата найма' },
        { key: 'salary', label: 'Зарплата (руб.)' },
        { key: 'order_count', label: 'Кол-во заказов' },
        { key: 'schedule', label: 'Расписание' },
      ],
      rows,
    };
  }

  private async generateSubscriptionsReport(): Promise<ReportData> {
    const result = await this.databaseService.query(`
      SELECT
        u.id AS user_id,
        u.name || ' ' || u."surName" AS client_name,
        s.id AS subscription_id,
        s."subscriptionName" AS subscription_name,
        s."subscriptionDescription",
        s."dateStart",
        s."dateEnd",
        s."employeeId",
        CASE
          WHEN s."employeeId" IS NOT NULL THEN e.name || ' ' || e."surName"
          ELSE NULL
        END AS employee_name,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'description', r.description,
            'rate', r.rate,
            'createdAt', r."createdAt",
            'employeeId', r."employeeId"
          ))
          FROM autoservice."Reviews" r
          WHERE r."userId" = u.id
            AND r."deletedAt" IS NULL
            AND (
              (s."employeeId" IS NOT NULL AND r."employeeId" = s."employeeId")
              OR
              (s."employeeId" IS NULL)
            )),
          '[]'
        ) AS reviews
      FROM autoservice."Users" u
      JOIN autoservice."Subscriptions" s ON s."userId" = u.id
      LEFT JOIN autoservice."Employees" e ON s."employeeId" = e.id
      WHERE s."dateEnd" > CURRENT_TIMESTAMP
    `);

    const rows = (result.rows || []).map((row: Record<string, unknown>) => {
      const reviews = Array.isArray(row.reviews)
        ? (row.reviews as Array<{ description: string; rate: number; createdAt: string; employeeId: string | null }>)
            .map((r) => {
              const dateStr = new Date(r.createdAt).toLocaleDateString('ru-RU');
              return `${r.description || 'Без описания'} (Рейтинг: ${r.rate}, ${dateStr})`;
            })
            .join('; ')
        : '-';

      return {
        user_id: (row.user_id as string).slice(0, 8),
        client_name: row.client_name,
        subscription_id: (row.subscription_id as string).slice(0, 8),
        subscription_name: row.subscription_name,
        subscriptionDescription: row.subscriptionDescription || '-',
        employee_name: row.employee_name || 'Общая подписка',
        dateStart: new Date(row.dateStart as string).toLocaleDateString('ru-RU'),
        dateEnd: new Date(row.dateEnd as string).toLocaleDateString('ru-RU'),
        reviews,
      };
    });

    return {
      title: 'Отчёт о подписках и отзывах клиентов',
      columns: [
        { key: 'user_id', label: 'ID клиента' },
        { key: 'client_name', label: 'Клиент' },
        { key: 'subscription_id', label: 'ID подписки' },
        { key: 'subscription_name', label: 'Название' },
        { key: 'subscriptionDescription', label: 'Описание' },
        { key: 'employee_name', label: 'Рабочий' },
        { key: 'dateStart', label: 'Начало' },
        { key: 'dateEnd', label: 'Окончание' },
        { key: 'reviews', label: 'Отзывы' },
      ],
      rows,
    };
  }
}
