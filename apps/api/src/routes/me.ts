import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { users, userArcStates, arcs } from "../db/schema.js";
import type { MeResponse } from "@arc/shared";

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (req) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!user) throw app.httpErrors.notFound("User not found");

    const [activeArc] = await db
      .select()
      .from(arcs)
      .where(eq(arcs.isActive, true))
      .limit(1);

    let activeState = null;
    if (activeArc) {
      const [state] = await db
        .select()
        .from(userArcStates)
        .where(
          and(
            eq(userArcStates.userId, req.userId),
            eq(userArcStates.arcId, activeArc.id),
          ),
        )
        .limit(1);

      if (state) {
        activeState = {
          arcId: state.arcId,
          arcName: activeArc.name,
          currentStreak: state.currentStreak,
          bestStreak: state.bestStreak,
          totalScore: state.totalScore,
          startedAt: state.startedAt,
          completedAt: state.completedAt,
        };
      }
    }

    const resp: MeResponse = {
      user: {
        id: user.id,
        displayName: user.displayName,
        avatarSeed: user.avatarSeed,
      },
      activeArc: activeState,
    };
    return resp;
  });
};
