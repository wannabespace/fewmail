ALTER TABLE "usage" ADD COLUMN "spent" numeric(12,8) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" DROP COLUMN "emails";--> statement-breakpoint
ALTER TABLE "usage" DROP COLUMN "messages";--> statement-breakpoint
ALTER TABLE "usage" DROP COLUMN "speech";