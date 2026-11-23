CREATE TABLE "accounts" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp with time zone,
	"account_id" text NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"autonomous" boolean NOT NULL,
	"banner_dismissed_at" timestamp with time zone,
	"detail" text,
	"kind" text NOT NULL,
	"message_id" uuid,
	"notified_at" timestamp with time zone,
	"payload" text,
	"reason" text NOT NULL,
	"resolved_at" timestamp with time zone,
	"bot_id" uuid,
	"status" text NOT NULL,
	"thread_id" text,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_write_tokens" integer DEFAULT 0 NOT NULL,
	"cost" numeric(12,8),
	"feature" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"model" text NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analyses" (
	"category" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"extracted" text NOT NULL,
	"importance" smallint NOT NULL,
	"message_id" uuid PRIMARY KEY,
	"model" text NOT NULL,
	"needs_reply" boolean NOT NULL,
	"reason" text NOT NULL,
	"bot_id" uuid,
	"suggested_action" text,
	"summary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_messages" (
	"action_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exchange" text,
	"key" text PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "bot_posts" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"bot" text NOT NULL,
	"counts" jsonb,
	"delivered_at" timestamp with time zone,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" text NOT NULL,
	"reaction" text,
	"reply_to" uuid,
	"text" text,
	"thread_id" text,
	"tools" text[] DEFAULT '{}'::text[] NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bots" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"effect" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"instruction" text,
	"match" text,
	"name" text NOT NULL,
	"paused_until" timestamp with time zone,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bulk_prints" (
	"band0" integer NOT NULL,
	"band1" integer NOT NULL,
	"band2" integer NOT NULL,
	"band3" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"print" text NOT NULL,
	"user_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitment_events" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"by" text NOT NULL,
	"commitment_id" uuid NOT NULL,
	"from" text,
	"message_id" uuid,
	"to" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commitments" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"amount_cents" integer,
	"currency" text,
	"due_at" timestamp with time zone NOT NULL,
	"edited_at" timestamp with time zone,
	"evidence_message_id" uuid,
	"kind" text DEFAULT 'mine' NOT NULL,
	"message_id" uuid,
	"promise" text NOT NULL,
	"recipient" text,
	"reminded_at" timestamp with time zone,
	"status" text NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "declined_bot_suggestions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sender_hash" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action_id" uuid,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"channel" text NOT NULL,
	"group_id" uuid NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notice" text NOT NULL,
	"sent_at" timestamp with time zone,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"keys" text,
	"kind" text NOT NULL,
	"seen_at" timestamp with time zone,
	"token" text NOT NULL UNIQUE,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_ages" (
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"domain" text PRIMARY KEY,
	"registered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "domain_sightings" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"domain" text,
	"user_hash" text,
	CONSTRAINT "domain_sightings_pkey" PRIMARY KEY("domain","user_hash")
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"alg" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"crv" text,
	"expires_at" timestamp with time zone,
	"id" uuid PRIMARY KEY,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "known_domains" (
	"domain" text,
	"list" text,
	"rank" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "known_domains_pkey" PRIMARY KEY("list","domain")
);
--> statement-breakpoint
CREATE TABLE "list_sightings" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"list_hash" text,
	"user_hash" text,
	CONSTRAINT "list_sightings_pkey" PRIMARY KEY("list_hash","user_hash")
);
--> statement-breakpoint
CREATE TABLE "mailboxes" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"address_hash" text,
	"email" text NOT NULL,
	"google_account_id" text,
	"held_since" timestamp with time zone DEFAULT now() NOT NULL,
	"history_id" text,
	"label_ids" jsonb DEFAULT '{}' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"refresh_token" text,
	"send_blocked_until" timestamp with time zone,
	"storage_full_at" timestamp with time zone,
	"sync_error" text,
	"sync_started_at" timestamp with time zone,
	"sync_requested" boolean DEFAULT false NOT NULL,
	"user_id" uuid NOT NULL,
	"watch_expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL,
	"auth" jsonb,
	"bulk_count" integer,
	"cc" text NOT NULL,
	"code" text,
	"from_domain" text NOT NULL,
	"from_email" text NOT NULL,
	"from_name" text,
	"gmail_id" text NOT NULL,
	"attachments" text NOT NULL,
	"has_attachments" boolean NOT NULL,
	"html" text,
	"is_from_me" boolean NOT NULL,
	"is_unread" boolean NOT NULL,
	"read_by_archive" boolean DEFAULT false NOT NULL,
	"label_ids" text[] NOT NULL,
	"list_id" text,
	"list_unsubscribe" text,
	"list_unsubscribe_post" text,
	"mailbox_id" uuid NOT NULL,
	"infra_hash" text,
	"message_id_header" text,
	"received_at" timestamp with time zone NOT NULL,
	"reply_to" text,
	"risk" jsonb,
	"search_tokens" text[] NOT NULL,
	"snippet" text NOT NULL,
	"suspicion" smallint,
	"subject" text NOT NULL,
	"thread_id" text NOT NULL,
	"to" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_access_tokens" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"authorization_code_id" text,
	"client_id" text NOT NULL,
	"confirmation" jsonb,
	"expires_at" timestamp with time zone,
	"reference_id" text,
	"requested_user_info_claims" text[],
	"resources" text[],
	"revoked" timestamp with time zone,
	"scopes" text[] NOT NULL,
	"session_id" uuid,
	"refresh_id" uuid,
	"token" text UNIQUE,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "oauth_client_assertions" (
	"expires_at" timestamp with time zone NOT NULL,
	"id" text PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "oauth_client_resources" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" text NOT NULL,
	"metadata" jsonb,
	"resource_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_clients" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"application_type" text,
	"backchannel_logout_session_required" boolean,
	"backchannel_logout_uri" text,
	"client_credentials_scopes" text[] DEFAULT '{}'::text[],
	"client_discovery_id" text,
	"client_id" text NOT NULL UNIQUE,
	"client_secret" text,
	"contacts" text[],
	"disabled" boolean DEFAULT false,
	"dpop_bound_access_tokens" boolean DEFAULT false,
	"enable_end_session" boolean,
	"grant_types" text[],
	"icon" text,
	"jwks" text,
	"jwks_uri" text,
	"metadata" jsonb,
	"name" text,
	"policy" text,
	"post_logout_redirect_uris" text[],
	"redirect_uris" text[] NOT NULL,
	"reference_id" text,
	"require_pkce" boolean,
	"response_types" text[],
	"scopes" text[],
	"skip_consent" boolean,
	"software_id" text,
	"software_statement" text,
	"software_version" text,
	"subject_type" text,
	"token_endpoint_auth_method" text,
	"tos" text,
	"uri" text,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "oauth_consents" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_id" text NOT NULL,
	"reference_id" text,
	"requested_user_info_claims" text[],
	"resources" text[],
	"scopes" text[] NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "oauth_refresh_tokens" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"authorization_code_id" text,
	"client_id" text NOT NULL,
	"confirmation" jsonb,
	"expires_at" timestamp with time zone,
	"reference_id" text,
	"requested_user_info_claims" text[],
	"resources" text[],
	"revoked" timestamp with time zone,
	"scopes" text[] NOT NULL,
	"session_id" uuid,
	"auth_time" timestamp with time zone,
	"rotated_at" timestamp with time zone,
	"rotation_replay_expires_at" timestamp with time zone,
	"rotation_replay_response" text,
	"token" text NOT NULL UNIQUE,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_resources" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"access_token_ttl" integer,
	"allowed_scopes" text[],
	"custom_claims" jsonb,
	"disabled" boolean DEFAULT false,
	"dpop_bound_access_tokens_required" boolean DEFAULT false,
	"identifier" text NOT NULL UNIQUE,
	"metadata" jsonb,
	"name" text NOT NULL,
	"policy_version" integer DEFAULT 1,
	"refresh_token_ttl" integer,
	"signing_algorithm" text,
	"signing_key_id" text
);
--> statement-breakpoint
CREATE TABLE "outbox" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"action_id" uuid,
	"attachments" text,
	"bcc" text NOT NULL,
	"cc" text NOT NULL,
	"error" text,
	"html" text NOT NULL,
	"in_reply_to" text,
	"mailbox_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"references" text,
	"remind_after_days" smallint,
	"reply_to_message_id" uuid,
	"send_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"subject" text NOT NULL,
	"text" text NOT NULL,
	"thread_id" text,
	"to" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pattern_reports" (
	"hash" text,
	"kind" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_hash" text,
	"verdict" text NOT NULL,
	CONSTRAINT "pattern_reports_pkey" PRIMARY KEY("user_hash","kind","hash")
);
--> statement-breakpoint
CREATE TABLE "payment_details" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"detail_hash" text,
	"sender_domain" text,
	"user_id" uuid,
	CONSTRAINT "payment_details_pkey" PRIMARY KEY("user_id","sender_domain","detail_hash")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"note" text,
	"note_updated_at" timestamp with time zone,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_issues" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"day" date NOT NULL,
	"message_ids" uuid[] NOT NULL,
	"summary" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"kind" text NOT NULL,
	"since" timestamp with time zone,
	"status" text NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sender_reports" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"domain_hash" text,
	"sender_hash" text NOT NULL,
	"user_id" uuid NOT NULL,
	"verdict" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"token" text NOT NULL UNIQUE,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snippets" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"html" text NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"period_end" timestamp with time zone,
	"status" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL UNIQUE,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_links" (
	"chat_id" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"link_code" text NOT NULL UNIQUE,
	"linked_at" timestamp with time zone,
	"urgent_push" boolean DEFAULT true NOT NULL,
	"user_id" uuid PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE "template_reports" (
	"band0" integer NOT NULL,
	"band1" integer NOT NULL,
	"band2" integer NOT NULL,
	"band3" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"print" text,
	"user_hash" text,
	"verdict" text NOT NULL,
	CONSTRAINT "template_reports_pkey" PRIMARY KEY("user_hash","print")
);
--> statement-breakpoint
CREATE TABLE "unsubscribes" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ignored_at" timestamp with time zone,
	"sender_hash" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"month" date NOT NULL,
	"spent" numeric(12,8) DEFAULT '0' NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "used_trials" (
	"address_hash" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"asked_senders" jsonb DEFAULT '[]' NOT NULL,
	"bots_cleared_at" jsonb DEFAULT '{}' NOT NULL,
	"bot_folders" text,
	"bots_read_at" jsonb DEFAULT '{}' NOT NULL,
	"cleanup_checked_at" timestamp with time zone,
	"gmail_labels" boolean DEFAULT false NOT NULL,
	"knowledge" text,
	"morning_sent_at" timestamp with time zone,
	"muted_bots" text[] DEFAULT '{}'::text[] NOT NULL,
	"pinned_bots" text[] DEFAULT '{}'::text[] NOT NULL,
	"language" text NOT NULL,
	"timezone" text NOT NULL,
	"today_opened_at" timestamp with time zone,
	"today_since" timestamp with time zone,
	"trial_ends_at" timestamp with time zone DEFAULT now() + interval '14 days' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid PRIMARY KEY,
	"voice" text,
	"voice_learned_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"stripe_customer_id" text
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_links" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_inbound_at" timestamp with time zone,
	"link_code" text NOT NULL UNIQUE,
	"linked_at" timestamp with time zone,
	"phone" text UNIQUE,
	"urgent_push" boolean DEFAULT true NOT NULL,
	"user_id" uuid PRIMARY KEY
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "actions_user_status_idx" ON "actions" ("user_id","status");--> statement-breakpoint
CREATE INDEX "actions_user_thread_idx" ON "actions" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "actions_message_idx" ON "actions" ("message_id");--> statement-breakpoint
CREATE INDEX "ai_usage_user_id_created_at_index" ON "ai_usage" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "bot_messages_created_at_idx" ON "bot_messages" ("created_at");--> statement-breakpoint
CREATE INDEX "bot_posts_user_bot_idx" ON "bot_posts" ("user_id","bot","due_at");--> statement-breakpoint
CREATE INDEX "bot_posts_due_idx" ON "bot_posts" ("delivered_at","due_at");--> statement-breakpoint
CREATE INDEX "bulk_prints_band0_idx" ON "bulk_prints" ("band0");--> statement-breakpoint
CREATE INDEX "bulk_prints_band1_idx" ON "bulk_prints" ("band1");--> statement-breakpoint
CREATE INDEX "bulk_prints_band2_idx" ON "bulk_prints" ("band2");--> statement-breakpoint
CREATE INDEX "bulk_prints_band3_idx" ON "bulk_prints" ("band3");--> statement-breakpoint
CREATE INDEX "bulk_prints_created_at_idx" ON "bulk_prints" ("created_at");--> statement-breakpoint
CREATE INDEX "commitment_events_commitment_idx" ON "commitment_events" ("commitment_id");--> statement-breakpoint
CREATE INDEX "commitments_due_idx" ON "commitments" ("status","due_at");--> statement-breakpoint
CREATE INDEX "commitments_user_thread_idx" ON "commitments" ("user_id","thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "declined_bot_suggestions_user_sender_idx" ON "declined_bot_suggestions" ("user_id","sender_hash");--> statement-breakpoint
CREATE INDEX "deliveries_due_idx" ON "deliveries" ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "deliveries_group_idx" ON "deliveries" ("group_id");--> statement-breakpoint
CREATE INDEX "domain_sightings_domain_idx" ON "domain_sightings" ("domain");--> statement-breakpoint
CREATE INDEX "mailboxes_address_hash_idx" ON "mailboxes" ("address_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "mailboxes_user_sign_in_idx" ON "mailboxes" ("user_id") WHERE "google_account_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mailboxes_user_google_idx" ON "mailboxes" ("user_id","google_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_mailbox_gmail_idx" ON "messages" ("mailbox_id","gmail_id");--> statement-breakpoint
CREATE INDEX "messages_user_received_idx" ON "messages" ("user_id","received_at");--> statement-breakpoint
CREATE INDEX "messages_thread_idx" ON "messages" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "messages_user_from_idx" ON "messages" ("user_id","from_email");--> statement-breakpoint
CREATE INDEX "messages_label_ids_idx" ON "messages" USING gin ("label_ids");--> statement-breakpoint
CREATE INDEX "messages_to_idx" ON "messages" USING gin ("to");--> statement-breakpoint
CREATE INDEX "messages_cc_idx" ON "messages" USING gin ("cc");--> statement-breakpoint
CREATE INDEX "messages_search_tokens_idx" ON "messages" USING gin ("search_tokens");--> statement-breakpoint
CREATE INDEX "messages_html_kept_idx" ON "messages" ("received_at") WHERE "html" is not null;--> statement-breakpoint
CREATE INDEX "oauth_access_tokens_userId_idx" ON "oauth_access_tokens" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_client_resources_pair_idx" ON "oauth_client_resources" ("client_id","resource_id");--> statement-breakpoint
CREATE INDEX "oauth_clients_userId_idx" ON "oauth_clients" ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_consents_userId_idx" ON "oauth_consents" ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_tokens_userId_idx" ON "oauth_refresh_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX "outbox_due_idx" ON "outbox" ("status","send_at");--> statement-breakpoint
CREATE INDEX "pattern_reports_hash_idx" ON "pattern_reports" ("kind","hash");--> statement-breakpoint
CREATE UNIQUE INDEX "people_user_email_idx" ON "people" ("user_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "reading_issues_user_day_idx" ON "reading_issues" ("user_id","day");--> statement-breakpoint
CREATE INDEX "reminders_due_idx" ON "reminders" ("status","due_at");--> statement-breakpoint
CREATE INDEX "reminders_thread_idx" ON "reminders" ("user_id","thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sender_reports_user_sender_idx" ON "sender_reports" ("user_id","sender_hash");--> statement-breakpoint
CREATE INDEX "sender_reports_sender_idx" ON "sender_reports" ("sender_hash");--> statement-breakpoint
CREATE INDEX "sender_reports_domain_idx" ON "sender_reports" ("domain_hash");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" ("user_id");--> statement-breakpoint
CREATE INDEX "template_reports_band0_idx" ON "template_reports" ("band0");--> statement-breakpoint
CREATE INDEX "template_reports_band1_idx" ON "template_reports" ("band1");--> statement-breakpoint
CREATE INDEX "template_reports_band2_idx" ON "template_reports" ("band2");--> statement-breakpoint
CREATE INDEX "template_reports_band3_idx" ON "template_reports" ("band3");--> statement-breakpoint
CREATE UNIQUE INDEX "unsubscribes_user_sender_idx" ON "unsubscribes" ("user_id","sender_hash");--> statement-breakpoint
CREATE INDEX "unsubscribes_sender_idx" ON "unsubscribes" ("sender_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_user_month_idx" ON "usage" ("user_id","month");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_bot_id_bots_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_bot_id_bots_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "bot_messages" ADD CONSTRAINT "bot_messages_action_id_actions_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bot_posts" ADD CONSTRAINT "bot_posts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bots" ADD CONSTRAINT "bots_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitment_events" ADD CONSTRAINT "commitment_events_commitment_id_commitments_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "commitments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitment_events" ADD CONSTRAINT "commitment_events_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "commitment_events" ADD CONSTRAINT "commitment_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_evidence_message_id_messages_id_fkey" FOREIGN KEY ("evidence_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_message_id_messages_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "declined_bot_suggestions" ADD CONSTRAINT "declined_bot_suggestions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_action_id_actions_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_mailbox_id_mailboxes_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "mailboxes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_client_id_oauth_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_session_id_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_refresh_id_oauth_refresh_tokens_id_fkey" FOREIGN KEY ("refresh_id") REFERENCES "oauth_refresh_tokens"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_client_resources" ADD CONSTRAINT "oauth_client_resources_client_id_oauth_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_client_resources" ADD CONSTRAINT "oauth_client_resources_CxFm94nYigrM_fkey" FOREIGN KEY ("resource_id") REFERENCES "oauth_resources"("identifier") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD CONSTRAINT "oauth_clients_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_consents" ADD CONSTRAINT "oauth_consents_client_id_oauth_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_consents" ADD CONSTRAINT "oauth_consents_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_client_id_oauth_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_session_id_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_action_id_actions_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_mailbox_id_mailboxes_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "mailboxes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_reply_to_message_id_messages_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reading_issues" ADD CONSTRAINT "reading_issues_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sender_reports" ADD CONSTRAINT "sender_reports_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "telegram_links" ADD CONSTRAINT "telegram_links_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "unsubscribes" ADD CONSTRAINT "unsubscribes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "whatsapp_links" ADD CONSTRAINT "whatsapp_links_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;