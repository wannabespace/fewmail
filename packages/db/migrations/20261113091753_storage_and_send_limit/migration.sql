ALTER TABLE "mailboxes" ADD COLUMN "send_blocked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD COLUMN "storage_full_at" timestamp with time zone;