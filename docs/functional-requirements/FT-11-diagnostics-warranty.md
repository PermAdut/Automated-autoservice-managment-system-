# ФТ-11: Диагностика и гарантийный учёт

Источник: [FUNCTIONAL_REQUIREMENTS.md](../FUNCTIONAL_REQUIREMENTS.md) §2.3.11

## Требование

Диагностическая история автомобилей, привязка к заказ-наряду, гарантийные сроки, проверка при обращении, PDF гарантийного талона.

## Реализация

| Возможность | Статус | Где |
|---|---|---|
| Диагностические сессии | ✅ | `DiagnosticsModule` — `/api/v1.0/diagnostics` |
| Каталог DTC-кодов | ✅ | `DiagnosticCodesCatalog` |
| Результаты диагностики | ✅ | `DiagnosticResults` — severity, description |
| Пробег в сессии | ✅ | `mileage` при создании session |
| История по автомобилю | ✅ | `GET /diagnostics/car/:carId` |
| Привязка к заказу | ⚠️ | `DiagnosticSessions.orderId` — опционально |
| Фото повреждений | ⚠️ | S3 upload — `StorageModule/s3-upload.service.ts`; интеграция с diagnostic card частичная |
| Гарантии на работы/запчасти | ✅ | `WarrantyModule` — type, durationMonths, expiresAt |
| Гарантийные обращения (claims) | ✅ | `WarrantyClaims` — open/under_review/approved/resolved |
| Проверка срока гарантии | ✅ | Lazy check в `warranty.service.ts` → status expired |
| PDF гарантийного талона | ✅ | `GET /api/v1.0/warranty/:id/certificate` — pdfkit |
| Уведомление менеджера при claim | ⚠️ | Claim создаётся; auto-notify manager — проверить wiring |

### Backend

```
server/src/modules/DiagnosticsModule/
├── diagnostics.controller.ts
└── diagnostics.service.ts

server/src/modules/WarrantyModule/
├── warranty.controller.ts    # /api/v1.0/warranty
└── warranty.service.ts       # generateCertificatePdf()

server/src/modules/StorageModule/
└── s3-upload.service.ts      # presigned URLs для фото
```

### Frontend

| Компонент | Путь |
|---|---|
| Диагностика | `frontend/src/components/DiagnosticsComponents/DiagnosticsPage.tsx` |
| Гарантии | `frontend/src/components/WarrantyComponents/WarrantyPage.tsx` |
| API | `diagnosticsApi.ts`, `warrantyApi.ts` |

### БД

| Таблица | Назначение |
|---|---|
| `DiagnosticSessions` | carId, employeeId, orderId, mileage, notes |
| `DiagnosticResults` | sessionId, codeId, severity, description |
| `DiagnosticCodesCatalog` | code, description, severity |
| `Warranties` | orderId, sparePartId, type, status, durationMonths, expiresAt |
| `WarrantyClaims` | warrantyId, userId, description, status, resolution |

## Пробелы

- [ ] Полноценная «диагностическая карта» с фото при приёмке (UI + S3 gallery)
- [ ] PDF диагностической карты (отдельно от гарантийного талона)
- [ ] Авто-уведомление менеджера при новом warranty claim
- [ ] Автосоздание warranty при закрытии заказа
