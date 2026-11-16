ALTER TABLE "messages" ADD COLUMN "search_tokens" text[];--> statement-breakpoint
CREATE INDEX "messages_search_tokens_idx" ON "messages" USING gin ("search_tokens");--> statement-breakpoint
CREATE INDEX "messages_unindexed_idx" ON "messages" ("id") WHERE "search_tokens" is null;