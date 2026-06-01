ALTER TABLE `offers` ADD `cardType` enum('cash-back','travel','balance-transfer','credit-builder','general') DEFAULT 'general';--> statement-breakpoint
ALTER TABLE `offers` ADD `imageUrl` text;