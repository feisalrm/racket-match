ALTER TABLE `local_users` ADD `role` text DEFAULT 'reviewer' NOT NULL;--> statement-breakpoint
ALTER TABLE `local_users` ADD `must_change_password` integer DEFAULT 0 NOT NULL;