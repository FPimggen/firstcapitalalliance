CREATE TABLE `sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`triggeredBy` enum('manual','scheduled') NOT NULL DEFAULT 'manual',
	`status` enum('running','success','error') NOT NULL DEFAULT 'running',
	`providersUpserted` int DEFAULT 0,
	`offersUpserted` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `sync_log_id` PRIMARY KEY(`id`)
);
