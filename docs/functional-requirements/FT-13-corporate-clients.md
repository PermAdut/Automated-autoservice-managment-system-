# ФТ-13: Корпоративные клиенты и договорное обслуживание

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.13

## Требование

База организаций, водители и авто парка, договоры с лимитами, месячный сводный акт, предупреждение при 80% лимита.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| CRUD организаций | ✅ | `CorporateModule` — `/api/v1.0/corporate/companies` |
| Реквизиты (ИНН, адрес, контакт) | ✅ | `Companies` — inn, address, city, contactPerson, phone, email |
| Договоры | ✅ | `CompanyContracts` — discountPercent, creditLimit, paymentTermDays |
| Авто парка организации | ✅ | `CompanyCars` — companyId ↔ carId |
| Менеджер организации | ✅ | `Companies.managerUserId` |
| UI | ✅ | `frontend/src/components/CorporateComponents/CorporatePage.tsx` |
| Банковские реквизиты | ✅ | `Companies.bankAccount`, `bic` — `corporate.model.ts` |
| Водители организации | ✅ | `CompanyDrivers` — `GET/POST /corporate/companies/:id/drivers` |
| Месячный сводный акт | ✅ | `GET /corporate/companies/:id/monthly-act` — PDF |
| Предупреждение 80% creditLimit | ✅ | `GET /corporate/companies/:id/spend` → `alert: true` при ≥ 80% |

### Backend

```
server/src/modules/CorporateModule/
├── corporate.controller.ts   # /api/v1.0/corporate
└── corporate.service.ts
```

**Endpoints:**

| Method | Path |
|---|---|
| GET/POST | `/corporate/companies` |
| GET/PATCH | `/corporate/companies/:id` |
| GET/POST | `/corporate/companies/:id/contracts` |
| PATCH | `/corporate/contracts/:contractId/status` |
| GET/POST | `/corporate/companies/:id/cars` |
| GET/POST | `/corporate/companies/:id/drivers` |
| GET | `/corporate/companies/:id/spend` |
| GET | `/corporate/companies/:id/monthly-act` |

### БД

| Таблица | Поля |
|---|---|
| `Companies` | name, inn, address, city, contactPerson, phone, email, managerUserId |
| `CompanyContracts` | contractNumber, status, discountPercent, creditLimit, paymentTermDays, startDate, endDate |
| `CompanyCars` | companyId, carId, notes |

## Тест-кейсы

### TC-13.1 CRUD организации и договор

**Роль:** admin (`admin@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `POST /api/v1.0/corporate/companies` с name, inn, address, bankAccount | 201 |
| 2 | `POST /api/v1.0/corporate/companies/:id/contracts` с creditLimit, discountPercent | 201, contract active |
| 3 | `GET /api/v1.0/corporate/companies/:id` | Реквизиты и managerUserId |

### TC-13.2 Парк авто и водители

**Роль:** manager (`manager1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `POST /api/v1.0/corporate/companies/:id/cars` с carId | 201, авто в парке |
| 2 | `POST /api/v1.0/corporate/companies/:id/drivers` с userId | 201, водитель привязан |
| 3 | `GET /api/v1.0/corporate/companies/:id/cars` | Список авто организации |

### TC-13.3 Контроль лимита и месячный акт

**Роль:** manager

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Создать заказы организации на сумму ≥ 80% creditLimit | — |
| 2 | `GET /api/v1.0/corporate/companies/:id/spend` | `{ alert: true, percent: ≥80 }` |
| 3 | `GET /api/v1.0/corporate/companies/:id/monthly-act?month=YYYY-MM` | PDF сводного акта |

## Пробелы

- [x] Банковские реквизиты в `Companies`
- [x] Таблица `CompanyDrivers` (userId ↔ companyId)
- [x] Генерация месячного акта (PDF) — `GET /monthly-act`
- [x] Alert manager при расходах ≥ 80% `creditLimit`
- [ ] Корпоративная скидка auto-apply к заказам
