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
| Требуемая квалификация мастера | ❌ | Нет поля в `Services` |
| Подбор мастеров по квалификации | ❌ | Нет API matching |

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

## Пробелы

- [ ] Поле `requiredQualificationLevel` или связь service ↔ position
- [ ] Endpoint «рекомендованные мастера для услуги X»
- [ ] VIN-decoder интеграция с услугами (feature flag `featureVinDecoder` в tenant)
