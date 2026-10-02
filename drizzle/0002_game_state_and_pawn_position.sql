CREATE TABLE `turns` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`player_id` text NOT NULL,
	`dice_value` integer NOT NULL,
	`from_position` integer NOT NULL,
	`to_position` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "turns_dice_range" CHECK("turns"."dice_value" >= 1 and "turns"."dice_value" <= 6)
);
--> statement-breakpoint
CREATE INDEX `turns_session_idx` ON `turns` (`session_id`);--> statement-breakpoint
CREATE INDEX `turns_player_idx` ON `turns` (`player_id`);