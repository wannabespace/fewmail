ALTER TABLE "boards" ADD COLUMN "period_days" smallint DEFAULT 90 NOT NULL;--> statement-breakpoint
UPDATE "boards" SET "period_days" = 180;
