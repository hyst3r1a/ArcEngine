import type { FastifyPluginAsync } from "fastify";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { eventLog, arcs, users } from "../db/schema.js";
import { findPartnerIdAndPairId } from "../helpers/pair-lookup.js";
import { sendTelegramMessage, getChatIdForUser } from "../helpers/telegram.js";

export const nudgeRoutes: FastifyPluginAsync = async (app) => {
  app.post("/nudge", async (req) => {
    const pairResult = await findPartnerIdAndPairId(req.userId);
    if (!pairResult) throw app.httpErrors.badRequest("No pair found");

    const [activeArc] = await db()
      .select()
      .from(arcs)
      .where(eq(arcs.isActive, true))
      .limit(1);

    const [sender] = await db()
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.id, req.userId))
      .limit(1);

    const [partner] = await db()
      .select({ displayName: users.displayName })
      .from(users)
      .where(eq(users.id, pairResult.partnerId))
      .limit(1);

    await db().insert(eventLog).values({
      id: nanoid(),
      userId: req.userId,
      arcId: activeArc?.id ?? null,
      type: "nudge",
      metadataJson: JSON.stringify({ targetUserId: pairResult.partnerId }),
      createdAt: new Date().toISOString(),
    });

    let telegramSent = false;
    const partnerChatId = await getChatIdForUser(pairResult.partnerId);
    if (partnerChatId) {
      const senderName = sender?.displayName ?? "Your partner";
      const arcName = activeArc?.name ?? "the arc";
      const msg =
        `🔔 <b>${senderName}</b> just nudged you!\n` +
        `Time to log your <b>${arcName}</b> entry.`;
      telegramSent = await sendTelegramMessage(partnerChatId, msg);
    }

    const partnerName = partner?.displayName ?? "partner";
    return {
      ok: true,
      message: telegramSent
        ? `Nudge sent to ${partnerName}!`
        : `Nudge logged — ${partnerName} hasn't connected Telegram yet`,
    };
  });
};
