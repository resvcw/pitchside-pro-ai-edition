import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, teams, teamCategories, players, matches, matchEvents, playerStats, teamStats, tournaments, matchReports } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Teams ============
export async function getTeamsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).where(eq(teams.userId, userId));
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTeam(userId: number, name: string, description?: string, logoUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teams).values({ userId, name, description, logoUrl });
  return result;
}

// ============ Team Categories ============
export async function getTeamCategoriesByTeamId(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamCategories).where(eq(teamCategories.teamId, teamId));
}

export async function createTeamCategory(teamId: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(teamCategories).values({ teamId, name, description });
}

// ============ Tournaments ============
export async function getTournamentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tournaments).where(eq(tournaments.userId, userId));
}

export async function createTournament(userId: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tournaments).values({ userId, name, description });
}

// ============ Players ============
export async function getPlayersByTeamCategory(teamId: number, teamCategoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(players).where(
    and(eq(players.teamId, teamId), eq(players.teamCategoryId, teamCategoryId))
  );
}

export async function getPlayerById(playerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPlayer(
  teamId: number,
  teamCategoryId: number,
  name: string,
  number?: number,
  position?: string,
  photoUrl?: string,
  birthDate?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(players).values({
    teamId,
    teamCategoryId,
    name,
    number,
    position,
    photoUrl,
    birthDate,
    notes,
  });
}

export async function updatePlayer(playerId: number, updates: Partial<typeof players.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(players).set(updates).where(eq(players.id, playerId));
}

export async function deletePlayer(playerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(players).where(eq(players.id, playerId));
}

// ============ Matches ============
export async function getMatchesByTeamCategory(teamId: number, teamCategoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matches)
    .where(and(eq(matches.teamId, teamId), eq(matches.teamCategoryId, teamCategoryId)))
    .orderBy(desc(matches.matchDate));
}

export async function getMatchById(matchId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMatch(
  userId: number,
  teamId: number,
  teamCategoryId: number,
  opponentName: string,
  matchDate: Date,
  matchType: "official" | "friendly" | "training" = "friendly",
  tournamentId?: number,
  venue?: string,
  formation?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(matches).values({
    userId,
    teamId,
    teamCategoryId,
    opponentName,
    matchDate,
    matchType,
    tournamentId,
    venue,
    formation,
    status: "scheduled",
  });
}

export async function updateMatch(matchId: number, updates: Partial<typeof matches.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(matches).set(updates).where(eq(matches.id, matchId));
}

// ============ Match Events ============
export async function getMatchEventsByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(matchEvents).where(eq(matchEvents.matchId, matchId));
}

export async function createMatchEvent(
  matchId: number,
  eventType: "goal" | "ownGoal" | "penalty" | "yellowCard" | "redCard" | "substitution" | "note",
  minute: number,
  isHomeTeam: boolean,
  playerId?: number,
  playerName?: string,
  additionalMinute?: number,
  details?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(matchEvents).values({
    matchId,
    eventType,
    minute,
    isHomeTeam,
    playerId,
    playerName,
    additionalMinute,
    details,
  });
}

export async function deleteMatchEvent(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(matchEvents).where(eq(matchEvents.id, eventId));
}

// ============ Match Reports ============
export async function getMatchReportByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(matchReports).where(eq(matchReports.matchId, matchId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateMatchReport(
  matchId: number,
  aiAnalysis?: string,
  highlights?: string,
  improvements?: string,
  manualNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getMatchReportByMatchId(matchId);
  if (existing) {
    return db.update(matchReports).set({
      aiAnalysis,
      highlights,
      improvements,
      manualNotes,
    }).where(eq(matchReports.id, existing.id));
  } else {
    return db.insert(matchReports).values({
      matchId,
      aiAnalysis,
      highlights,
      improvements,
      manualNotes,
    });
  }
}

// ============ Player Stats ============
export async function getPlayerStatsByMatchId(matchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playerStats).where(eq(playerStats.matchId, matchId));
}

export async function getPlayerStatsByPlayerId(playerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(playerStats).where(eq(playerStats.playerId, playerId));
}

export async function createOrUpdatePlayerStats(
  playerId: number,
  matchId: number,
  goals: number = 0,
  penaltyGoals: number = 0,
  ownGoals: number = 0,
  yellowCards: number = 0,
  redCards: number = 0,
  minutesPlayed: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(playerStats)
    .where(and(eq(playerStats.playerId, playerId), eq(playerStats.matchId, matchId)))
    .limit(1);
  
  if (existing.length > 0) {
    return db.update(playerStats).set({
      goals,
      penaltyGoals,
      ownGoals,
      yellowCards,
      redCards,
      minutesPlayed,
    }).where(and(eq(playerStats.playerId, playerId), eq(playerStats.matchId, matchId)));
  } else {
    return db.insert(playerStats).values({
      playerId,
      matchId,
      goals,
      penaltyGoals,
      ownGoals,
      yellowCards,
      redCards,
      minutesPlayed,
    });
  }
}

// ============ Team Stats ============
export async function getTeamStatsByCategory(teamId: number, teamCategoryId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teamStats)
    .where(and(eq(teamStats.teamId, teamId), eq(teamStats.teamCategoryId, teamCategoryId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateTeamStats(
  teamId: number,
  teamCategoryId: number,
  totalMatches: number = 0,
  wins: number = 0,
  draws: number = 0,
  losses: number = 0,
  goalsFor: number = 0,
  goalsAgainst: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getTeamStatsByCategory(teamId, teamCategoryId);
  if (existing) {
    return db.update(teamStats).set({
      totalMatches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
    }).where(and(eq(teamStats.teamId, teamId), eq(teamStats.teamCategoryId, teamCategoryId)));
  } else {
    return db.insert(teamStats).values({
      teamId,
      teamCategoryId,
      totalMatches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
    });
  }
}
