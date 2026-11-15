-- The extractor never saw an email's date and answered "today" for receipts that state none: such an entry carries the day it was collected, though its email is older. Money moves before the email about it, too.
UPDATE "board_entries" AS "entry" SET "occurred_at" = "message"."received_at"
FROM "messages" AS "message"
WHERE "message"."id" = "entry"."message_id"
  AND "entry"."edited_at" IS NULL
  AND (
    ("entry"."occurred_at"::date = "entry"."created_at"::date AND "message"."received_at" < "entry"."created_at" - interval '1 day')
    OR ("entry"."payment" IS NOT NULL AND "entry"."occurred_at" > "message"."received_at" + interval '1 day')
  );
