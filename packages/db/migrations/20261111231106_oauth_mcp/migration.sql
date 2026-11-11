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
DROP TABLE "api_keys";--> statement-breakpoint
CREATE INDEX "oauth_access_tokens_userId_idx" ON "oauth_access_tokens" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_client_resources_pair_idx" ON "oauth_client_resources" ("client_id","resource_id");--> statement-breakpoint
CREATE INDEX "oauth_clients_userId_idx" ON "oauth_clients" ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_consents_userId_idx" ON "oauth_consents" ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_refresh_tokens_userId_idx" ON "oauth_refresh_tokens" ("user_id");--> statement-breakpoint
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
ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;