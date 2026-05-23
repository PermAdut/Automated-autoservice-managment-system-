# ФТ-3: Управление сотрудниками

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.3

## Требование

Кадровый учёт: карточки сотрудников, квалификации мастеров, расписание смен, подписка на мастера, отзывы, привязка к филиалу.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| CRUD сотрудников | ✅ | `EmployeeModule` — `GET/POST/PATCH/DELETE /api/v1.0/employee` |
| Должность, зарплата, дата приёма | ✅ | `Employees` + `Position` — `staff.model.ts` |
| Расписание смен | ✅ | `WorkSchedule` — startTime, endTime, isAvailable |
| Доступность для записи | ✅ | `employee.avalability.service.ts` |
| Подписка клиента на мастера | ✅ | `POST /api/v1.0/employee/:id/subscribe`, `unsubscribe` |
| Отзывы 1–5, soft-delete | ✅ | `Reviews` с `deletedAt`; скрытие вместо удаления |
| Привязка к филиалу | ✅ | `branchEmployees` — `BranchModule/branch.service.ts` |
| Справочник квалификаций мастера | ❌ | Нет связи «мастер ↔ виды работ ↔ уровень» |
| Автораспределение по квалификации | ❌ | Зависит от ФТ-10, но qualification matrix отсутствует |

### Backend

```
server/src/modules/EmployeeModule/
├── employee.controller.ts
├── employee.service.ts
├── employee.avalability.service.ts
├── Dto/create-employee.dto.ts
├── Dto/update-employee.dto.ts
├── Dto/create-review.dto.ts
└── Dto/subscribe-employee.dto.ts
```

**Ключевые endpoints:**

| Method | Path | Описание |
|---|---|---|
| GET | `/api/v1.0/employee` | Список сотрудников |
| POST | `/api/v1.0/employee` | Создание |
| PATCH | `/api/v1.0/employee/:id` | Обновление |
| DELETE | `/api/v1.0/employee/:id` | Удаление |
| POST | `/api/v1.0/employee/:id/reviews` | Отзыв клиента |
| GET | `/api/v1.0/employee/:id/reviews` | Список отзывов |
| POST | `/api/v1.0/employee/:id/subscribe` | Подписка |
| DELETE | `/api/v1.0/employee/:id/subscribe` | Отписка |

### Frontend

| Компонент | Путь |
|---|---|
| Список | `frontend/src/components/EmployeeComponents/EmployeeList/EmployeeList.tsx` |
| Карточка | `frontend/src/components/EmployeeComponents/EmployeeItem/EmployeeItem.tsx` |
| Форма | `frontend/src/components/EmployeeComponents/EmployeeForm/EmployeeForm.tsx` |
| Подписка | `frontend/src/components/EmployeeComponents/SubscribeModal/SubscribeModal.tsx` |
| Отзыв | `frontend/src/components/EmployeeComponents/ReviewModal/ReviewModal.tsx` |
| API | `frontend/src/api/employeesApi.ts` |

### БД

| Таблица | Поля |
|---|---|
| `Employees` | name, surName, lastName, positionId, hireDate, salary, userId |
| `Position` | name, description (должность, не квалификация по работам) |
| `WorkSchedule` | employeeId, startTime, endTime, isAvailable |
| `Reviews` | userId, employeeId, rate, description, deletedAt |
| `Subscriptions` | userId, employeeId (уведомление при освобождении) |
| `BranchEmployees` | branchId, employeeId, isPrimary |

## Пробелы

- [ ] Таблица квалификаций: какие виды работ умеет мастер и уровень
- [ ] Автоматическое уведомление подписчиков при освобождении мастера (subscription есть, push при free slot — проверить wiring)
- [ ] Контактные данные сотрудника (телефон/email) — берутся из связанного `Users`, если `userId` задан
