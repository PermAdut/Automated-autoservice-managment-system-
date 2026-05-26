# ФТ-6: Каталог услуг

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.6

## Требование

Прейскурант работ: CRUD услуг, автоподстановка цены/времени в заказ, поиск и фильтр, публичный каталог, подбор мастеров по квалификации.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| CRUD услуг | ✅ | `ServiceModule` — `/api/v1.0/services` |
| Категории услуг (дерево) | ✅ | `ServiceCategories` с `parentId` |
| Цена, описание, duration | ✅ | `Services.price`, `durationMinutes` |
| Публичный просмотр без auth | ✅ | `@Public()` на GET endpoints |
| Поиск и фильтр | ✅ | Query params в `service.controller.ts` |
| Цена/время в заказе | ✅ | Берутся из справочника при создании `ServicesOrders` |
| Требуемая квалификация мастера | ✅ | `Services.workTypeId`, `requiredQualificationLevel` |
| Подбор мастеров по квалификации | ✅ | `GET /services/:id/qualified-employees` |

### Backend

```
server/src/modules/ServiceModule/
├── service.controller.ts
├── service.service.ts
├── Dto/create-service.dto.ts
├── Dto/update-service.dto.ts
├── Dto/create-service-category.dto.ts
└── Dto/service.response.ts
```

**Публичные endpoints (`@Public`):**

| Method | Path |
|---|---|
| GET | `/api/v1.0/services` |
| GET | `/api/v1.0/services/:id` |
| GET | `/api/v1.0/services/categories` |
| GET | `/api/v1.0/services/categories/:id` |

### Frontend

| Компонент | Путь |
|---|---|
| Публичный каталог | `frontend/src/components/StorageComponents/ServicesComponent/CatalogPage.tsx` |
| Список (admin) | `frontend/src/components/StorageComponents/ServicesComponent/ServiceList/ServiceList.tsx` |
| Форма | `frontend/src/components/StorageComponents/ServicesComponent/ServiceForm/ServiceForm.tsx` |
| API | `frontend/src/api/servicesApi.ts` |

### БД

| Таблица | Поля |
|---|---|
| `ServiceCategories` | name, description, parentId, isActive |
| `Services` | name, description, price, durationMinutes, categoryId, isActive |

## Тест-кейсы

### TC-6.1 Публичный каталог услуг

**Роль:** без авторизации (guest)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `GET /api/v1.0/services` | 200, список услуг с price, durationMinutes |
| 2 | `GET /api/v1.0/services/categories` | 200, дерево категорий |
| 3 | `GET /api/v1.0/services/:id` | 200, детали услуги |

### TC-6.2 CRUD услуг (admin)

**Роль:** admin (`admin@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | `POST /api/v1.0/services` с name, price, durationMinutes, categoryId | 201 |
| 2 | `PUT /api/v1.0/services/:id` — изменить price | 200 |
| 3 | Customer: `POST /api/v1.0/services` | 403 Forbidden |

### TC-6.3 Подбор мастеров по квалификации

**Роль:** manager (`manager1@gmail.com` / `password123`)

| Шаг | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Услуга с workTypeId и requiredQualificationLevel=4 | — |
| 2 | `GET /api/v1.0/services/:id/qualified-employees` | Только мастера с level ≥ 4 |
| 3 | Создать заказ с этой услугой | Цена/время из справочника в `ServicesOrders` |

## Пробелы

- [x] Поле `requiredQualificationLevel` + `workTypeId` на `Services`
- [x] Endpoint `GET /services/:id/qualified-employees`
- [ ] VIN-decoder интеграция с услугами (feature flag `featureVinDecoder` в tenant)
