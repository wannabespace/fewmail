ALTER TABLE "case_items" DROP CONSTRAINT "case_items_case_id_cases_id_fkey";--> statement-breakpoint
ALTER TABLE "case_mail" DROP CONSTRAINT "case_mail_case_id_cases_id_fkey";--> statement-breakpoint
DROP TABLE "case_items";--> statement-breakpoint
DROP TABLE "case_mail";--> statement-breakpoint
DROP TABLE "cases";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "cases_scanned_at";