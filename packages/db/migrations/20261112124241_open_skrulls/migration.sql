ALTER TABLE "user_settings" ADD COLUMN "today_opened_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "today_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "brief_hour" SET DEFAULT 8;