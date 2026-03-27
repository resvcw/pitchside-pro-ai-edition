CREATE TABLE `matchEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`eventType` enum('goal','ownGoal','penalty','yellowCard','redCard','substitution','note') NOT NULL,
	`minute` int NOT NULL,
	`additionalMinute` int DEFAULT 0,
	`playerId` int,
	`playerName` varchar(255),
	`isHomeTeam` boolean NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matchEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matchReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`aiAnalysis` text,
	`highlights` text,
	`improvements` text,
	`manualNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matchReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamId` int NOT NULL,
	`teamCategoryId` int NOT NULL,
	`tournamentId` int,
	`opponentName` varchar(255) NOT NULL,
	`matchType` enum('official','friendly','training') NOT NULL DEFAULT 'friendly',
	`venue` varchar(255),
	`matchDate` timestamp NOT NULL,
	`homeTeamScore` int NOT NULL DEFAULT 0,
	`awayTeamScore` int NOT NULL DEFAULT 0,
	`additionalTime` int DEFAULT 0,
	`status` enum('scheduled','live','completed') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`formation` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerId` int NOT NULL,
	`matchId` int NOT NULL,
	`goals` int NOT NULL DEFAULT 0,
	`penaltyGoals` int NOT NULL DEFAULT 0,
	`ownGoals` int NOT NULL DEFAULT 0,
	`yellowCards` int NOT NULL DEFAULT 0,
	`redCards` int NOT NULL DEFAULT 0,
	`minutesPlayed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`teamCategoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`number` int,
	`position` varchar(50),
	`photoUrl` varchar(512),
	`birthDate` varchar(10),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`teamCategoryId` int NOT NULL,
	`totalMatches` int NOT NULL DEFAULT 0,
	`wins` int NOT NULL DEFAULT 0,
	`draws` int NOT NULL DEFAULT 0,
	`losses` int NOT NULL DEFAULT 0,
	`goalsFor` int NOT NULL DEFAULT 0,
	`goalsAgainst` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`logoUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
