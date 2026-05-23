ALTER TABLE "autoservice"."Users" ADD COLUMN "avatarUrl" text;--> statement-breakpoint
ALTER TABLE "autoservice"."Users" ADD COLUMN "isBlocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "autoservice"."Cars" ADD COLUMN "mileage" integer;
