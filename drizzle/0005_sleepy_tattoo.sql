CREATE TABLE `affiliate_ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`marketplace` varchar(100) NOT NULL DEFAULT '',
	`affiliateLink` text NOT NULL,
	`squareImageUrl` text,
	`verticalImageUrl` text,
	`horizontalImageUrl` text,
	`priority` enum('low','moderate','high') NOT NULL DEFAULT 'moderate',
	`tags` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_ads_id` PRIMARY KEY(`id`)
);
