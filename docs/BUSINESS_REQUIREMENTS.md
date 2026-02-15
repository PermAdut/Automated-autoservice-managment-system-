# Бизнес-требования: Автоматизированная система управления автосервисом (AutoService)

## 1. Введение

### 1.1 Назначение документа

Настоящий документ определяет бизнес-требования к автоматизированной системе управления автосервисом **AutoService**. Система предназначена для комплексной автоматизации всех бизнес-процессов автосервиса — от приёма заказов и управления сотрудниками до учёта запасных частей и интеграции с партнёрскими автосервисами.

### 1.2 Актуальность

Рынок автосервисных услуг в СНГ характеризуется:
- Высокой долей ручного управления бизнес-процессами (до 70% автосервисов)
- Отсутствием единого стандарта обмена данными между автосервисами
- Потерями до 15-20% потенциального дохода из-за неэффективного управления складом и расписанием
- Низким уровнем удержания клиентов из-за отсутствия CRM-инструментов

AutoService решает эти проблемы через единую платформу, которая:
- Автоматизирует внутренние процессы автосервиса
- Предоставляет клиентам онлайн-доступ к услугам
- Обеспечивает интеграцию между автосервисами через открытый API

### 1.3 Стейкхолдеры

| Роль | Интерес |
|------|---------|
| Владелец автосервиса | Увеличение прибыли, контроль бизнеса |
| Менеджер | Управление заказами, сотрудниками, складом |
| Мастер (сотрудник) | Получение заказов, управление расписанием |
| Клиент | Онлайн-запись, отслеживание статуса ремонта |
| Партнёр-автосервис | Обмен запчастями, перенаправление клиентов |

---

## 2. Описание предметной области

### 2.1 Бизнес-процессы автосервиса

```mermaid
flowchart TD
    A[Клиент обращается] --> B{Запись}
    B -->|Онлайн| C[Система создаёт заказ]
    B -->|Оффлайн| D[Менеджер создаёт заказ]
    C --> E[Назначение мастера]
    D --> E
    E --> F[Диагностика]
    F --> G{Нужны запчасти?}
    G -->|Да| H[Проверка склада]
    H --> I{Есть на складе?}
    I -->|Да| J[Резервирование]
    I -->|Нет| K{Есть у партнёра?}
    K -->|Да| L[Запрос у партнёра]
    K -->|Нет| M[Заказ у поставщика]
    L --> J
    M --> J
    G -->|Нет| N[Выполнение работ]
    J --> N
    N --> O[Контроль качества]
    O --> P[Оплата]
    P --> Q[Выдача авто]
    Q --> R[Уведомление клиенту]
    R --> S[Запрос отзыва]
```

### 2.2 Текущие сущности системы

| Сущность | Описание |
|----------|----------|
| Users | Пользователи системы (клиенты, менеджеры, админы) |
| Employees | Сотрудники автосервиса (мастера, диагносты) |
| Cars | Автомобили клиентов |
| Orders | Заказ-наряды на выполнение работ |
| Services | Каталог услуг автосервиса |
| SparePart | Каталог запасных частей |
| Store | Склады запасных частей |
| Suppliers | Поставщики запчастей |
| Subscriptions | Подписки клиентов на уведомления |
| Reviews | Отзывы клиентов о работе сотрудников |
| Payment | Информация об оплате заказов |

---

## 3. Роли пользователей

### 3.1 Диаграмма ролей

```mermaid
graph LR
    subgraph Роли
        Admin[Администратор]
        Manager[Менеджер]
        Customer[Клиент]
    end

    Admin -->|Полный доступ| System[Система]
    Manager -->|Управление| Orders[Заказы]
    Manager -->|Управление| Employees[Сотрудники]
    Manager -->|Управление| Inventory[Склад]
    Manager -->|Просмотр| Reports[Отчёты]
    Customer -->|Создание| Orders
    Customer -->|Просмотр| History[История]
    Customer -->|Написание| Reviews[Отзывы]
    Customer -->|Управление| Profile[Профиль]
```

### 3.2 Матрица доступа

| Функция | Admin | Manager | Customer |
|---------|-------|---------|----------|
| Управление пользователями | + | Просмотр | - |
| Управление сотрудниками | + | + | - |
| Создание заказов | + | + | + (свои) |
| Просмотр всех заказов | + | + | - |
| Управление складом | + | + | - |
| Управление поставщиками | + | + | - |
| Генерация отчётов | + | + | - |
| Написание отзывов | - | - | + |
| Управление профилем | + | + | + |
| Интеграция с партнёрами | + | - | - |

---

## 4. Функциональные требования

### 4.1 Реализованные функции (MVP)

#### FR-001: Аутентификация и авторизация
- Регистрация по email/password
- Вход через OAuth 2.0 (Google)
- JWT access/refresh token система
- Ролевая модель доступа (admin, manager, customer)

#### FR-002: Управление пользователями
- CRUD операции для пользователей
- Профиль пользователя с возможностью редактирования
- Управление автомобилями пользователя (добавление, редактирование, удаление)

#### FR-003: Управление сотрудниками
- CRUD операции для сотрудников
- Должности и зарплаты
- Рабочее расписание с автоматическим обновлением доступности (cron каждые 5 минут)
- Подписка клиентов на уведомления о доступности мастера

#### FR-004: Управление заказами
- Создание заказ-наряда (клиент, авто, мастер)
- Привязка услуг и запчастей к заказу
- Статусы заказа: pending → in_progress → completed / cancelled
- Фильтрация, сортировка, пагинация

#### FR-005: Каталог услуг
- CRUD операции для услуг
- Название, описание, цена

#### FR-006: Управление складом
- Каталог запчастей с категориями
- Несколько складов (Store)
- Учёт количества на каждом складе (SparePart_Store)

#### FR-007: Управление поставщиками
- CRUD операции для поставщиков
- Позиции для закупки (PurchaseOrders)
- Счета-фактуры (Invoices)

#### FR-008: Оплата
- Запись оплаты за заказ
- Метод оплаты, сумма, статус

#### FR-009: Отзывы
- Создание отзывов о сотрудниках
- Рейтинг (1-5)
- Soft delete

#### FR-010: Отчёты
- Отчёт по заказам клиентов
- Отчёт по запасам на складах
- Отчёт по доходам от услуг
- Отчёт по работе сотрудников
- Отчёт по подпискам и отзывам

### 4.2 Планируемые функции (v2.0)

#### FR-011: Онлайн-запись
- Клиент выбирает услугу, дату, время, мастера
- Система проверяет доступность мастера по расписанию
- Автоматическое создание заказа
- Подтверждение по email/push

#### FR-012: История обслуживания автомобиля
- Полная история всех работ по VIN
- Рекомендации по ТО на основе пробега/времени
- Автоматические напоминания о плановом ТО

#### FR-013: Система уведомлений
- Email уведомления (изменение статуса заказа, завершение ремонта)
- Push-уведомления в браузере
- SMS-уведомления (интеграция с SMS-шлюзом)
- Напоминания о плановом ТО

#### FR-014: Интеграция с OBD-II
- Считывание кодов ошибок через OBD-II адаптер
- Автоматическое определение неисправностей
- Рекомендации по ремонту на основе кодов ошибок
- Сохранение результатов диагностики в истории авто

#### FR-015: Мульти-филиальность
- Управление несколькими точками автосервиса
- Общий каталог услуг и запчастей
- Перемещение запчастей между складами
- Консолидированная отчётность

#### FR-016: Интеграция с партнёрскими автосервисами
- REST API для обмена данными между автосервисами
- Поиск запчастей у партнёров
- Перенаправление клиентов (если нет нужной услуги)
- Совместные акции и программы лояльности

#### FR-017: Аналитический дашборд
- KPI в реальном времени (выручка, загрузка, средний чек)
- Графики трендов (динамика заказов, доходов)
- Прогнозирование загрузки на основе исторических данных
- ABC-анализ услуг и запчастей

#### FR-018: Гарантийное отслеживание
- Гарантия на выполненные работы
- Гарантия на установленные запчасти
- Автоматическое уведомление об окончании гарантии
- Учёт гарантийных случаев

#### FR-019: Корпоративные клиенты
- Управление автопарком компании
- Корпоративные тарифы и скидки
- Выделенный менеджер
- Ежемесячная сводная отчётность для корпоративных клиентов

---

## 5. Нефункциональные требования

### 5.1 Производительность
- Время ответа API: < 200ms для 95% запросов
- Поддержка до 100 одновременных пользователей
- Время загрузки страницы: < 2 секунды

### 5.2 Безопасность
- HTTPS для всех соединений
- JWT с коротким TTL access token (15 мин) и длинным refresh token (7 дней)
- Хэширование паролей (bcrypt, salt rounds >= 10)
- Валидация входных данных на стороне сервера (class-validator)
- Защита от SQL-инъекций (Drizzle ORM параметризованные запросы)
- CORS настройки для разрешённых доменов
- Rate limiting для API

### 5.3 Надёжность
- Резервное копирование БД (ежедневно)
- Логирование ошибок
- Graceful degradation при недоступности внешних сервисов

### 5.4 Масштабируемость
- Микросервисная архитектура (готовность к разделению)
- Stateless backend (готовность к горизонтальному масштабированию)
- Docker-контейнеризация

### 5.5 Удобство использования
- Responsive дизайн (мобильные устройства, планшеты, десктоп)
- Локализация на русском языке
- Интуитивный интерфейс (не более 3 кликов до целевого действия)

---

## 6. Архитектура системы

### 6.1 Общая архитектура

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[UI Components]
        RTK[RTK Query]
        Store[Redux Store]
        Router[React Router]
    end

    subgraph Backend["Backend (NestJS)"]
        Controllers[Controllers]
        Services[Services Layer]
        Guards[Auth Guards]
        Scheduler[Task Scheduler]
    end

    subgraph Database["Database (PostgreSQL)"]
        DB[(PostgreSQL)]
        Drizzle[Drizzle ORM]
    end

    subgraph External["External Services"]
        Google[Google OAuth]
        SMS[SMS Gateway]
        Email[Email Service]
        OBD[OBD-II API]
        Partners[Partner API]
    end

    UI --> RTK
    RTK --> Controllers
    Store --> UI
    Router --> UI
    Controllers --> Guards
    Controllers --> Services
    Services --> Drizzle
    Drizzle --> DB
    Scheduler --> Services
    Services --> Google
    Services --> SMS
    Services --> Email
    Services --> OBD
    Services --> Partners
```

### 6.2 Стек технологий

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Frontend | React | 19.x |
| State Management | Redux Toolkit + RTK Query | 2.x |
| CSS Framework | Tailwind CSS | 4.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| Build Tool | Vite | 6.x |
| Backend | NestJS | 11.x |
| ORM | Drizzle ORM | 0.44.x |
| Database | PostgreSQL | 16.x |
| Auth | JWT + Passport.js + Google OAuth | - |
| Containerization | Docker + Docker Compose | - |

---

## 7. ER-диаграмма базы данных

```mermaid
erDiagram
    Role ||--o{ Users : has
    Users ||--o| Passport : has
    Users ||--o{ RefreshTokens : has
    Users ||--o{ Cars : owns
    Users ||--o{ Orders : creates
    Users ||--o{ Subscriptions : subscribes
    Users ||--o{ Reviews : writes

    Employees ||--o{ Orders : assigned
    Employees }o--|| Position : has
    Employees ||--o{ WorkSchedule : has
    Employees ||--o{ Subscriptions : tracked
    Employees ||--o{ Reviews : receives

    Cars ||--o{ Orders : serviced

    Orders ||--o{ Services_Orders : includes
    Orders ||--o{ SparePart_Orders : uses
    Orders ||--o{ Payment : paid

    Services ||--o{ Services_Orders : ordered

    SparePart ||--o{ SparePart_Orders : used
    SparePart ||--o{ SparePart_Store : stocked
    SparePart }o--|| Categories : categorized

    Store ||--o{ SparePart_Store : contains

    Suppliers ||--o{ PositionsForBuying : supplies
    PositionsForBuying ||--o{ Invoices : billed

    Role {
        int id PK
        string name
    }

    Users {
        int id PK
        int roleId FK
        string login
        string name
        string surName
        string email
        string phone
        string passwordHash
        string oauthProvider
        string oauthId
        datetime createdAt
        datetime updatedAt
    }

    Passport {
        int id PK
        int userId FK
        string identityNumber
        date birthDate
        enum gender
    }

    Cars {
        int id PK
        int userId FK
        string brand
        string model
        text information
        int year
        string vin
        string licensePlate
    }

    Employees {
        int id PK
        int userId FK
        int positionId FK
        string name
        string surName
        date hireDate
        decimal salary
    }

    Position {
        int id PK
        string name
        string description
    }

    WorkSchedule {
        int id PK
        int employeeId FK
        datetime startTime
        datetime endTime
        boolean isAvailable
    }

    Orders {
        int id PK
        int userId FK
        int carId FK
        int employeeId FK
        string status
        datetime createdAt
        datetime updatedAt
        datetime completedAt
    }

    Services {
        int id PK
        string name
        string description
        decimal price
    }

    Services_Orders {
        int servicesId FK
        int orderId FK
        int quantity
    }

    SparePart {
        int id PK
        string name
        string partNumber
        decimal price
        int categoryId FK
    }

    SparePart_Orders {
        int sparePartId FK
        int ordersId FK
        int quantity
    }

    SparePart_Store {
        int sparePartId FK
        int storeId FK
        int quantity
    }

    Store {
        int id PK
        string name
        string location
        string phone
        string workingHours
    }

    Categories {
        int id PK
        string name
        text description
    }

    Suppliers {
        int id PK
        string name
        string contact
        text address
    }

    PositionsForBuying {
        int id PK
        int supplierId FK
        int quantity
        datetime deliveryDate
        string status
    }

    Invoices {
        int id PK
        int positionForBuyingId FK
        decimal amount
        datetime invoiceDate
        string status
    }

    Payment {
        int id PK
        int orderId FK
        decimal amount
        enum status
        datetime paymentDate
        string paymentMethod
    }

    Subscriptions {
        int id PK
        int userId FK
        int employeeId FK
        text description
        string name
        datetime dateStart
        datetime dateEnd
    }

    Reviews {
        int id PK
        int userId FK
        int employeeId FK
        text description
        int rate
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
```

---

## 8. Use-Case диаграммы

### 8.1 Основные сценарии клиента

```mermaid
graph LR
    Customer((Клиент))

    Customer --> UC1[Регистрация/Вход]
    Customer --> UC2[Управление профилем]
    Customer --> UC3[Добавление автомобиля]
    Customer --> UC4[Создание заказа]
    Customer --> UC5[Отслеживание статуса заказа]
    Customer --> UC6[Написание отзыва]
    Customer --> UC7[Подписка на мастера]
    Customer --> UC8[Просмотр каталога услуг]
    Customer --> UC9[Оплата заказа]
    Customer --> UC10[Просмотр истории обслуживания]
```

### 8.2 Основные сценарии менеджера

```mermaid
graph LR
    Manager((Менеджер))

    Manager --> UC1[Управление заказами]
    Manager --> UC2[Назначение мастера]
    Manager --> UC3[Управление сотрудниками]
    Manager --> UC4[Управление складом]
    Manager --> UC5[Заказ запчастей у поставщика]
    Manager --> UC6[Генерация отчётов]
    Manager --> UC7[Управление каталогом услуг]
    Manager --> UC8[Просмотр клиентов]
```

---

## 9. Интеграция с партнёрскими автосервисами

### 9.1 Концепция API Federation

AutoService предоставляет открытый REST API для интеграции между автосервисами-партнёрами.

```mermaid
sequenceDiagram
    participant AS1 as AutoService #1
    participant API as Integration API
    participant AS2 as AutoService #2

    AS1->>API: POST /api/partners/search-parts
    Note over API: Поиск запчастей у партнёров
    API->>AS2: GET /api/v1/spare-parts?search=...
    AS2-->>API: Список доступных запчастей
    API-->>AS1: Результаты поиска

    AS1->>API: POST /api/partners/request-part
    Note over API: Запрос на передачу запчасти
    API->>AS2: POST /api/v1/part-requests
    AS2-->>API: Подтверждение
    API-->>AS1: Статус запроса
```

### 9.2 Сценарии интеграции

1. **Обмен запчастями** — поиск редких запчастей у партнёров, запрос на передачу
2. **Перенаправление клиентов** — если услуга недоступна, перенаправление к партнёру
3. **Совместные акции** — единые программы лояльности
4. **Обмен экспертизой** — рекомендации специалистов между автосервисами

### 9.3 API эндпоинты для интеграции

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/partners` | Список партнёров |
| POST | `/api/partners/register` | Регистрация партнёра |
| GET | `/api/partners/:id/spare-parts` | Каталог запчастей партнёра |
| POST | `/api/partners/search-parts` | Поиск запчастей у всех партнёров |
| POST | `/api/partners/request-part` | Запрос на передачу запчасти |
| POST | `/api/partners/redirect-client` | Перенаправление клиента |
| GET | `/api/partners/:id/services` | Каталог услуг партнёра |

---

## 10. Планы развития

### Roadmap

```mermaid
gantt
    title Roadmap AutoService
    dateFormat YYYY-MM
    axisFormat %Y-%m

    section MVP (v1.0)
    Аутентификация           :done, 2025-01, 2025-02
    CRUD операции             :done, 2025-02, 2025-03
    Управление заказами       :done, 2025-03, 2025-04
    Склад и поставщики        :done, 2025-04, 2025-05
    Отчёты                    :done, 2025-05, 2025-06

    section v2.0
    Онлайн-запись              :2025-07, 2025-08
    История обслуживания       :2025-08, 2025-09
    Система уведомлений        :2025-09, 2025-10
    Аналитический дашборд      :2025-10, 2025-11

    section v3.0
    Интеграция с партнёрами    :2025-11, 2026-01
    OBD-II интеграция          :2026-01, 2026-03
    Мульти-филиальность        :2026-03, 2026-05
    Корпоративные клиенты      :2026-05, 2026-07
```

### Метрики успеха

| Метрика | Целевое значение |
|---------|-----------------|
| Время создания заказа | < 2 минуты |
| Конверсия онлайн-записи | > 30% |
| Удержание клиентов | > 60% (repeat visit) |
| Среднее время простоя мастера | < 15% рабочего времени |
| Точность прогнозирования загрузки | > 80% |
| Время поиска запчасти у партнёров | < 5 секунд |

---

## 11. Глоссарий

| Термин | Определение |
|--------|------------|
| Заказ-наряд | Документ, описывающий работы по обслуживанию/ремонту автомобиля |
| OBD-II | On-Board Diagnostics — стандарт диагностики автомобилей |
| VIN | Vehicle Identification Number — уникальный номер транспортного средства |
| ТО | Техническое обслуживание |
| API Federation | Объединение API нескольких систем в единую сеть |
| JWT | JSON Web Token — стандарт аутентификации |
| RTK Query | Redux Toolkit Query — библиотека для управления серверным состоянием |
| Drizzle ORM | TypeScript ORM для работы с SQL-базами данных |
