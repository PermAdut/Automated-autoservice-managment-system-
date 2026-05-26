# ФТ-10: Алгоритм оптимизации загрузки постов

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.10

## Требование

Автораспределение заказов по постам и мастерам: priority formula, автозапуск, ручное переназначение, Gantt, проверка квалификации, резерв слота.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Priority formula | ✅ | `urgency×0.5 + complexity×0.3 + clientLevel×0.2` — `schedule.service.ts` |
| Окно 8 рабочих часов | ✅ | `optimizeSchedule(windowHours=8)` |
| Greedy assignment master+slot | ✅ | Перебор pending orders по priority |
| Gantt data API | ✅ | `GET /api/v1.0/schedule/gantt?date=` |
| Ручной reassign | ✅ | `PATCH /api/v1.0/schedule/reassign` |
| UI Gantt | ✅ | `frontend/src/components/GanttChart/SchedulePage.tsx` |
| WebSocket при назначении | ✅ | `EventsGateway.notifyOrderUpdated()` |
| Автозапуск при новом заказе | ✅ | `order.service.ts` → `optimizeSchedule()` после create/update |
| Drag-and-drop на Gantt | ❌ | Reassign через API, DnD UI не реализован |
| Проверка квалификации | ✅ | `EmployeeQualificationService` в `schedule.service.ts` |
| Производственные посты | ✅ | `productionPosts` — `GET/POST /api/v1.0/branches/:id/posts` |
| Предупреждение при неверной квалификации | ✅ | `PATCH /schedule/reassign` → `warning` в ответе |

### Backend

```
server/src/modules/ScheduleModule/
├── schedule.controller.ts    # /api/v1.0/schedule
└── schedule.service.ts       # ScheduleOptimizationService (FT-10)
```

**Endpoints:**

| Method | Path | Описание |
|---|---|---|
| GET | `/schedule/gantt?date=YYYY-MM-DD` | Данные для диаграммы Ганта |
| POST | `/schedule/optimize` | Запуск алгоритма |
| PATCH | `/schedule/reassign` | Ручное переназначение order → employee |

### Frontend

| Компонент | Путь |
|---|---|
| Страница расписания | `frontend/src/components/GanttChart/SchedulePage.tsx` |
| API | `frontend/src/api/scheduleApi.ts` |

## Формула приоритета

```
priority = urgency × 0.5 + complexity × 0.3 + clientLevel × 0.2

urgency      = 2 (status=urgent) | 1 (normal)
complexity   = min(totalDurationMin / 480, 1)   // нормализация к 8ч
clientLevel  = 1.2 (tier platinum|gold) | 1.0
```

## Тест-кейсы

### TC-10.1 Оптимизация расписания

**Роль:** manager (`manager1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Создать 3 pending-заказа с разной сложностью | — |
| 2 | `POST /api/v1.0/schedule/optimize` | Заказы назначены мастерам по priority formula |
| 3 | `GET /api/v1.0/schedule/gantt?date=YYYY-MM-DD` | Данные для Gantt: orders, employees, slots |

### TC-10.2 Ручное переназначение с проверкой квалификации

**Роль:** manager

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `PATCH /api/v1.0/schedule/reassign` orderId + qualified employeeId | 200, заказ переназначен |
| 2 | Reassign на мастера без квалификации | 200, в ответе поле `warning` |
| 3 | UI `SchedulePage.tsx` | Gantt отображает обновлённое назначение |

### TC-10.3 Автозапуск после создания заказа

**Роль:** manager

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `POST /api/v1.0/orders` с pending-статусом | 201 |
| 2 | Без ручного optimize — `GET /schedule/gantt` | Заказ уже имеет employeeId |
| 3 | WebSocket event `order:updated` | Клиент получает обновление |

## Пробелы

- [x] Hook: вызывать `optimizeSchedule()` после create/update order
- [ ] Drag-and-drop на Gantt → PATCH reassign
- [x] Сущность «производственный пост» + `GET/POST /branches/:id/posts`
- [x] Валидация квалификации мастера при reassign
- [ ] Автобронирование `TimeSlots` при назначении
