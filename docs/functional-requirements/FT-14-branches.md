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
| Производственные посты филиала | ❌ | Нет сущности Post |
| Изоляция данных менеджера | ❌ | Queries без фильтра branchId для manager role |
| branchId на Orders/Stores | ❌ | Orders и Stores не привязаны к branch |
| Сравнительные отчёты по филиалам | ❌ | Analytics без groupBy branch |

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

### БД

| Таблица | Назначение |
|---|---|
| `Branches` | name, address, city, phone, email, workingHours, managerId, isActive |
| `BranchEmployees` | branchId, employeeId, isPrimary |
| `StoreTransfers` | fromStoreId, toStoreId, sparePartId, quantity, status |

## Пробелы

- [ ] `branchId` на Orders, Stores, TimeSlots
- [ ] Middleware/guard: manager видит только свой branchId
- [ ] Admin dashboard: сравнение KPI по филиалам
- [ ] Справочник производственных постов per branch
