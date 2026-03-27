import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Teams ============
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTeamsByUserId(ctx.user.id);
    }),
    
    get: protectedProcedure.input(z.object({ teamId: z.number() })).query(async ({ input }) => {
      const team = await db.getTeamById(input.teamId);
      if (!team) throw new TRPCError({ code: "NOT_FOUND" });
      return team;
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        logoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTeam(ctx.user.id, input.name, input.description, input.logoUrl);
      }),
  }),

  // ============ Team Categories ============
  teamCategories: router({
    list: protectedProcedure.input(z.object({ teamId: z.number() })).query(async ({ input }) => {
      return db.getTeamCategoriesByTeamId(input.teamId);
    }),
    
    create: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createTeamCategory(input.teamId, input.name, input.description);
      }),
  }),

  // ============ Tournaments ============
  tournaments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTournamentsByUserId(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTournament(ctx.user.id, input.name, input.description);
      }),
  }),

  // ============ Players ============
  players: router({
    list: protectedProcedure
      .input(z.object({ teamId: z.number(), teamCategoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayersByTeamCategory(input.teamId, input.teamCategoryId);
      }),
    
    get: protectedProcedure.input(z.object({ playerId: z.number() })).query(async ({ input }) => {
      const player = await db.getPlayerById(input.playerId);
      if (!player) throw new TRPCError({ code: "NOT_FOUND" });
      return player;
    }),
    
    create: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        teamCategoryId: z.number(),
        name: z.string().min(1),
        number: z.number().optional(),
        position: z.string().optional(),
        photoUrl: z.string().optional(),
        birthDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createPlayer(
          input.teamId,
          input.teamCategoryId,
          input.name,
          input.number,
          input.position,
          input.photoUrl,
          input.birthDate,
          input.notes
        );
      }),
    
    update: protectedProcedure
      .input(z.object({
        playerId: z.number(),
        name: z.string().optional(),
        number: z.number().optional(),
        position: z.string().optional(),
        photoUrl: z.string().optional(),
        birthDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { playerId, ...updates } = input;
        return db.updatePlayer(playerId, updates);
      }),
    
    delete: protectedProcedure
      .input(z.object({ playerId: z.number() }))
      .mutation(async ({ input }) => {
        return db.deletePlayer(input.playerId);
      }),
  }),

  // ============ Matches ============
  matches: router({
    list: protectedProcedure
      .input(z.object({ teamId: z.number(), teamCategoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchesByTeamCategory(input.teamId, input.teamCategoryId);
      }),
    
    get: protectedProcedure.input(z.object({ matchId: z.number() })).query(async ({ input }) => {
      const match = await db.getMatchById(input.matchId);
      if (!match) throw new TRPCError({ code: "NOT_FOUND" });
      return match;
    }),
    
    create: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        teamCategoryId: z.number(),
        opponentName: z.string().min(1),
        matchDate: z.date(),
        matchType: z.enum(["official", "friendly", "training"]).default("friendly"),
        tournamentId: z.number().optional(),
        venue: z.string().optional(),
        formation: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createMatch(
          ctx.user.id,
          input.teamId,
          input.teamCategoryId,
          input.opponentName,
          input.matchDate,
          input.matchType,
          input.tournamentId,
          input.venue,
          input.formation
        );
      }),
    
    update: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        homeTeamScore: z.number().optional(),
        awayTeamScore: z.number().optional(),
        additionalTime: z.number().optional(),
        status: z.enum(["scheduled", "live", "completed"]).optional(),
        notes: z.string().optional(),
        formation: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { matchId, ...updates } = input;
        return db.updateMatch(matchId, updates);
      }),
  }),

  // ============ Match Events ============
  matchEvents: router({
    list: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchEventsByMatchId(input.matchId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        eventType: z.enum(["goal", "ownGoal", "penalty", "yellowCard", "redCard", "substitution", "note"]),
        minute: z.number(),
        isHomeTeam: z.boolean(),
        playerId: z.number().optional(),
        playerName: z.string().optional(),
        additionalMinute: z.number().optional(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createMatchEvent(
          input.matchId,
          input.eventType,
          input.minute,
          input.isHomeTeam,
          input.playerId,
          input.playerName,
          input.additionalMinute,
          input.details
        );
      }),
    
    delete: protectedProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteMatchEvent(input.eventId);
      }),
  }),

  // ============ Match Reports ============
  matchReports: router({
    get: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getMatchReportByMatchId(input.matchId);
      }),
    
    createOrUpdate: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        aiAnalysis: z.string().optional(),
        highlights: z.string().optional(),
        improvements: z.string().optional(),
        manualNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createOrUpdateMatchReport(
          input.matchId,
          input.aiAnalysis,
          input.highlights,
          input.improvements,
          input.manualNotes
        );
      }),
  }),

  // ============ Player Stats ============
  playerStats: router({
    listByMatch: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayerStatsByMatchId(input.matchId);
      }),
    
    listByPlayer: protectedProcedure
      .input(z.object({ playerId: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayerStatsByPlayerId(input.playerId);
      }),
    
    createOrUpdate: protectedProcedure
      .input(z.object({
        playerId: z.number(),
        matchId: z.number(),
        goals: z.number().default(0),
        penaltyGoals: z.number().default(0),
        ownGoals: z.number().default(0),
        yellowCards: z.number().default(0),
        redCards: z.number().default(0),
        minutesPlayed: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return db.createOrUpdatePlayerStats(
          input.playerId,
          input.matchId,
          input.goals,
          input.penaltyGoals,
          input.ownGoals,
          input.yellowCards,
          input.redCards,
          input.minutesPlayed
        );
      }),
  }),

  // ============ Team Stats ============
  teamStats: router({
    get: protectedProcedure
      .input(z.object({ teamId: z.number(), teamCategoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamStatsByCategory(input.teamId, input.teamCategoryId);
      }),
    
    createOrUpdate: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        teamCategoryId: z.number(),
        totalMatches: z.number().default(0),
        wins: z.number().default(0),
        draws: z.number().default(0),
        losses: z.number().default(0),
        goalsFor: z.number().default(0),
        goalsAgainst: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return db.createOrUpdateTeamStats(
          input.teamId,
          input.teamCategoryId,
          input.totalMatches,
          input.wins,
          input.draws,
          input.losses,
          input.goalsFor,
          input.goalsAgainst
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
