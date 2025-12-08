CREATE SCHEMA "autoservice";
--> statement-breakpoint
CREATE TYPE "autoservice"."gender" AS ENUM('M', 'F');--> statement-breakpoint
CREATE TYPE "autoservice"."oauth_provider" AS ENUM('google', 'local');--> statement-breakpoint
CREATE TABLE "autoservice"."Passport" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"identityNumber" varchar NOT NULL,
	"nationality" varchar NOT NULL,
	"birthDate" timestamp NOT NULL,
	"gender" "autoservice"."gender" NOT NULL,
	"expirationDate" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."RefreshTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "RefreshTokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "Role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"roleId" bigint NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"positionId" bigint NOT NULL,
	"hireDate" timestamp DEFAULT now() NOT NULL,
	"salary" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Position" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar
);
--> statement-breakpoint
CREATE TABLE "autoservice"."WorkSchedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" bigint NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"positionForBuyingId" bigint NOT NULL,
	"amount" numeric NOT NULL,
	"invoiceDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."PositionsForBuying" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplierId" bigint NOT NULL,
	"quantity" bigint NOT NULL,
	"deliveryDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."SparePart_Store" (
	"sparePartId" bigint NOT NULL,
	"storeId" bigint NOT NULL,
	"quantity" bigint DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "autoservice"."SparePart" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"partNumber" varchar NOT NULL,
	"price" numeric NOT NULL,
	"categoryId" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Store" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"contact" varchar(100),
	"address" text
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"name" varchar NOT NULL,
	"information" text,
	"year" bigint NOT NULL,
	"vin" varchar NOT NULL,
	"licensePlate" varchar
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"description" text,
	"rate" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"subscriptionDescription" text,
	"subscriptonName" varchar NOT NULL,
	"dateStart" timestamp DEFAULT now() NOT NULL,
	"dateEnd" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"carId" bigint NOT NULL,
	"employeeId" bigint NOT NULL,
	"status" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" bigint NOT NULL,
	"amount" numeric NOT NULL,
	"status" boolean NOT NULL,
	"paymentDate" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."Services_Orders" (
	"servicesId" bigint NOT NULL,
	"orderId" bigint NOT NULL,
	"quantity" bigint DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autoservice"."SparePart_Orders" (
	"sparePartId" bigint NOT NULL,
	"ordersId" bigint NOT NULL,
	"quantity" bigint DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE "autoservice"."Passport" ADD CONSTRAINT "Passport_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."RefreshTokens" ADD CONSTRAINT "RefreshTokens_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD CONSTRAINT "Users_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "autoservice"."Role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Employees" ADD CONSTRAINT "Employees_positionId_Position_id_fk" FOREIGN KEY ("positionId") REFERENCES "autoservice"."Position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."WorkSchedule" ADD CONSTRAINT "WorkSchedule_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Invoices" ADD CONSTRAINT "Invoices_positionForBuyingId_PositionsForBuying_id_fk" FOREIGN KEY ("positionForBuyingId") REFERENCES "autoservice"."PositionsForBuying"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PositionsForBuying" ADD CONSTRAINT "PositionsForBuying_supplierId_Suppliers_id_fk" FOREIGN KEY ("supplierId") REFERENCES "autoservice"."Suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "autoservice"."Store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD CONSTRAINT "SparePart_categoryId_Categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "autoservice"."Categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Cars" ADD CONSTRAINT "Cars_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Reviews" ADD CONSTRAINT "Reviews_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Subscriptions" ADD CONSTRAINT "Subscriptions_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "autoservice"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "autoservice"."Cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Orders" ADD CONSTRAINT "Orders_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Payment" ADD CONSTRAINT "Payment_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Services_Orders" ADD CONSTRAINT "Services_Orders_servicesId_Services_id_fk" FOREIGN KEY ("servicesId") REFERENCES "autoservice"."Services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Services_Orders" ADD CONSTRAINT "Services_Orders_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_ordersId_Orders_id_fk" FOREIGN KEY ("ordersId") REFERENCES "autoservice"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "refresh_token_idx" ON "autoservice"."RefreshTokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "refresh_user_idx" ON "autoservice"."RefreshTokens" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "role_name_idx" ON "autoservice"."Role" USING btree ("name");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "autoservice"."Users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "autoservice"."Users" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "user_oauth_idx" ON "autoservice"."Users" USING btree ("oauthId");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "autoservice"."Orders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "autoservice"."Orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_created_at_idx" ON "autoservice"."Orders" USING btree ("createdAt");