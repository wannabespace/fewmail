ALTER TABLE "board_entries" DROP CONSTRAINT "board_entries_board_id_boards_id_fkey";--> statement-breakpoint
DROP TABLE "board_entries";--> statement-breakpoint
DROP TABLE "boards";--> statement-breakpoint
ALTER TABLE "mailboxes" DROP COLUMN "boards_seeded_at";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "starter_boards";