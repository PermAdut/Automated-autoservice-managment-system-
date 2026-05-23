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

## Пробелы

- [ ] Фильтрация KPI и отчётов по `branchId`
- [ ] Загрузка производственных постов на dashboard (посты не в схеме)
- [ ] WebSocket push для live dashboard updates
