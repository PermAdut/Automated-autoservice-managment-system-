# ФТ-5: Управление складом и поставщиками

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.5

## Требование

Складской учёт: каталог запчастей, остатки по складам, алерты минимума, перемещения, поставщики, закупки, журнал операций.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Каталог запчастей | ✅ | `SpareModule/spare.service.ts` — `SparePart`, `Categories` |
| Остатки по складам | ✅ | `SparePartStore` — sparePartId + storeId + quantity |
| Справочник складов | ✅ | `Store` — name, location, phone, workingHours |
| Поставщики | ✅ | `SupplierModule` — `GET/POST /api/v1.0/supplier` |
| Закупочные заявки | ✅ | `PositionsForBuying` — quantity, deliveryDate, status |
| Счета поставщиков | ✅ | `Invoices` — amount, invoiceDate, status |
| Перемещения между складами | ✅ | `storeTransfers` — `BranchModule` (pending/in_transit/completed) |
| Алерт низкого остатка | ⚠️ | `AnalyticsService.getLowStockAlerts(threshold=5)` + WS `stock:alert` |
| minStock на позиции | ❌ | Нет поля минимального остатка в `SparePart` |
| Поставщик на позиции | ❌ | Связь sparePart ↔ supplier отсутствует в схеме |
| Журнал складских операций | ❌ | Нет audit log (поступление/расход/списание/возврат) |

### Backend

```
server/src/modules/SpareModule/
├── spare.controller.ts     # /api/v1.0/stores
└── spare.service.ts

server/src/modules/SupplierModule/
├── supplier.controller.ts  # /api/v1.0/supplier
└── supplier.service.ts

server/src/modules/BranchModule/
└── branch.service.ts       # storeTransfers CRUD
```

### Frontend

| Компонент | Путь |
|---|---|
| Склад (запчасти) | `frontend/src/components/StorageComponents/StoreComponent/` |
| Поставщики | `frontend/src/components/SupplierComponent/` |
| API | `sparePartsApi.ts`, `suppliersApi.ts`, `branchesApi.ts` |

### БД

| Таблица | Назначение |
|---|---|
| `SparePart` | name, partNumber, price, categoryId |
| `Store` | складские помещения |
| `SparePartStore` | остаток по паре (запчасть, склад) |
| `Suppliers` | name, contact, address |
| `PositionsForBuying` | закупка у поставщика |
| `Invoices` | счёт по закупке |
| `StoreTransfers` | fromStoreId, toStoreId, sparePartId, quantity, status |

## Тест-кейсы

### TC-5.1 Каталог запчастей и остатки

**Роль:** manager (`manager1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/stores` | 200, список запчастей с quantity по складам |
| 2 | `POST /api/v1.0/stores` с name, partNumber, price, categoryId | 201, позиция создана |
| 3 | `GET /api/v1.0/stores/meta/stores` | Справочник складов с branchId |
| 4 | `PUT /api/v1.0/stores/:id` — обновить minQuantity | 200, minQuantity сохранён |

### TC-5.2 Поставщики и закупки

**Роль:** admin (`admin@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/supplier` | 200, список поставщиков |
| 2 | `POST /api/v1.0/supplier` с name, contact, address | 201 |
| 3 | `PUT /api/v1.0/stores/:id` с supplierId | Запчасть привязана к поставщику |

### TC-5.3 Журнал движений и алерт низкого остатка

**Роль:** manager

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Завершить заказ с запчастями (ФТ-4) | — |
| 2 | `GET /api/v1.0/stores/movements` | Записи reserve/issue с orderId |
| 3 | `GET /api/v1.0/analytics/low-stock?threshold=5` | Позиции с quantity < threshold |

## Пробелы

- [x] `minQuantity` на `SparePart` + алерт через `GET /analytics/low-stock`
- [x] Привязка поставщика к запчасти (`SparePart.supplierId`)
- [x] Таблица `StockMovements` + `GET /stores/movements`
- [x] Автоматическое списание при завершении заказа (см. ФТ-4)
