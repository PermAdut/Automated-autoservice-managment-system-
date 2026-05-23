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
| Банковские реквизиты | ❌ | Нет полей bankAccount, BIC |
| Водители организации | ❌ | Нет связи user ↔ company (только cars) |
| Месячный сводный акт | ❌ | Нет cron/report generator |
| Предупреждение 80% creditLimit | ❌ | Нет проверки при создании заказа |

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

### БД

| Таблица | Поля |
|---|---|
| `Companies` | name, inn, address, city, contactPerson, phone, email, managerUserId |
| `CompanyContracts` | contractNumber, status, discountPercent, creditLimit, paymentTermDays, startDate, endDate |
| `CompanyCars` | companyId, carId, notes |

## Пробелы

- [ ] Банковские реквизиты в `Companies`
- [ ] Таблица `CompanyDrivers` (userId ↔ companyId)
- [ ] Cron: генерация месячного акта (PDF) по заказам организации
- [ ] Alert manager при расходах ≥ 80% `creditLimit`
- [ ] Корпоративная скидка auto-apply к заказам
