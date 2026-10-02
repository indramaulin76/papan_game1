PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_board_links` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`type` text NOT NULL,
	`from_tile` integer NOT NULL,
	`to_tile` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "board_links_tiles_positive" CHECK("__new_board_links"."from_tile" >= 1 and "__new_board_links"."to_tile" >= 1),
	CONSTRAINT "board_links_direction" CHECK(("__new_board_links"."type" = 'ladder' and "__new_board_links"."to_tile" > "__new_board_links"."from_tile") or ("__new_board_links"."type" = 'snake' and "__new_board_links"."to_tile" < "__new_board_links"."from_tile"))
);
--> statement-breakpoint
INSERT INTO `__new_board_links`("id", "session_id", "type", "from_tile", "to_tile") SELECT "id", "session_id", "type", "from_tile", "to_tile" FROM `board_links`;--> statement-breakpoint
DROP TABLE `board_links`;--> statement-breakpoint
ALTER TABLE `__new_board_links` RENAME TO `board_links`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `board_links_session_idx` ON `board_links` (`session_id`);--> statement-breakpoint
CREATE INDEX `board_links_from_tile_idx` ON `board_links` (`session_id`,`from_tile`);--> statement-breakpoint
CREATE UNIQUE INDEX `board_links_session_from_unique` ON `board_links` (`session_id`,`from_tile`);