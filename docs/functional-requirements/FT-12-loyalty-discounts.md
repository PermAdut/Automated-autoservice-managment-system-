# ФТ-12: Программа лояльности и система скидок

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.12

## Требование

Бонусные баллы, 4 уровня участия, оплата до 20% баллами, персональные скидки, промокоды, история операций.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Программа лояльности (points, tier) | ✅ | `LoyaltyPrograms` — `PromotionsModule` |
| История транзакций | ✅ | `LoyaltyTransactions` — earn/spend/bonus |
| Промокоды / скидки | ✅ | `Discounts` — percent/fixed, code, maxUsageCount |
| Применение скидки к заказу | ✅ | `POST /promotions/discounts/apply` → `OrderDiscounts` |
| Начисление баллов | ✅ | `POST /promotions/loyalty/add-points` |
| Списание баллов | ✅ | `POST /promotions/loyalty/spend-points` |
| UI лояльности | ✅ | `frontend/src/components/LoyaltyComponent/LoyaltyPage.tsx` |
| 1 балл / 10 руб (настраиваемый) | ❌ | Нет tenant-настройки коэффициента |
| 4 уровня Standard–Premium | ⚠️ | Фактически: bronze, silver, gold, platinum |
| Лимит 20% оплаты баллами | ❌ | `spendPoints()` без cap |
| Персональные скидки клиенту | ❌ | Только общие discount codes |
| Сгорание баллов | ❌ | Нет expiry logic |

### Backend

```
server/src/modules/PromotionsModule/
├── promotions.controller.ts   # /api/v1.0/promotions
└── promotions.service.ts
```

**Endpoints:**

| Method | Path |
|---|---|
| GET | `/promotions/discounts/active` |
| POST | `/promotions/discounts/apply` |
| GET | `/promotions/loyalty/my` |
| GET | `/promotions/loyalty/my/transactions` |
| POST | `/promotions/loyalty/add-points` |
| POST | `/promotions/loyalty/spend-points` |

### БД

| Таблица | Поля |
|---|---|
| `Discounts` | code, name, type, value, isActive, startDate, endDate, maxUsageCount |
| `OrderDiscounts` | orderId, discountId, appliedAmount |
| `LoyaltyPrograms` | userId, points, tier, totalEarned, totalSpent |
| `LoyaltyTransactions` | programId, orderId, type, points, description |

**Расчёт tier (фактический):**

| tier | totalEarned |
|---|---|
| bronze | < 1 000 |
| silver | ≥ 1 000 |
| gold | ≥ 5 000 |
| platinum | ≥ 10 000 |

## Тест-кейсы

### TC-12.1 Просмотр баллов и tier

**Роль:** customer (`user1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/promotions/loyalty/my` | points, tier, totalEarned |
| 2 | `GET /api/v1.0/promotions/loyalty/my/transactions` | История earn/spend/bonus |
| 3 | UI `LoyaltyPage.tsx` | Отображение tier и баллов |

### TC-12.2 Промокод и персональная скидка

**Роль:** customer + admin

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/promotions/discounts/active` | Список активных кодов |
| 2 | `GET /api/v1.0/promotions/discounts/personal` | Скидки, привязанные к userId |
| 3 | `POST /api/v1.0/promotions/discounts/apply` с orderId, code | Скидка в `OrderDiscounts` |

### TC-12.3 Начисление и списание баллов

**Роль:** customer

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Завершить заказ на сумму 10 000 ₽ | Автоначисление через `earnForCompletedOrder` |
| 2 | `POST /api/v1.0/promotions/loyalty/spend-points` на заказ | Списание с cap 20% (`loyaltyMaxSpendPercent`) |
| 3 | Попытка списать > 20% суммы заказа | 400 Bad Request |

## Пробелы

- [ ] Привести tiers к ТЗ: Standard / Silver / Gold / Premium
- [x] Коэффициент начисления в `TenantSettings.loyaltyPointsPerRub`
- [x] Cap 20% при `spendPoints` (`loyaltyMaxSpendPercent`)
- [x] Персональные скидки (`GET /discounts/personal`, `Discounts.userId`)
- [x] Автоначисление баллов при completed order
