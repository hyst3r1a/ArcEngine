import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/client.js";
import { users, userArcStates, arcs, telegramLinkTokens } from "../db/schema.js";
import type { MeResponse } from "@arc/shared";
import { BOT_USERNAME } from "../config/telegram.js";

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (req) => {
    const [user] = await db()
      .select()
      .from(users)
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!user) throw app.httpErrors.notFound("User not found");

    const [activeArc] = await db()
      .select()
      .from(arcs)
      .where(eq(arcs.isActive, true))
      .limit(1);

    let activeState = null;
    if (activeArc) {
      const [state] = await db()
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
      telegramConnected: !!user.telegramChatId,
    };
    return resp;
  });

  app.post("/me/telegram/link", async (req) => {
    if (!BOT_USERNAME) {
      throw app.httpErrors.serviceUnavailable(
        "Telegram bot not configured (TELEGRAM_BOT_USERNAME missing)",
      );
    }

    // Delete any existing tokens for this user
    await db()
      .delete(telegramLinkTokens)
      .where(eq(telegramLinkTokens.userId, req.userId));

    const token = nanoid(12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db().insert(telegramLinkTokens).values({
      token,
      userId: req.userId,
      expiresAt,
    });

    return { url: `https://t.me/${BOT_USERNAME}?start=${token}` };
  });

  app.delete("/me/telegram", async (req) => {
    await db()
      .update(users)
      .set({ telegramChatId: null })
      .where(eq(users.id, req.userId));

    return { ok: true };
  });
};
