# ФТ-9: Алгоритм предиктивного технического обслуживания

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.9

## Требование

Nightly-алгоритм: средний пробег → прогноз интервалов ТО → рекомендации при <10% остатка → уведомления → UI с записью → без дублей → настройка нормативов админом.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Автозапуск 1 раз в сутки | ✅ | `@Cron('0 2 * * *')` — `predictive-maintenance.service.ts` |
| Средний пробег (3 последних записи) | ✅ | `processCarPrediction()` — diagnostic sessions |
| Прогноз по km и months | ✅ | `SERVICE_NORMS` + `THRESHOLD = 0.10` |
| Список рекомендаций | ✅ | `MaintenanceReminders` — type, dueDate, dueMileage, reason |
| Email / in-app уведомления | ✅ | `NotificationQueueService` → BullMQ worker |
| Без повторных уведомлений | ✅ | `maintenanceReminders.isSent` |
| Cron отправки reminders | ✅ | `ScheduledNotificationsService` — `@Cron('0 9 * * *')` |
| Нормативы по марке/модели (admin) | - это окей | Константы `SERVICE_NORMS` в коде |
| UI рекомендаций + кнопка записи | ⚠️ | API notifications есть; отдельной страницы клиента может не быть |
| Push-уведомления | ⚠️ | WebSocket через `EventsGateway`; native push — нет |

### Backend

```
server/src/modules/NotificationModule/
├── predictive-maintenance.service.ts   # FT-9 core algorithm
├── scheduled-notifications.service.ts  # cron → queue
├── notification.service.ts
├── email.service.ts
└── sms.service.ts

server/src/modules/QueueModule/
├── services/notification-queue.service.ts
└── processors/notification.processor.ts  # worker
```

### БД

| Таблица | Назначение |
|---|---|
| `MaintenanceReminders` | userId, carId, type, dueDate, dueMileage, isSent, isCompleted |
| `DiagnosticSessions` | mileage для расчёта среднего пробега |
| `Cars` | brand, model, year |

## Алгоритм

```mermaid
flowchart TD
  A[Cron 02:00] --> B[SELECT all Cars + owners]
  B --> C[Last 3 diagnostic sessions mileage]
  C --> D[Calc avg km/month]
  D --> E[For each SERVICE_NORM]
  E --> F{Remaining < 10%?}
  F -->|yes| G[INSERT MaintenanceReminder]
  F -->|no| H[Skip]
  G --> I[Cron 09:00 enqueue notification]
  I --> J[Worker: Email + in-app]
```

**Нормативы (захардкожены):**

| type | intervalKm | intervalMonths |
|---|---|---|
| oil_change | 10 000 | 12 |
| tire_rotation | 15 000 | 6 |
| brake_service | 30 000 | 24 |
| scheduled_maintenance | 20 000 | 12 |
| timing_belt | 90 000 | 60 |

## Тест-кейсы

### TC-9.1 Ночной расчёт рекомендаций ТО

**Роль:** system (cron)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Создать 3 `DiagnosticSessions` с mileage для carId user1 | — |
| 2 | Дождаться / вызвать cron `@Cron('0 2 * * *')` | — |
| 3 | `GET /api/v1.0/diagnostics/reminders` (auth user1) | Записи в `MaintenanceReminders` при остатке < 10% |

### TC-9.2 Отправка уведомлений без дублей

**Роль:** customer (`user1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Reminder с `isSent=false` и dueDate в ближайшие 7 дней | — |
| 2 | Cron `@Cron('0 9 * * *')` → BullMQ worker | Email + in-app notification |
| 3 | Повторный cron для того же reminder | `isSent=true`, дубликат не создаётся |
| 4 | `GET /api/v1.0/notifications/my` | Уведомление о предстоящем ТО |

### TC-9.3 Запись на обслуживание из рекомендации

**Роль:** customer

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Получить reminder type=`oil_change` | — |
| 2 | `GET /api/v1.0/booking/slots?employeeId=&date=` | Свободные слоты |
| 3 | `POST /api/v1.0/booking` с serviceId масла | 201, запись создана |

## Пробелы

- [ ] Таблица `ServiceNorms` (brand, model, type, intervalKm, intervalMonths) + admin UI
- [ ] Отдельная страница клиента «Рекомендуемое ТО» с кнопкой → OnlineBooking
- [ ] Push через Electron/desktop
