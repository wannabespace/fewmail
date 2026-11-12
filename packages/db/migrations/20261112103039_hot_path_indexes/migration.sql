CREATE INDEX "actions_user_thread_idx" ON "actions" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "actions_message_idx" ON "actions" ("message_id");--> statement-breakpoint
CREATE INDEX "messages_user_from_idx" ON "messages" ("user_id","from_email");--> statement-breakpoint
CREATE INDEX "messages_label_ids_idx" ON "messages" USING gin ("label_ids");--> statement-breakpoint
CREATE INDEX "messages_to_idx" ON "messages" USING gin ("to");--> statement-breakpoint
CREATE INDEX "messages_cc_idx" ON "messages" USING gin ("cc");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" ("user_id");