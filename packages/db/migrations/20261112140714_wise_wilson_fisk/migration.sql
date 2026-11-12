ALTER TABLE "board_entries" ADD COLUMN "dismissed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "board_entries" ADD COLUMN "edited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "history_found" integer;--> statement-breakpoint
ALTER TABLE "boards" ADD COLUMN "position" smallint DEFAULT 0 NOT NULL;