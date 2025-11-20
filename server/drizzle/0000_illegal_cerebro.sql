CREATE TYPE "public"."gender" AS ENUM('M', 'F');--> statement-breakpoint
CREATE TABLE "Cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"name" varchar NOT NULL,
	"information" text,
	"year" bigint NOT NULL,
	"vin" varchar NOT NULL,
	"licensePlate" varchar
);
--> statement-breakpoint
CREATE TABLE "Categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "Employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"positionId" bigint NOT NULL,
	"hireDate" timestamp DEFAULT now() NOT NULL,
	"salary" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"positionForBuyingId" bigint NOT NULL,
	"amount" numeric NOT NULL,
	"invoiceDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Orders" (
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
CREATE TABLE "Passport" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"identityNumber" varchar NOT NULL,
	"nationality" varchar NOT NULL,
	"birthDate" timestamp NOT NULL,
	"gender" "gender" NOT NULL,
	"expirationDate" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" bigint NOT NULL,
	"amount" numeric NOT NULL,
	"status" boolean NOT NULL,
	"paymentDate" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Position" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "PositionsForBuying" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplierId" bigint NOT NULL,
	"quantity" bigint NOT NULL,
	"deliveryDate" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"description" text,
	"rate" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "Role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar,
	"price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Services_Orders" (
	"servicesId" bigint NOT NULL,
	"orderId" bigint NOT NULL,
	"quantity" bigint DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SparePart_Orders" (
	"sparePartId" bigint NOT NULL,
	"ordersId" bigint NOT NULL,
	"quantity" bigint DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "SparePart_Store" (
	"sparePartId" bigint NOT NULL,
	"storeId" bigint NOT NULL,
	"quantity" bigint DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "SparePart" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"partNumber" varchar NOT NULL,
	"price" numeric NOT NULL,
	"categoryId" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Store" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" bigint NOT NULL,
	"subscriptionDescription" text,
	"subscriptonName" varchar NOT NULL,
	"dateStart" timestamp DEFAULT now() NOT NULL,
	"dateEnd" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"contact" varchar(100),
	"address" text
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"roleId" bigint NOT NULL,
	"login" varchar NOT NULL,
	"name" varchar NOT NULL,
	"surName" varchar NOT NULL,
	"email" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"passwordHash" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "Users_email_login_phone_unique" UNIQUE("email","login","phone")
);
--> statement-breakpoint
CREATE TABLE "WorkSchedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeId" bigint NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Cars" ADD CONSTRAINT "Cars_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_positionId_Position_id_fk" FOREIGN KEY ("positionId") REFERENCES "public"."Position"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_positionForBuyingId_PositionsForBuying_id_fk" FOREIGN KEY ("positionForBuyingId") REFERENCES "public"."PositionsForBuying"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_carId_Cars_id_fk" FOREIGN KEY ("carId") REFERENCES "public"."Cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "public"."Employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Passport" ADD CONSTRAINT "Passport_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PositionsForBuying" ADD CONSTRAINT "PositionsForBuying_supplierId_Suppliers_id_fk" FOREIGN KEY ("supplierId") REFERENCES "public"."Suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Services_Orders" ADD CONSTRAINT "Services_Orders_servicesId_Services_id_fk" FOREIGN KEY ("servicesId") REFERENCES "public"."Services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Services_Orders" ADD CONSTRAINT "Services_Orders_orderId_Orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "public"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SparePart_Orders" ADD CONSTRAINT "SparePart_Orders_ordersId_Orders_id_fk" FOREIGN KEY ("ordersId") REFERENCES "public"."Orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SparePart_Store" ADD CONSTRAINT "SparePart_Store_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "public"."SparePart"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SparePart_Store" ADD CONSTRAINT "SparePart_Store_storeId_Store_id_fk" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "SparePart" ADD CONSTRAINT "SparePart_categoryId_Categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."Categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Users" ADD CONSTRAINT "Users_roleId_Role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "public"."Employees"("id") ON DELETE no action ON UPDATE no action;