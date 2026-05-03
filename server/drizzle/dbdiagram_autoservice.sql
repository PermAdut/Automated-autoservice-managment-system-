/*
  PostgreSQL DDL (не DBML).

  Поле редактора на https://dbdiagram.io принимает DBML. Если вы вставляете этот SQL
  туда как текст, будет ошибка вроде: "Custom element can only appear in a Project".

  Откройте вместо этого файл dbdiagram_autoservice.dbml в этой же папке и вставьте
  его содержимое в редактор dbdiagram — либо: Import → PostgreSQL и пробуйте этот SQL.

  Источник: drizzle/migrations/0000_loving_human_torch.sql (без индексов).
*/
CREATE SCHEMA "autoservice";
CREATE TYPE "autoservice"."gender" AS ENUM('M', 'F');
CREATE TYPE "autoservice"."oauth_provider" AS ENUM('google', 'local');
CREATE TYPE "autoservice"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
CREATE TYPE "autoservice"."appointment_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE "autoservice"."notification_channel" AS ENUM('email', 'sms', 'push');
CREATE TYPE "autoservice"."notification_status" AS ENUM('pending', 'sent', 'failed', 'delivered');
CREATE TYPE "autoservice"."dtc_severity" AS ENUM('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE "autoservice"."reminder_type" AS ENUM('oil_change', 'tire_rotation', 'brake_service', 'scheduled_maintenance', 'timing_belt', 'other');
CREATE TYPE "autoservice"."part_request_status" AS ENUM('pending', 'approved', 'rejected', 'transferred', 'cancelled');
CREATE TYPE "autoservice"."partner_status" AS ENUM('active', 'pending', 'suspended', 'inactive');
CREATE TYPE "autoservice"."transfer_status" AS ENUM('pending', 'in_transit', 'completed', 'cancelled');
CREATE TYPE "autoservice"."warranty_claim_status" AS ENUM('open', 'under_review', 'approved', 'rejected', 'resolved');
CREATE TYPE "autoservice"."warranty_status" AS ENUM('active', 'expired', 'claimed', 'voided');
CREATE TYPE "autoservice"."warranty_type" AS ENUM('work', 'spare_part', 'complex');
CREATE TYPE "autoservice"."contract_status" AS ENUM('draft', 'active', 'suspended', 'expired', 'terminated');
CREATE TYPE "autoservice"."discount_type" AS ENUM('percent', 'fixed', 'free_service');
CREATE TYPE "autoservice"."loyalty_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE "autoservice"."loyalty_tx_type" AS ENUM('earn', 'spend', 'bonus', 'expire', 'adjustment');
CREATE TABLE "autoservice"."Passport" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"identityNumber" varchar NOT NULL,
	"birthDate" timestamp NOT NULL,
	"gender" "autoservice"."gender" NOT NULL
);
CREATE TABLE "autoservice"."RefreshTokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RefreshTokens_token_unique" UNIQUE("token")
);
CREATE TABLE "autoservice"."Role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "Role_name_unique" UNIQUE("name")
);
CREATE TABLE "autoservice"."Users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleId" uuid NOT NULL,
	"login" varchar NOT NULL,
	"name" varchar NOT NULL,
	"surName" varchar NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20),
	"passwordHash" text,
	"oauthProvider" "autoservice"."oauth_provider" DEFAULT 'local',
	"oauthId" varchar,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "email_unique" UNIQUE("email"),
	CONSTRAINT "login_unique" UNIQUE("login"),
	CONSTRAINT "phone_unique" UNIQUE("phone")
);
CREATE TABLE "autoservice"."Employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"name" varchar(100) NOT NULL,
	"surName" varchar(100) NOT NULL,
	"lastName" varchar(100),
	"positionId" uuid NOT NULL,
	"hireDate" timestamp DEFAULT now() NOT NULL,
	"salary" numeric NOT NULL
);
CREATE TABLE "autoservice"."Position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar
);
CREATE TABLE "autoservice"."WorkSchedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" uuid NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL
);
CREATE TABLE "autoservice"."Categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text
);
CREATE TABLE "autoservice"."Invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"positionForBuyingId" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"invoiceDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
CREATE TABLE "autoservice"."PositionsForBuying" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplierId" uuid NOT NULL,
	"quantity" bigint NOT NULL,
	"deliveryDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
CREATE TABLE "autoservice"."SparePart_Store" (
	"sparePartId" uuid NOT NULL,
	"storeId" uuid NOT NULL,
	"quantity" bigint DEFAULT 1,
	CONSTRAINT "SparePart_Store_sparePartId_storeId_pk" PRIMARY KEY("sparePartId","storeId")
);
CREATE TABLE "autoservice"."SparePart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"partNumber" varchar NOT NULL,
	"price" numeric NOT NULL,
	"categoryId" uuid NOT NULL
);
CREATE TABLE "autoservice"."Store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(200) NOT NULL,
	"phone" varchar(20),
	"workingHours" varchar(100)
);
CREATE TABLE "autoservice"."Suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"contact" varchar(100),
	"address" text
);
CREATE TABLE "autoservice"."ServiceCategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"parentId" uuid,
	"isActive" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ServiceCategories_name_unique" UNIQUE("name")
);
CREATE TABLE "autoservice"."Services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoryId" uuid,
	"name" varchar NOT NULL,
	"description" varchar,
	"price" numeric NOT NULL,
	"durationMinutes" numeric,
	"isActive" boolean DEFAULT true NOT NULL
);
CREATE TABLE "autoservice"."Cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"brand" varchar NOT NULL,
	"model" varchar NOT NULL,
	"information" text,
	"year" bigint NOT NULL,
	"vin" varchar NOT NULL,
	"licensePlate" varchar
);
CREATE TABLE "autoservice"."Reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"employeeId" uuid,
	"description" text,
	"rate" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
CREATE TABLE "autoservice"."Subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"employeeId" uuid,
	"subscriptionDescription" text,
	"subscriptionName" varchar NOT NULL,
	"dateStart" timestamp DEFAULT now() NOT NULL,
	"dateEnd" timestamp NOT NULL
);
CREATE TABLE "autoservice"."Orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"carId" uuid NOT NULL,
	"employeeId" uuid,
	"status" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"completedAt" timestamp
);
CREATE TABLE "autoservice"."Payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"status" "autoservice"."payment_status" DEFAULT 'pending' NOT NULL,
	"paymentDate" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" varchar(50) NOT NULL
);
CREATE TABLE "autoservice"."Services_Orders" (
	"servicesId" uuid NOT NULL,
	"orderId" uuid NOT NULL,
	"quantity" bigint DEFAULT 1 NOT NULL,
	CONSTRAINT "Services_Orders_servicesId_orderId_pk" PRIMARY KEY("servicesId","orderId")
);
CREATE TABLE "autoservice"."SparePart_Orders" (
	"sparePartId" uuid NOT NULL,
	"ordersId" uuid NOT NULL,
	"quantity" bigint DEFAULT 1,
	CONSTRAINT "SparePart_Orders_sparePartId_ordersId_pk" PRIMARY KEY("sparePartId","ordersId")
);
CREATE TABLE "autoservice"."Appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"carId" uuid NOT NULL,
	"serviceId" uuid,
	"employeeId" uuid,
	"timeSlotId" uuid,
	"status" "autoservice"."appointment_status" DEFAULT 'pending' NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"notes" text,
	"confirmationCode" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
CREATE TABLE "autoservice"."TimeSlots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isBooked" boolean DEFAULT false NOT NULL
);
CREATE TABLE "autoservice"."NotificationChannels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"channel" "autoservice"."notification_channel" NOT NULL,
	"address" varchar(200) NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."NotificationTemplates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"channel" "autoservice"."notification_channel" NOT NULL,
	"subject" varchar(200),
	"body" text NOT NULL,
	"variables" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "NotificationTemplates_name_unique" UNIQUE("name")
);
CREATE TABLE "autoservice"."Notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"templateId" uuid,
	"channel" "autoservice"."notification_channel" NOT NULL,
	"status" "autoservice"."notification_status" DEFAULT 'pending' NOT NULL,
	"subject" varchar(200),
	"body" text NOT NULL,
	"recipient" varchar(200) NOT NULL,
	"sentAt" timestamp,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."DiagnosticCodesCatalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"description" varchar(500) NOT NULL,
	"descriptionRu" varchar(500),
	"severity" "autoservice"."dtc_severity" DEFAULT 'medium' NOT NULL,
	"system" varchar(100),
	"possibleCauses" text,
	"possibleFixes" text,
	CONSTRAINT "DiagnosticCodesCatalog_code_unique" UNIQUE("code")
);
CREATE TABLE "autoservice"."DiagnosticResults" (
	"sessionId" uuid NOT NULL,
	"codeId" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	CONSTRAINT "DiagnosticResults_sessionId_codeId_pk" PRIMARY KEY("sessionId","codeId")
);
CREATE TABLE "autoservice"."DiagnosticSessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carId" uuid NOT NULL,
	"employeeId" uuid,
	"orderId" uuid,
	"mileage" integer,
	"notes" text,
	"rawData" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."MaintenanceReminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"carId" uuid NOT NULL,
	"type" "autoservice"."reminder_type" NOT NULL,
	"description" varchar(500),
	"dueDate" timestamp,
	"dueMileage" integer,
	"isSent" boolean DEFAULT false NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."PartnerApiKeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partnerId" uuid NOT NULL,
	"keyHash" text NOT NULL,
	"name" varchar(100),
	"scopes" text,
	"expiresAt" timestamp,
	"lastUsedAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "PartnerApiKeys_keyHash_unique" UNIQUE("keyHash")
);
CREATE TABLE "autoservice"."PartnerClientRedirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"fromPartnerId" uuid NOT NULL,
	"toPartnerId" uuid NOT NULL,
	"reason" varchar(500),
	"serviceRequested" varchar(200),
	"accepted" boolean,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."PartnerSparePartRequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromPartnerId" uuid NOT NULL,
	"toPartnerId" uuid NOT NULL,
	"sparePartId" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"status" "autoservice"."part_request_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"requestedAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp
);
CREATE TABLE "autoservice"."Partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"address" text,
	"city" varchar(100),
	"phone" varchar(20),
	"email" varchar(100),
	"website" varchar(200),
	"apiUrl" varchar(300),
	"status" "autoservice"."partner_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."BranchEmployees" (
	"branchId" uuid NOT NULL,
	"employeeId" uuid NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "BranchEmployees_branchId_employeeId_pk" PRIMARY KEY("branchId","employeeId")
);
CREATE TABLE "autoservice"."Branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100),
	"phone" varchar(20),
	"email" varchar(100),
	"managerId" uuid,
	"workingHours" varchar(100),
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."StoreTransfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fromStoreId" uuid NOT NULL,
	"toStoreId" uuid NOT NULL,
	"sparePartId" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" "autoservice"."transfer_status" DEFAULT 'pending' NOT NULL,
	"initiatedById" uuid,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
CREATE TABLE "autoservice"."Warranties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"sparePartId" uuid,
	"type" "autoservice"."warranty_type" NOT NULL,
	"status" "autoservice"."warranty_status" DEFAULT 'active' NOT NULL,
	"description" text,
	"durationMonths" integer NOT NULL,
	"issuedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
CREATE TABLE "autoservice"."WarrantyClaims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warrantyId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"description" text NOT NULL,
	"status" "autoservice"."warranty_claim_status" DEFAULT 'open' NOT NULL,
	"resolution" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp
);
CREATE TABLE "autoservice"."Companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"inn" varchar(20),
	"address" text,
	"city" varchar(100),
	"contactPerson" varchar(200),
	"phone" varchar(20),
	"email" varchar(100),
	"managerUserId" uuid,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."CompanyCars" (
	"companyId" uuid NOT NULL,
	"carId" uuid NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"notes" varchar(500),
	CONSTRAINT "CompanyCars_companyId_carId_pk" PRIMARY KEY("companyId","carId")
);
CREATE TABLE "autoservice"."CompanyContracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"contractNumber" varchar(50),
	"status" "autoservice"."contract_status" DEFAULT 'draft' NOT NULL,
	"discountPercent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"creditLimit" numeric(12, 2),
	"paymentTermDays" numeric,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."Discounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50),
	"name" varchar(200) NOT NULL,
	"description" text,
	"type" "autoservice"."discount_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"minOrderAmount" numeric(10, 2),
	"maxUsageCount" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Discounts_code_unique" UNIQUE("code")
);
CREATE TABLE "autoservice"."LoyaltyPrograms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"tier" "autoservice"."loyalty_tier" DEFAULT 'bronze' NOT NULL,
	"totalEarned" integer DEFAULT 0 NOT NULL,
	"totalSpent" integer DEFAULT 0 NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "LoyaltyPrograms_userId_unique" UNIQUE("userId")
);
CREATE TABLE "autoservice"."LoyaltyTransactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programId" uuid NOT NULL,
	"orderId" uuid,
	"type" "autoservice"."loyalty_tx_type" NOT NULL,
	"points" integer NOT NULL,
	"description" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "autoservice"."OrderDiscounts" (
	"orderId" uuid NOT NULL,
	"discountId" uuid NOT NULL,
	"appliedAmount" numeric(10, 2) NOT NULL,
	"appliedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "OrderDiscounts_orderId_discountId_pk" PRIMARY KEY("orderId","discountId")
);
CREATE TABLE "autoservice"."TenantPages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "TenantPages_slug_unique" UNIQUE("slug")
);
CREATE TABLE "autoservice"."TenantSettings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyName" varchar(200) DEFAULT 'AutoService' NOT NULL,
	"tagline" varchar(300),
	"description" text,
	"logoUrl" varchar(500),
	"faviconUrl" varchar(500),
	"primaryColor" varchar(20) DEFAULT '#4f46e5',
	"secondaryColor" varchar(20) DEFAULT '#0ea5e9',
	"accentColor" varchar(20) DEFAULT '#10b981',
	"fontFamily" varchar(100) DEFAULT 'Inter',
	"address" text,
	"city" varchar(100),
	"country" varchar(100) DEFAULT 'RU',
	"postalCode" varchar(20),
	"phone" varchar(30),
	"email" varchar(100),
	"website" varchar(200),
	"mapCoordinates" varchar(100),
	"workingHours" varchar(200) DEFAULT 'Пн-Сб: 9:00-19:00',
	"currency" varchar(10) DEFAULT 'RUB',
	"timezone" varchar(50) DEFAULT 'Europe/Moscow',
	"language" varchar(10) DEFAULT 'ru',
	"featureOnlineBooking" boolean DEFAULT true NOT NULL,
	"featureVinDecoder" boolean DEFAULT true NOT NULL,
	"featureLoyaltyProgram" boolean DEFAULT true NOT NULL,
	"featurePartnerNetwork" boolean DEFAULT false NOT NULL,
	"featureMultiBranch" boolean DEFAULT false NOT NULL,
	"featureCorporateClients" boolean DEFAULT false NOT NULL,
	"featureSmsNotifications" boolean DEFAULT false NOT NULL,
	"featureEmailNotifications" boolean DEFAULT false NOT NULL,
	"maxEmployees" integer DEFAULT 50,
	"maxStorageItems" integer DEFAULT 1000,
	"integrationConfig" jsonb,
	"isSetupComplete" boolean DEFAULT false NOT NULL,
	"setupCompletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "autoservice"."Passport" ADD CONSTRAINT "Passport_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."RefreshTokens" ADD CONSTRAINT "RefreshTokens_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Users" ADD CONSTRAINT "Users_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "autoservice"."Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Employees" ADD CONSTRAINT "Employees_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Employees" ADD CONSTRAINT "Employees_positionId_Position_id_fk" FOREIGN KEY ("positionId") REFERENCES "autoservice"."Position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."WorkSchedule" ADD CONSTRAINT "WorkSchedule_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Invoices" ADD CONSTRAINT "Invoices_positionForBuyingId_PositionsForBuying_id_fk" FOREIGN KEY ("positionForBuyingId") REFERENCES "autoservice"."PositionsForBuying"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PositionsForBuying" ADD CONSTRAINT "PositionsForBuying_supplierId_Suppliers_id_fk" FOREIGN KEY ("supplierId") REFERENCES "autoservice"."Suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "autoservice"."Store"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."SparePart" ADD CONSTRAINT "SparePart_categoryId_Categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "autoservice"."Categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Services" ADD CONSTRAINT "Services_categoryId_ServiceCategories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "autoservice"."ServiceCategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Cars" ADD CONSTRAINT "Cars_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Reviews" ADD CONSTRAINT "Reviews_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Reviews" ADD CONSTRAINT "Reviews_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Subscriptions" ADD CONSTRAINT "Subscriptions_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Subscriptions" ADD CONSTRAINT "Subscriptions_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Payment" ADD CONSTRAINT "Payment_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Services_Orders" ADD CONSTRAINT "Services_Orders_servicesId_Services_id_fk" FOREIGN KEY ("servicesId") REFERENCES "autoservice"."Services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Services_Orders" ADD CONSTRAINT "Services_Orders_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_ordersId_Orders_id_fk" FOREIGN KEY ("ordersId") REFERENCES "autoservice"."Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_serviceId_Services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "autoservice"."Services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_timeSlotId_TimeSlots_id_fk" FOREIGN KEY ("timeSlotId") REFERENCES "autoservice"."TimeSlots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."TimeSlots" ADD CONSTRAINT "TimeSlots_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."NotificationChannels" ADD CONSTRAINT "NotificationChannels_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Notifications" ADD CONSTRAINT "Notifications_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Notifications" ADD CONSTRAINT "Notifications_templateId_NotificationTemplates_id_fk" FOREIGN KEY ("templateId") REFERENCES "autoservice"."NotificationTemplates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."DiagnosticResults" ADD CONSTRAINT "DiagnosticResults_sessionId_DiagnosticSessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "autoservice"."DiagnosticSessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."DiagnosticResults" ADD CONSTRAINT "DiagnosticResults_codeId_DiagnosticCodesCatalog_id_fk" FOREIGN KEY ("codeId") REFERENCES "autoservice"."DiagnosticCodesCatalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."DiagnosticSessions" ADD CONSTRAINT "DiagnosticSessions_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."DiagnosticSessions" ADD CONSTRAINT "DiagnosticSessions_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."MaintenanceReminders" ADD CONSTRAINT "MaintenanceReminders_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."MaintenanceReminders" ADD CONSTRAINT "MaintenanceReminders_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerApiKeys" ADD CONSTRAINT "PartnerApiKeys_partnerId_Partners_id_fk" FOREIGN KEY ("partnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerClientRedirects" ADD CONSTRAINT "PartnerClientRedirects_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerClientRedirects" ADD CONSTRAINT "PartnerClientRedirects_fromPartnerId_Partners_id_fk" FOREIGN KEY ("fromPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerClientRedirects" ADD CONSTRAINT "PartnerClientRedirects_toPartnerId_Partners_id_fk" FOREIGN KEY ("toPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerSparePartRequests" ADD CONSTRAINT "PartnerSparePartRequests_fromPartnerId_Partners_id_fk" FOREIGN KEY ("fromPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerSparePartRequests" ADD CONSTRAINT "PartnerSparePartRequests_toPartnerId_Partners_id_fk" FOREIGN KEY ("toPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."PartnerSparePartRequests" ADD CONSTRAINT "PartnerSparePartRequests_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."BranchEmployees" ADD CONSTRAINT "BranchEmployees_branchId_Branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "autoservice"."Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."BranchEmployees" ADD CONSTRAINT "BranchEmployees_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Branches" ADD CONSTRAINT "Branches_managerId_Users_id_fk" FOREIGN KEY ("managerId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_fromStoreId_Store_id_fk" FOREIGN KEY ("fromStoreId") REFERENCES "autoservice"."Store"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_toStoreId_Store_id_fk" FOREIGN KEY ("toStoreId") REFERENCES "autoservice"."Store"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_initiatedById_Users_id_fk" FOREIGN KEY ("initiatedById") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Warranties" ADD CONSTRAINT "Warranties_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Warranties" ADD CONSTRAINT "Warranties_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."WarrantyClaims" ADD CONSTRAINT "WarrantyClaims_warrantyId_Warranties_id_fk" FOREIGN KEY ("warrantyId") REFERENCES "autoservice"."Warranties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."WarrantyClaims" ADD CONSTRAINT "WarrantyClaims_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."Companies" ADD CONSTRAINT "Companies_managerUserId_Users_id_fk" FOREIGN KEY ("managerUserId") REFERENCES "autoservice"."Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."CompanyCars" ADD CONSTRAINT "CompanyCars_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "autoservice"."Companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."CompanyCars" ADD CONSTRAINT "CompanyCars_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."CompanyContracts" ADD CONSTRAINT "CompanyContracts_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "autoservice"."Companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."LoyaltyPrograms" ADD CONSTRAINT "LoyaltyPrograms_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."LoyaltyTransactions" ADD CONSTRAINT "LoyaltyTransactions_programId_LoyaltyPrograms_id_fk" FOREIGN KEY ("programId") REFERENCES "autoservice"."LoyaltyPrograms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."LoyaltyTransactions" ADD CONSTRAINT "LoyaltyTransactions_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."OrderDiscounts" ADD CONSTRAINT "OrderDiscounts_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "autoservice"."OrderDiscounts" ADD CONSTRAINT "OrderDiscounts_discountId_Discounts_id_fk" FOREIGN KEY ("discountId") REFERENCES "autoservice"."Discounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
