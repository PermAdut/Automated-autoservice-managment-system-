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
| Автозапуск при новом заказе | ❌ | Только ручной `POST /schedule/optimize` |
| Drag-and-drop на Gantt | ❌ | Reassign через API, DnD UI не реализован |
| Проверка квалификации | ❌ | Нет qualification matrix |
| Производственные посты | ❌ | Нет сущности `Post` / `Bay` |
| Предупреждение при неверной квалификации | ❌ | — |

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

## Пробелы

- [ ] Hook: вызывать `optimizeSchedule()` после create/update order и изменения WorkSchedule
- [ ] Drag-and-drop на Gantt → PATCH reassign
- [ ] Сущность «производственный пост» + привязка timeSlots
- [ ] Валидация квалификации мастера при reassign
- [ ] Автобронирование `TimeSlots` при назначении
