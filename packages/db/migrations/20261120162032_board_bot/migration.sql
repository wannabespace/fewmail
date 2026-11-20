-- The Board was a system bot (`board`); it is now one of the user's bots made from a preset (effect `promises`).
-- Every account gets one, older than its other bots so it stays last in the list; its name is written on the first read (`listBots`), encrypted.
INSERT INTO "bots" ("id", "user_id", "effect", "enabled", "created_at", "updated_at")
SELECT gen_random_uuid(), s."user_id", 'promises', true,
  coalesce((SELECT min(b."created_at") FROM "bots" b WHERE b."user_id" = s."user_id"), now()) - interval '1 second',
  now()
FROM "user_settings" s
WHERE NOT EXISTS (SELECT 1 FROM "bots" b WHERE b."user_id" = s."user_id" AND b."effect" = 'promises');
--> statement-breakpoint
UPDATE "bot_posts" p SET "bot" = b."id"::text
FROM "bots" b
WHERE p."bot" = 'board' AND b."user_id" = p."user_id" AND b."effect" = 'promises';
--> statement-breakpoint
UPDATE "user_settings" s SET
  "muted_bots" = array_replace(s."muted_bots", 'board', b."id"::text),
  "pinned_bots" = array_replace(s."pinned_bots", 'board', b."id"::text),
  "bots_read_at" = CASE WHEN s."bots_read_at" ? 'board'
    THEN (s."bots_read_at" - 'board') || jsonb_build_object(b."id"::text, s."bots_read_at" -> 'board')
    ELSE s."bots_read_at" END,
  "bots_cleared_at" = CASE WHEN s."bots_cleared_at" ? 'board'
    THEN (s."bots_cleared_at" - 'board') || jsonb_build_object(b."id"::text, s."bots_cleared_at" -> 'board')
    ELSE s."bots_cleared_at" END
FROM "bots" b
WHERE b."user_id" = s."user_id" AND b."effect" = 'promises';
