CREATE TABLE `community_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`racket_id` text NOT NULL,
	`author_id` text NOT NULL,
	`display_name` text NOT NULL,
	`status` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_active_review_per_account` ON `community_entries` (`racket_id`,`author_id`) WHERE "community_entries"."kind" = 'review' AND "community_entries"."status" != 'rejected';