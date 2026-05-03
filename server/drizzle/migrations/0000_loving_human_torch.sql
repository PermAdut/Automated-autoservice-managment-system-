CREATE SCHEMA "autoservice";
--> statement-breakpoint
CREATE TYPE "autoservice"."gender" AS ENUM('M', 'F');--> statement-breakpoint
CREATE TYPE "autoservice"."oauth_provider" AS ENUM('google', 'local');--> statement-breakpoint
CREATE TYPE "autoservice"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "autoservice"."appointment_status" AS ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "autoservice"."notification_channel" AS ENUM('email', 'sms', 'push');--> statement-breakpoint
CREATE TYPE "autoservice"."notification_status" AS ENUM('pending', 'sent', 'failed', 'delivered');--> statement-breakpoint
CREATE TYPE "autoservice"."dtc_severity" AS ENUM('info', 'low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "autoservice"."reminder_type" AS ENUM('oil_change', 'tire_rotation', 'brake_service', 'scheduled_maintenance', 'timing_belt', 'other');--> statement-breakpoint
CREATE TYPE "autoservice"."part_request_status" AS ENUM('pending', 'approved', 'rejected', 'transferred', 'cancelled');--> statement-breakpoint
CREATE TYPE "autoservice"."partner_status" AS ENUM('active', 'pending', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "autoservice"."transfer_status" AS ENUM('pending', 'in_transit', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "autoservice"."warranty_claim_status" AS ENUM('open', 'under_review', 'approved', 'rejected', 'resolved');--> statement-breakpoint
CREATE TYPE "autoservice"."warranty_status" AS ENUM('active', 'expired', 'claimed', 'voided');--> statement-breakpoint
CREATE TYPE "autoservice"."warranty_type" AS ENUM('work', 'spare_part', 'complex');--> statement-breakpoint
CREATE TYPE "autoservice"."contract_status" AS ENUM('draft', 'active', 'suspended', 'expired', 'terminated');--> statement-breakpoint
CREATE TYPE "autoservice"."discount_type" AS ENUM('percent', 'fixed', 'free_service');--> statement-breakpoint
CREATE TYPE "autoservice"."loyalty_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "autoservice"."loyalty_tx_type" AS ENUM('earn', 'spend', 'bonus', 'expire', 'adjustment');--> statement-breakpoint
CREATE TABLE "autoservice"."Passport" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"identityNumber" varchar NOT NULL,
	"birthDate" timestamp NOT NULL,
	"gender" "autoservice"."gender" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."RefreshTokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RefreshTokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "Role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."Position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "autoservice"."WorkSchedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" uuid NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"positionForBuyingId" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"invoiceDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."PositionsForBuying" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplierId" uuid NOT NULL,
	"quantity" bigint NOT NULL,
	"deliveryDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."SparePart_Store" (
	"sparePartId" uuid NOT NULL,
	"storeId" uuid NOT NULL,
	"quantity" bigint DEFAULT 1,
	CONSTRAINT "SparePart_Store_sparePartId_storeId_pk" PRIMARY KEY("sparePartId","storeId")
);
--> statement-breakpoint
CREATE TABLE "autoservice"."SparePart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"partNumber" varchar NOT NULL,
	"price" numeric NOT NULL,
	"categoryId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(200) NOT NULL,
	"phone" varchar(20),
	"workingHours" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"contact" varchar(100),
	"address" text
);
--> statement-breakpoint
CREATE TABLE "autoservice"."ServiceCategories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"parentId" uuid,
	"isActive" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ServiceCategories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoryId" uuid,
	"name" varchar NOT NULL,
	"description" varchar,
	"price" numeric NOT NULL,
	"durationMinutes" numeric,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."Subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"employeeId" uuid,
	"subscriptionDescription" text,
	"subscriptionName" varchar NOT NULL,
	"dateStart" timestamp DEFAULT now() NOT NULL,
	"dateEnd" timestamp NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."Payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"amount" numeric NOT NULL,
	"status" "autoservice"."payment_status" DEFAULT 'pending' NOT NULL,
	"paymentDate" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Services_Orders" (
	"servicesId" uuid NOT NULL,
	"orderId" uuid NOT NULL,
	"quantity" bigint DEFAULT 1 NOT NULL,
	CONSTRAINT "Services_Orders_servicesId_orderId_pk" PRIMARY KEY("servicesId","orderId")
);
--> statement-breakpoint
CREATE TABLE "autoservice"."SparePart_Orders" (
	"sparePartId" uuid NOT NULL,
	"ordersId" uuid NOT NULL,
	"quantity" bigint DEFAULT 1,
	CONSTRAINT "SparePart_Orders_sparePartId_ordersId_pk" PRIMARY KEY("sparePartId","ordersId")
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."TimeSlots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isBooked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."NotificationChannels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"channel" "autoservice"."notification_channel" NOT NULL,
	"address" varchar(200) NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."DiagnosticResults" (
	"sessionId" uuid NOT NULL,
	"codeId" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notes" text,
	CONSTRAINT "DiagnosticResults_sessionId_codeId_pk" PRIMARY KEY("sessionId","codeId")
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."BranchEmployees" (
	"branchId" uuid NOT NULL,
	"employeeId" uuid NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"isPrimary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "BranchEmployees_branchId_employeeId_pk" PRIMARY KEY("branchId","employeeId")
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."CompanyCars" (
	"companyId" uuid NOT NULL,
	"carId" uuid NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL,
	"notes" varchar(500),
	CONSTRAINT "CompanyCars_companyId_carId_pk" PRIMARY KEY("companyId","carId")
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "autoservice"."LoyaltyTransactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"programId" uuid NOT NULL,
	"orderId" uuid,
	"type" "autoservice"."loyalty_tx_type" NOT NULL,
	"points" integer NOT NULL,
	"description" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."OrderDiscounts" (
	"orderId" uuid NOT NULL,
	"discountId" uuid NOT NULL,
	"appliedAmount" numeric(10, 2) NOT NULL,
	"appliedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "OrderDiscounts_orderId_discountId_pk" PRIMARY KEY("orderId","discountId")
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "autoservice"."Passport" ADD CONSTRAINT "Passport_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."RefreshTokens" ADD CONSTRAINT "RefreshTokens_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD CONSTRAINT "Users_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "autoservice"."Role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Employees" ADD CONSTRAINT "Employees_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Employees" ADD CONSTRAINT "Employees_positionId_Position_id_fk" FOREIGN KEY ("positionId") REFERENCES "autoservice"."Position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."WorkSchedule" ADD CONSTRAINT "WorkSchedule_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Invoices" ADD CONSTRAINT "Invoices_positionForBuyingId_PositionsForBuying_id_fk" FOREIGN KEY ("positionForBuyingId") REFERENCES "autoservice"."PositionsForBuying"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PositionsForBuying" ADD CONSTRAINT "PositionsForBuying_supplierId_Suppliers_id_fk" FOREIGN KEY ("supplierId") REFERENCES "autoservice"."Suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "autoservice"."Store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD CONSTRAINT "SparePart_categoryId_Categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "autoservice"."Categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Services" ADD CONSTRAINT "Services_categoryId_ServiceCategories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "autoservice"."ServiceCategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Cars" ADD CONSTRAINT "Cars_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Reviews" ADD CONSTRAINT "Reviews_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Reviews" ADD CONSTRAINT "Reviews_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Subscriptions" ADD CONSTRAINT "Subscriptions_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Subscriptions" ADD CONSTRAINT "Subscriptions_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Payment" ADD CONSTRAINT "Payment_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Services_Orders" ADD CONSTRAINT "Services_Orders_servicesId_Services_id_fk" FOREIGN KEY ("servicesId") REFERENCES "autoservice"."Services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Services_Orders" ADD CONSTRAINT "Services_Orders_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_ordersId_Orders_id_fk" FOREIGN KEY ("ordersId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_serviceId_Services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "autoservice"."Services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Appointments" ADD CONSTRAINT "Appointments_timeSlotId_TimeSlots_id_fk" FOREIGN KEY ("timeSlotId") REFERENCES "autoservice"."TimeSlots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."TimeSlots" ADD CONSTRAINT "TimeSlots_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."NotificationChannels" ADD CONSTRAINT "NotificationChannels_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Notifications" ADD CONSTRAINT "Notifications_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Notifications" ADD CONSTRAINT "Notifications_templateId_NotificationTemplates_id_fk" FOREIGN KEY ("templateId") REFERENCES "autoservice"."NotificationTemplates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."DiagnosticResults" ADD CONSTRAINT "DiagnosticResults_sessionId_DiagnosticSessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "autoservice"."DiagnosticSessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."DiagnosticResults" ADD CONSTRAINT "DiagnosticResults_codeId_DiagnosticCodesCatalog_id_fk" FOREIGN KEY ("codeId") REFERENCES "autoservice"."DiagnosticCodesCatalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."DiagnosticSessions" ADD CONSTRAINT "DiagnosticSessions_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."DiagnosticSessions" ADD CONSTRAINT "DiagnosticSessions_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."MaintenanceReminders" ADD CONSTRAINT "MaintenanceReminders_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."MaintenanceReminders" ADD CONSTRAINT "MaintenanceReminders_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerApiKeys" ADD CONSTRAINT "PartnerApiKeys_partnerId_Partners_id_fk" FOREIGN KEY ("partnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerClientRedirects" ADD CONSTRAINT "PartnerClientRedirects_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerClientRedirects" ADD CONSTRAINT "PartnerClientRedirects_fromPartnerId_Partners_id_fk" FOREIGN KEY ("fromPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerClientRedirects" ADD CONSTRAINT "PartnerClientRedirects_toPartnerId_Partners_id_fk" FOREIGN KEY ("toPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerSparePartRequests" ADD CONSTRAINT "PartnerSparePartRequests_fromPartnerId_Partners_id_fk" FOREIGN KEY ("fromPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerSparePartRequests" ADD CONSTRAINT "PartnerSparePartRequests_toPartnerId_Partners_id_fk" FOREIGN KEY ("toPartnerId") REFERENCES "autoservice"."Partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PartnerSparePartRequests" ADD CONSTRAINT "PartnerSparePartRequests_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."BranchEmployees" ADD CONSTRAINT "BranchEmployees_branchId_Branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "autoservice"."Branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."BranchEmployees" ADD CONSTRAINT "BranchEmployees_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Branches" ADD CONSTRAINT "Branches_managerId_Users_id_fk" FOREIGN KEY ("managerId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_fromStoreId_Store_id_fk" FOREIGN KEY ("fromStoreId") REFERENCES "autoservice"."Store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_toStoreId_Store_id_fk" FOREIGN KEY ("toStoreId") REFERENCES "autoservice"."Store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."StoreTransfers" ADD CONSTRAINT "StoreTransfers_initiatedById_Users_id_fk" FOREIGN KEY ("initiatedById") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Warranties" ADD CONSTRAINT "Warranties_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Warranties" ADD CONSTRAINT "Warranties_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."WarrantyClaims" ADD CONSTRAINT "WarrantyClaims_warrantyId_Warranties_id_fk" FOREIGN KEY ("warrantyId") REFERENCES "autoservice"."Warranties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."WarrantyClaims" ADD CONSTRAINT "WarrantyClaims_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Companies" ADD CONSTRAINT "Companies_managerUserId_Users_id_fk" FOREIGN KEY ("managerUserId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."CompanyCars" ADD CONSTRAINT "CompanyCars_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "autoservice"."Companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."CompanyCars" ADD CONSTRAINT "CompanyCars_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."CompanyContracts" ADD CONSTRAINT "CompanyContracts_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "autoservice"."Companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."LoyaltyPrograms" ADD CONSTRAINT "LoyaltyPrograms_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."LoyaltyTransactions" ADD CONSTRAINT "LoyaltyTransactions_programId_LoyaltyPrograms_id_fk" FOREIGN KEY ("programId") REFERENCES "autoservice"."LoyaltyPrograms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."LoyaltyTransactions" ADD CONSTRAINT "LoyaltyTransactions_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."OrderDiscounts" ADD CONSTRAINT "OrderDiscounts_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."OrderDiscounts" ADD CONSTRAINT "OrderDiscounts_discountId_Discounts_id_fk" FOREIGN KEY ("discountId") REFERENCES "autoservice"."Discounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "refresh_token_idx" ON "autoservice"."RefreshTokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "refresh_user_idx" ON "autoservice"."RefreshTokens" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "role_name_idx" ON "autoservice"."Role" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "autoservice"."Users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "autoservice"."Users" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "user_oauth_idx" ON "autoservice"."Users" USING btree ("oauthId");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "autoservice"."Orders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "autoservice"."Orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_created_at_idx" ON "autoservice"."Orders" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "appointment_user_idx" ON "autoservice"."Appointments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "appointment_status_idx" ON "autoservice"."Appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "appointment_scheduled_at_idx" ON "autoservice"."Appointments" USING btree ("scheduledAt");--> statement-breakpoint
CREATE INDEX "timeslot_employee_date_idx" ON "autoservice"."TimeSlots" USING btree ("employeeId","date");--> statement-breakpoint
CREATE INDEX "timeslot_date_idx" ON "autoservice"."TimeSlots" USING btree ("date");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "autoservice"."Notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "notification_status_idx" ON "autoservice"."Notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "autoservice"."Notifications" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "dtc_code_idx" ON "autoservice"."DiagnosticCodesCatalog" USING btree ("code");--> statement-breakpoint
CREATE INDEX "diag_session_car_idx" ON "autoservice"."DiagnosticSessions" USING btree ("carId");--> statement-breakpoint
CREATE INDEX "diag_session_created_at_idx" ON "autoservice"."DiagnosticSessions" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "reminder_user_idx" ON "autoservice"."MaintenanceReminders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "reminder_car_idx" ON "autoservice"."MaintenanceReminders" USING btree ("carId");--> statement-breakpoint
CREATE INDEX "reminder_due_date_idx" ON "autoservice"."MaintenanceReminders" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "partner_api_key_idx" ON "autoservice"."PartnerApiKeys" USING btree ("keyHash");--> statement-breakpoint
CREATE INDEX "partner_api_partner_idx" ON "autoservice"."PartnerApiKeys" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "redirect_user_idx" ON "autoservice"."PartnerClientRedirects" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "part_req_from_idx" ON "autoservice"."PartnerSparePartRequests" USING btree ("fromPartnerId");--> statement-breakpoint
CREATE INDEX "part_req_status_idx" ON "autoservice"."PartnerSparePartRequests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partner_status_idx" ON "autoservice"."Partners" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partner_city_idx" ON "autoservice"."Partners" USING btree ("city");--> statement-breakpoint
CREATE INDEX "branch_city_idx" ON "autoservice"."Branches" USING btree ("city");--> statement-breakpoint
CREATE INDEX "branch_active_idx" ON "autoservice"."Branches" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "transfer_from_store_idx" ON "autoservice"."StoreTransfers" USING btree ("fromStoreId");--> statement-breakpoint
CREATE INDEX "transfer_status_idx" ON "autoservice"."StoreTransfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "warranty_order_idx" ON "autoservice"."Warranties" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "warranty_status_idx" ON "autoservice"."Warranties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "warranty_expires_at_idx" ON "autoservice"."Warranties" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "claim_warranty_idx" ON "autoservice"."WarrantyClaims" USING btree ("warrantyId");--> statement-breakpoint
CREATE INDEX "claim_user_idx" ON "autoservice"."WarrantyClaims" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "claim_status_idx" ON "autoservice"."WarrantyClaims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_inn_idx" ON "autoservice"."Companies" USING btree ("inn");--> statement-breakpoint
CREATE INDEX "company_city_idx" ON "autoservice"."Companies" USING btree ("city");--> statement-breakpoint
CREATE INDEX "contract_company_idx" ON "autoservice"."CompanyContracts" USING btree ("companyId");--> statement-breakpoint
CREATE INDEX "contract_status_idx" ON "autoservice"."CompanyContracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contract_end_date_idx" ON "autoservice"."CompanyContracts" USING btree ("endDate");--> statement-breakpoint
CREATE INDEX "discount_code_idx" ON "autoservice"."Discounts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "discount_active_idx" ON "autoservice"."Discounts" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "discount_end_date_idx" ON "autoservice"."Discounts" USING btree ("endDate");--> statement-breakpoint
CREATE INDEX "loyalty_user_idx" ON "autoservice"."LoyaltyPrograms" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "loyalty_tier_idx" ON "autoservice"."LoyaltyPrograms" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "loyalty_tx_program_idx" ON "autoservice"."LoyaltyTransactions" USING btree ("programId");--> statement-breakpoint
CREATE INDEX "loyalty_tx_created_at_idx" ON "autoservice"."LoyaltyTransactions" USING btree ("createdAt");