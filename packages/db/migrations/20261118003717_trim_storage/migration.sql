DROP INDEX "known_domains_domain_idx";--> statement-breakpoint
CREATE INDEX "bulk_prints_created_at_idx" ON "bulk_prints" ("created_at");--> statement-breakpoint
CREATE INDEX "messages_html_kept_idx" ON "messages" ("received_at") WHERE "html" is not null;