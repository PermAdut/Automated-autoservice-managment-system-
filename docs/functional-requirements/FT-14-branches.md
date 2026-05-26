# ФТ-14: Управление филиальной сетью

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.14

## Требование

Справочник филиалов, изоляция данных по филиалу, менеджер видит только свой филиал, межфилиальные перемещения, сравнительные отчёты.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| CRUD филиалов | ✅ | `BranchModule` — `/api/v1.0/branches` |
| Адрес, контакты, часы работы | ✅ | `Branches` — address, city, phone, email, workingHours |
| Менеджер филиала | ✅ | `Branches.managerId` → Users |
| Сотрудники ↔ филиал | ✅ | `BranchEmployees` — isPrimary |
| Межфилиальные перемещения | ✅ | `StoreTransfers` — pending/in_transit/completed |
| UI филиалов | ✅ | `frontend/src/components/BranchComponents/BranchesPage.tsx` |
| Производственные посты филиала | ✅ | `productionPosts` — `/branches/:id/posts` |
| Изоляция данных менеджера | ✅ | `resolveBranchFilter` — manager видит свой branchId |
| branchId на Orders/Stores | ✅ | `orders.branchId`, `stores.branchId` |
| Сравнительные отчёты по филиалам | ✅ | `GET /analytics/branches-comparison` |

### Backend

```
server/src/modules/BranchModule/
├── branch.controller.ts
└── branch.service.ts
```

**Endpoints:**

| Method | Path |
|---|---|
| GET/POST | `/branches` |
| GET/PATCH | `/branches/:id` |
| GET/POST/DELETE | `/branches/:id/employees` |
| GET/POST | `/branches/transfers` |
| PATCH | `/branches/transfers/:id/status` |
| GET/POST | `/branches/:id/posts` |

### БД

| Таблица | Назначение |
|---|---|
| `Branches` | name, address, city, phone, email, workingHours, managerId, isActive |
| `BranchEmployees` | branchId, employeeId, isPrimary |
| `StoreTransfers` | fromStoreId, toStoreId, sparePartId, quantity, status |

## Тест-кейсы

### TC-14.1 CRUD филиала

**Роль:** admin (`admin@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/branches` | Список филиалов с address, workingHours |
| 2 | `POST /api/v1.0/branches` с name, city, managerId | 201 |
| 3 | `PATCH /api/v1.0/branches/:id` — изменить phone | 200 |

### TC-14.2 Изоляция данных manager

**Роль:** manager (`manager1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/orders` | Только заказы branchId менеджера |
| 2 | `GET /api/v1.0/analytics/kpi?period=month` | KPI своего филиала (без query branchId) |
| 3 | `POST /api/v1.0/branches/:чужой-id/employees` | 403 или игнор чужого branchId |

### TC-14.3 Перемещения и производственные посты

**Роль:** manager

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `POST /api/v1.0/branches/transfers` fromStoreId, toStoreId, sparePartId, quantity | status=`pending` |
| 2 | `PATCH /api/v1.0/branches/transfers/:id/status` → `completed` | Остатки обновлены |
| 3 | `POST /api/v1.0/branches/:id/posts` с name | 201, пост создан |
| 4 | Admin: `GET /api/v1.0/analytics/branches-comparison` | KPI всех филиалов |

## Пробелы

- [x] `branchId` на Orders, Stores
- [x] Middleware/guard: manager видит только свой branchId (`resolveBranchFilter`)
- [x] Admin dashboard: сравнение KPI по филиалам (`/analytics/branches-comparison`)
- [x] Справочник производственных постов per branch
- [ ] Привязка `TimeSlots` к branchId / postId
