ALTER TABLE "messages" ADD COLUMN "attachments" text;--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "attachments" text;