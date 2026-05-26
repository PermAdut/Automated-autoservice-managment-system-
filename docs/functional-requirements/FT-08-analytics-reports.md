# ФТ-8: Аналитика и отчётность

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.8

## Требование

Dashboard KPI в реальном времени, отчёты по заказам/доходам/складу/сотрудникам, фильтры, экспорт PDF/CSV, графики.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Dashboard KPI | ✅ | `GET /api/v1.0/analytics/kpi?period=` |
| Выручка по периодам | ✅ | `getDashboardKpi`, `getRevenueByMonth` |
| Top-10 услуг | ✅ | `GET /analytics/top-services?limit=10` |
| Top-10 мастеров | ✅ | `GET /analytics/top-employees?limit=10` |
| Загрузка (appointments) | ✅ | `GET /analytics/upcoming-appointments` |
| Low stock alert | ✅ | `GET /analytics/low-stock?threshold=5` |
| Отчёты (orders, revenue, stock, employees) | ✅ | `ReportService` — `/api/v1.0/reports/:type` |
| Экспорт CSV | ✅ | `GET /api/v1.0/reports/:type/csv` |
| Экспорт PDF | ✅ | `GET /api/v1.0/reports/:type/pdf` — pdfkit |
| Графики на UI | ✅ | `AnalyticsDashboard.tsx`, `ReportGenerator.tsx` |
| Real-time обновления | ⚠️ | WebSocket events в `EventsGateway`, не все KPI подписаны |
| Фильтр по филиалу | ❌ | Analytics queries без `branchId` |
| Фильтр по статусу заказов в отчётах | ⚠️ | Частично в `report.service.ts` |

### Backend

```
server/src/modules/AnalyticsModule/
├── analytics.controller.ts   # /api/v1.0/analytics
└── analytics.service.ts

server/src/modules/ReportService/
├── report.controller.ts      # /api/v1.0/reports
└── report.service.ts         # generateReport, toCsv, toPdf
```

**Analytics endpoints:**

| GET | Описание |
|---|---|
| `/analytics/kpi` | orders, revenue, newUsers, avgRating + growth |
| `/analytics/orders-by-status` | группировка по status |
| `/analytics/revenue-by-month` | 12 месяцев |
| `/analytics/top-services` | топ услуг |
| `/analytics/top-employees` | топ мастеров |
| `/analytics/low-stock` | запчасти ниже threshold |
| `/analytics/upcoming-appointments` | записи на 30 дней |
| `/analytics/loyalty-summary` | распределение по tier |

### Frontend

| Комponent | Путь |
|---|---|
| Dashboard | `frontend/src/components/Analytics/AnalyticsDashboard.tsx` |
| Генератор отчётов | `frontend/src/components/Reports/ReportGenerator.tsx` |
| API | `analyticsApi.ts`, `reportsApi.ts` |

## Тест-кейсы

### TC-8.1 Dashboard KPI

**Роль:** admin (`admin@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/analytics/kpi?period=month` | orders, revenue, newUsers, avgRating + growth |
| 2 | `GET /api/v1.0/analytics/orders-by-status` | Группировка pending/in_progress/completed |
| 3 | `GET /api/v1.0/analytics/revenue-by-month` | 12 месяцев выручки |

### TC-8.2 Фильтр по филиалу (manager)

**Роль:** manager (`manager1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/analytics/kpi?period=week` | KPI только по branchId менеджера |
| 2 | `GET /api/v1.0/analytics/top-services?limit=10` | Топ услуг в рамках филиала |
| 3 | Admin: `GET /api/v1.0/analytics/branches-comparison` | KPI по всем филиалам |

### TC-8.3 Экспорт отчётов

**Роль:** admin

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/reports/orders?from=&to=` | JSON отчёт по заказам |
| 2 | `GET /api/v1.0/reports/revenue/csv` | Content-Type text/csv |
| 3 | `GET /api/v1.0/reports/stock/pdf` | PDF buffer, status 200 |

## Пробелы

- [x] Фильтрация KPI и отчётов по `branchId` (`resolveBranchFilter`)
- [ ] Загрузка производственных постов на dashboard
- [ ] WebSocket push для live dashboard updates
