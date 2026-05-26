CREATE TABLE "autoservice"."ProductionPosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branchId" uuid NOT NULL,
	"name" varchar NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "autoservice"."ProductionPosts" ADD CONSTRAINT "ProductionPosts_branchId_Branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "autoservice"."Branches"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD COLUMN "branchId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD COLUMN "postId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD COLUMN "scheduledStartAt" timestamp;
--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_branchId_Branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "autoservice"."Branches"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_postId_ProductionPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "autoservice"."ProductionPosts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."Store" ADD COLUMN "branchId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."Store" ADD CONSTRAINT "Store_branchId_Branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "autoservice"."Branches"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."TimeSlots" ADD COLUMN "postId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."TimeSlots" ADD CONSTRAINT "TimeSlots_postId_ProductionPosts_id_fk" FOREIGN KEY ("postId") REFERENCES "autoservice"."ProductionPosts"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD COLUMN "minQuantity" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD COLUMN "supplierId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD COLUMN "reservedQuantity" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD CONSTRAINT "SparePart_supplierId_Suppliers_id_fk" FOREIGN KEY ("supplierId") REFERENCES "autoservice"."Suppliers"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "autoservice"."StockMovements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sparePartId" uuid NOT NULL,
	"storeId" uuid NOT NULL,
	"type" varchar NOT NULL,
	"quantity" bigint NOT NULL,
	"orderId" uuid,
	"userId" uuid,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "autoservice"."StockMovements" ADD CONSTRAINT "StockMovements_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."StockMovements" ADD CONSTRAINT "StockMovements_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "autoservice"."Store"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."StockMovements" ADD CONSTRAINT "StockMovements_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."StockMovements" ADD CONSTRAINT "StockMovements_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."Companies" ADD COLUMN "bankAccount" varchar;
--> statement-breakpoint
ALTER TABLE "autoservice"."Companies" ADD COLUMN "bic" varchar;
--> statement-breakpoint
CREATE TABLE "autoservice"."CompanyDrivers" (
	"companyId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "CompanyDrivers_companyId_userId_pk" PRIMARY KEY("companyId","userId")
);
--> statement-breakpoint
ALTER TABLE "autoservice"."CompanyDrivers" ADD CONSTRAINT "CompanyDrivers_companyId_Companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "autoservice"."Companies"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."CompanyDrivers" ADD CONSTRAINT "CompanyDrivers_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."Discounts" ADD COLUMN "userId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."Discounts" ADD CONSTRAINT "Discounts_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."TenantSettings" ADD COLUMN "loyaltyPointsPerRub" numeric DEFAULT 0.1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "autoservice"."TenantSettings" ADD COLUMN "loyaltyMaxSpendPercent" integer DEFAULT 20 NOT NULL;
--> statement-breakpoint
ALTER TABLE "autoservice"."TenantSettings" DROP COLUMN IF EXISTS "featureSmsNotifications";
--> statement-breakpoint
CREATE TABLE "autoservice"."SyncLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"operation" varchar NOT NULL,
	"entity" varchar NOT NULL,
	"entityId" uuid NOT NULL,
	"status" varchar NOT NULL,
	"error" text,
	"syncedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "autoservice"."SyncLog" ADD CONSTRAINT "SyncLog_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD COLUMN "branchId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD CONSTRAINT "Users_branchId_Branches_id_fk" FOREIGN KEY ("branchId") REFERENCES "autoservice"."Branches"("id") ON DELETE no action ON UPDATE no action;
