DROP TABLE "briefs";--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "morning_sent_at" timestamp with time zone;--> statement-breakpoint
UPDATE "user_settings" SET "morning_sent_at" = now();--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "voice_brief";
