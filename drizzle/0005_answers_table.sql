CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`player_id` text NOT NULL,
	`question_id` text NOT NULL,
	`tile` integer NOT NULL,
	`response` text,
	`is_correct` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "answers_score_range" CHECK("answers"."score" >= 0),
	CONSTRAINT "answers_tile_positive" CHECK("answers"."tile" >= 1)
);
--> statement-breakpoint
CREATE INDEX `answers_session_idx` ON `answers` (`session_id`);--> statement-breakpoint
CREATE INDEX `answers_player_idx` ON `answers` (`player_id`);--> statement-breakpoint
CREATE INDEX `answers_question_idx` ON `answers` (`question_id`);