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

## Пробелы

- [ ] `minQuantity` на `SparePart` + автоматический алерт менеджеру
- [ ] Привязка поставщика к запчасти
- [ ] Таблица `StockMovements` для полного журнала и инвентаризации
- [ ] Автоматическое списание при завершении заказа (см. ФТ-4)
