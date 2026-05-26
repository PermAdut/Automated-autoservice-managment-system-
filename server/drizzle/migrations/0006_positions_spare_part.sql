ALTER TABLE "autoservice"."PositionsForBuying" ADD COLUMN "sparePartId" uuid;--> statement-breakpoint
ALTER TABLE "autoservice"."PositionsForBuying" ADD CONSTRAINT "PositionsForBuying_sparePartId_SparePart_id_fk" FOREIGN KEY ("sparePartId") REFERENCES "autoservice"."SparePart"("id") ON DELETE no action ON UPDATE no action;
