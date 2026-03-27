import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * チーム情報テーブル
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logoUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * チームカテゴリ（Aチーム、Bチーム等）
 */
export const teamCategories = mysqlTable("teamCategories", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamCategory = typeof teamCategories.$inferSelect;
export type InsertTeamCategory = typeof teamCategories.$inferInsert;

/**
 * 大会名マスター
 */
export const tournaments = mysqlTable("tournaments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

/**
 * 選手情報テーブル
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  teamCategoryId: int("teamCategoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  number: int("number"),
  position: varchar("position", { length: 50 }),
  photoUrl: varchar("photoUrl", { length: 512 }),
  birthDate: varchar("birthDate", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * 試合情報テーブル
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  teamId: int("teamId").notNull(),
  teamCategoryId: int("teamCategoryId").notNull(),
  tournamentId: int("tournamentId"),
  opponentName: varchar("opponentName", { length: 255 }).notNull(),
  matchType: mysqlEnum("matchType", ["official", "friendly", "training"]).default("friendly").notNull(),
  venue: varchar("venue", { length: 255 }),
  matchDate: timestamp("matchDate").notNull(),
  homeTeamScore: int("homeTeamScore").default(0).notNull(),
  awayTeamScore: int("awayTeamScore").default(0).notNull(),
  additionalTime: int("additionalTime").default(0),
  status: mysqlEnum("status", ["scheduled", "live", "completed"]).default("scheduled").notNull(),
  notes: text("notes"),
  formation: varchar("formation", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * 試合イベント（得点、カード、交代等）
 */
export const matchEvents = mysqlTable("matchEvents", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  eventType: mysqlEnum("eventType", ["goal", "ownGoal", "penalty", "yellowCard", "redCard", "substitution", "note"]).notNull(),
  minute: int("minute").notNull(),
  additionalMinute: int("additionalMinute").default(0),
  playerId: int("playerId"),
  playerName: varchar("playerName", { length: 255 }),
  isHomeTeam: boolean("isHomeTeam").notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatchEvent = typeof matchEvents.$inferSelect;
export type InsertMatchEvent = typeof matchEvents.$inferInsert;

/**
 * 選手個人成績（キャッシュ用）
 */
export const playerStats = mysqlTable("playerStats", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull(),
  matchId: int("matchId").notNull(),
  goals: int("goals").default(0).notNull(),
  penaltyGoals: int("penaltyGoals").default(0).notNull(),
  ownGoals: int("ownGoals").default(0).notNull(),
  yellowCards: int("yellowCards").default(0).notNull(),
  redCards: int("redCards").default(0).notNull(),
  minutesPlayed: int("minutesPlayed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = typeof playerStats.$inferInsert;

/**
 * チーム通算成績（キャッシュ用）
 */
export const teamStats = mysqlTable("teamStats", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  teamCategoryId: int("teamCategoryId").notNull(),
  totalMatches: int("totalMatches").default(0).notNull(),
  wins: int("wins").default(0).notNull(),
  draws: int("draws").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  goalsFor: int("goalsFor").default(0).notNull(),
  goalsAgainst: int("goalsAgainst").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamStats = typeof teamStats.$inferSelect;
export type InsertTeamStats = typeof teamStats.$inferInsert;

/**
 * 試合レポート（AI戦評等）
 */
export const matchReports = mysqlTable("matchReports", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  aiAnalysis: text("aiAnalysis"),
  highlights: text("highlights"),
  improvements: text("improvements"),
  manualNotes: text("manualNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MatchReport = typeof matchReports.$inferSelect;
export type InsertMatchReport = typeof matchReports.$inferInsert;
