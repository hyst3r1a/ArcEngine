import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { users, userArcStates, arcs, dailyEntries } from "../db/schema.js";
import { findPartnerIdAndPairId } from "../helpers/pair-lookup.js";
import type { PairResponse, ScoreboardRow } from "@arc/shared";

export const pairRoutes: FastifyPluginAsync = async (app) => {
  app.get("/pair", async (req) => {
    const result = await findPartnerIdAndPairId(req.userId);
    if (!result) throw app.httpErrors.notFound("No pair found");

    const [activeArc] = await db()
      .select()
      .from(arcs)
      .where(eq(arcs.isActive, true))
      .limit(1);

    if (!activeArc) throw app.httpErrors.notFound("No active arc");

    async function buildRow(uid: string): Promise<ScoreboardRow> {
      const [user] = await db().select().from(users).where(eq(users.id, uid)).limit(1);
      const [state] = await db()
        .select()
        .from(userArcStates)
        .where(and(eq(userArcStates.userId, uid), eq(userArcStates.arcId, activeArc!.id)))
        .limit(1);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().slice(0, 10);

      const weekEntries = await db()
        .select({ score: dailyEntries.score })
        .from(dailyEntries)
        .where(
          and(
            eq(dailyEntries.userId, uid),
            eq(dailyEntries.arcId, activeArc!.id),
          ),
        );

      const weeklyScore = weekEntries
        .reduce((sum, e) => sum + e.score, 0);

      return {
        user: {
          id: user!.id,
          displayName: user!.displayName,
          avatarSeed: user!.avatarSeed,
        },
        totalScore: state?.totalScore ?? 0,
        currentStreak: state?.currentStreak ?? 0,
        bestStreak: state?.bestStreak ?? 0,
        weeklyScore,
      };
    }

    const rows = await Promise.all([
      buildRow(req.userId),
      buildRow(result.partnerId),
    ]);

    const resp: PairResponse = {
      pairId: result.pairId,
      users: rows as [ScoreboardRow, ScoreboardRow],
    };
    return resp;
  });
};
