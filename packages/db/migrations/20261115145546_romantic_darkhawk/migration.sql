ALTER TABLE "board_entries" ADD COLUMN "payment" text;--> statement-breakpoint
UPDATE "board_entries" SET "payment" = CASE WHEN "amount_cents" < 0 THEN 'refund' ELSE 'paid' END WHERE "amount_cents" IS NOT NULL AND "edited_at" IS NOT NULL;--> statement-breakpoint
UPDATE "boards" SET "history_read_at" = NULL, "history_found" = NULL WHERE "id" IN (SELECT "board_id" FROM "board_entries" WHERE "amount_cents" IS NOT NULL AND "edited_at" IS NULL);--> statement-breakpoint
DELETE FROM "board_entries" WHERE "amount_cents" IS NOT NULL AND "edited_at" IS NULL AND "dismissed_at" IS NULL;
