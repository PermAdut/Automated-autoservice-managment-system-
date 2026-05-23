CREATE TABLE "autoservice"."WorkTypes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"tenantId" uuid
);
--> statement-breakpoint
CREATE TABLE "autoservice"."EmployeeQualifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employeeId" uuid NOT NULL,
	"workTypeId" uuid NOT NULL,
	"level" integer NOT NULL,
	"tenantId" uuid
);
--> statement-breakpoint
ALTER TABLE "autoservice"."EmployeeQualifications" ADD CONSTRAINT "EmployeeQualifications_employeeId_Employees_id_fk" FOREIGN KEY ("employeeId") REFERENCES "autoservice"."Employees"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "autoservice"."EmployeeQualifications" ADD CONSTRAINT "EmployeeQualifications_workTypeId_WorkTypes_id_fk" FOREIGN KEY ("workTypeId") REFERENCES "autoservice"."WorkTypes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "employee_work_type_unique" ON "autoservice"."EmployeeQualifications" USING btree ("employeeId","workTypeId");
--> statement-breakpoint
ALTER TABLE "autoservice"."Services" ADD COLUMN "workTypeId" uuid;
--> statement-breakpoint
ALTER TABLE "autoservice"."Services" ADD COLUMN "requiredQualificationLevel" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "autoservice"."Services" ADD CONSTRAINT "Services_workTypeId_WorkTypes_id_fk" FOREIGN KEY ("workTypeId") REFERENCES "autoservice"."WorkTypes"("id") ON DELETE no action ON UPDATE no action;
