ALTER TABLE "schedules" ADD COLUMN "failures" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "running_since" timestamp with time zone;