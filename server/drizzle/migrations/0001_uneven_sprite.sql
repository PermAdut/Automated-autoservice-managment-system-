ALTER TABLE "autoservice"."Passport" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."RefreshTokens" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Employees" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Position" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."WorkSchedule" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Categories" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Invoices" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."PositionsForBuying" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Store" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Store" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Suppliers" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."ServiceCategories" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Services" ADD COLUMN "tenantId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."Passport" ADD CONSTRAINT "Passport_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."RefreshTokens" ADD CONSTRAINT "RefreshTokens_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD CONSTRAINT "Users_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Employees" ADD CONSTRAINT "Employees_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Position" ADD CONSTRAINT "Position_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."WorkSchedule" ADD CONSTRAINT "WorkSchedule_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Categories" ADD CONSTRAINT "Categories_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Invoices" ADD CONSTRAINT "Invoices_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."PositionsForBuying" ADD CONSTRAINT "PositionsForBuying_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart_Store" ADD CONSTRAINT "SparePart_Store_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."SparePart" ADD CONSTRAINT "SparePart_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Store" ADD CONSTRAINT "Store_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Suppliers" ADD CONSTRAINT "Suppliers_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."ServiceCategories" ADD CONSTRAINT "ServiceCategories_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autoservice"."Services" ADD CONSTRAINT "Services_tenantId_TenantSettings_id_fk" FOREIGN KEY ("tenantId") REFERENCES "autoservice"."TenantSettings"("id") ON DELETE no action ON UPDATE no action;