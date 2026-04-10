import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { arcs, users, userArcStates, dailyEntries } from "../db/schema.js";
import { findPartnerIdAndPairId } from "../helpers/pair-lookup.js";
import type { ScoreboardResponse, ScoreboardRow } from "@arc/shared";

export const scoreboardRoutes: FastifyPluginAsync = async (app) => {
  app.get("/scoreboard", async (req) => {
    const [activeArc] = await db
      .select()
      .from(arcs)
      .where(eq(arcs.isActive, true))
      .limit(1);

    if (!activeArc) throw app.httpErrors.notFound("No active arc");

    const pairResult = await findPartnerIdAndPairId(req.userId);
    const userIds = [req.userId];
    if (pairResult) userIds.push(pairResult.partnerId);

    const rows: ScoreboardRow[] = [];
    for (const uid of userIds) {
      const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      const [state] = await db
        .select()
        .from(userArcStates)
        .where(
          and(eq(userArcStates.userId, uid), eq(userArcStates.arcId, activeArc.id)),
        )
        .limit(1);

      const entries = await db
        .select({ score: dailyEntries.score })
        .from(dailyEntries)
        .where(
          and(eq(dailyEntries.userId, uid), eq(dailyEntries.arcId, activeArc.id)),
        );

      const weeklyScore = entries.reduce((s, e) => s + e.score, 0);

      rows.push({
        user: {
          id: user!.id,
          displayName: user!.displayName,
          avatarSeed: user!.avatarSeed,
        },
        totalScore: state?.totalScore ?? 0,
        currentStreak: state?.currentStreak ?? 0,
        bestStreak: state?.bestStreak ?? 0,
        weeklyScore,
      });
    }

    const resp: ScoreboardResponse = { arcId: activeArc.id, rows };
    return resp;
  });
};
