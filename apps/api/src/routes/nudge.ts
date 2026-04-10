import type { FastifyPluginAsync } from "fastify";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { eventLog, arcs } from "../db/schema.js";
import { findPartnerIdAndPairId } from "../helpers/pair-lookup.js";

export const nudgeRoutes: FastifyPluginAsync = async (app) => {
  app.post("/nudge", async (req) => {
    const pairResult = await findPartnerIdAndPairId(req.userId);
    if (!pairResult) throw app.httpErrors.badRequest("No pair found");

    const [activeArc] = await db()
      .select()
      .from(arcs)
      .where(eq(arcs.isActive, true))
      .limit(1);

    await db().insert(eventLog).values({
      id: nanoid(),
      userId: req.userId,
      arcId: activeArc?.id ?? null,
      type: "nudge",
      metadataJson: JSON.stringify({ targetUserId: pairResult.partnerId }),
      createdAt: new Date().toISOString(),
    });

    return { ok: true };
  });
};
