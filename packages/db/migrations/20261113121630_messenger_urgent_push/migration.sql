ALTER TABLE "telegram_links" ADD COLUMN "urgent_push" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "whatsapp_links" ADD COLUMN "urgent_push" boolean DEFAULT true NOT NULL;