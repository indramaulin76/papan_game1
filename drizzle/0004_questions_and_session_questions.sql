CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category` text,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`options` text,
	`answer` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "questions_prompt_not_empty" CHECK(length("questions"."prompt") > 0)
);
--> statement-breakpoint
CREATE INDEX `questions_user_idx` ON `questions` (`user_id`);--> statement-breakpoint
CREATE INDEX `questions_type_idx` ON `questions` (`type`);--> statement-breakpoint
CREATE TABLE `session_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`question_id` text NOT NULL,
	`tile` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "session_questions_tile_positive" CHECK("session_questions"."tile" >= 1)
);
--> statement-breakpoint
CREATE INDEX `session_questions_session_idx` ON `session_questions` (`session_id`);--> statement-breakpoint
CREATE INDEX `session_questions_tile_idx` ON `session_questions` (`session_id`,`tile`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_questions_unique` ON `session_questions` (`session_id`,`tile`,`question_id`);