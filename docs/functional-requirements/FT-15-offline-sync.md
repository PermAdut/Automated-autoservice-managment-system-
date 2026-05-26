# ФТ-15: Оффлайн-режим и синхронизация данных

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.15

## Требование

Очередь мутаций offline, ping каждые 30 сек, conflict resolution по version, status bar, журнал синхронизации.

**Out of scope (не реализуется):** локальное хранение всех данных и read offline — просмотр данных требует сеть.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Очередь offline-запросов | ✅ | `frontend/src/offline/syncQueue.ts` — IndexedDB |
| Ping каждые 30 сек | ✅ | `useNetworkStatus.ts` — endpoints `/health` и `/api/v1.0/health` |
| Replay при восстановлении | ✅ | `replayQueue()` — timestamp order |
| Status bar | ✅ | `OfflineStatusBar.tsx` |
| Online → offline detection | ✅ | `navigator.onLine` + fetch `/health` |
| Electron offline | ❌ | `electron-opus/` — нет syncQueue / OfflineStatusBar |
| Conflict resolution (version) | ✅ | `Orders.version` + проверка в `order.service.ts` |
| Журнал синхронизации | ✅ | `SyncLog` + `GET/POST /api/v1.0/sync/log`, UI в `OfflineStatusBar` |
| ~~Локальное хранение всех данных~~ | — | **Out of scope** |
| ~~Полный offline CRUD (read)~~ | — | **Out of scope** — read требует сеть |

### Frontend (web)

```
frontend/src/
├── offline/syncQueue.ts           # IndexedDB queue (mutations only)
├── hooks/useNetworkStatus.ts      # ping + replay
└── components/OfflineStatusBar/
    └── OfflineStatusBar.tsx
```

## Пробелы

- [x] `GET /health` на сервере (`HealthModule` — также `/api/v1.0/health`)
- [x] Подключить `enqueue()` в RTK Query baseApi
- [ ] Портировать offline stack в `electron-opus`
- [x] Поле `version` на Orders + last-write-wins
- [x] `SyncLog` — timestamp, operation, status, error
- [x] UI журнала синхронизации (`OfflineStatusBar` + `useGetSyncLogQuery`)

## Тест-кейсы

### TC-15.1 Очередь мутаций offline

**Роль:** customer (`user1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Отключить сеть | Status bar: «Offline», счётчик очереди |
| 2 | Создать заказ или PATCH профиль | Запрос в IndexedDB, не на сервер |
| 3 | Включить сеть | `replayQueue()` отправляет операции, счётчик = 0 |

### TC-15.2 Read требует сеть (out of scope)

**Роль:** customer

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Offline, открыть `/orders` | Список не загружается / сообщение «нет сети» |
| 2 | — | Локальный кэш всех данных **не** используется |

### TC-15.3 Ping, conflict resolution и журнал

**Роль:** customer (`user1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /health` или `GET /api/v1.0/health` | 200, `{ status: 'ok' }` |
| 2 | Offline PATCH заказа, online replay с устаревшим version | 409 conflict, запись в sync log |
| 3 | `GET /api/v1.0/sync/log?limit=50` | Журнал операций; UI в OfflineStatusBar |
