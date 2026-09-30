CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`user_id` text NOT NULL,
	`subject` text NOT NULL,
	`order_id` text,
	`message` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reports_reference_unique` ON `reports` (`reference`);--> statement-breakpoint
CREATE INDEX `reports_user_idx` ON `reports` (`user_id`);