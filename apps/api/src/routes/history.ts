import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { arcs, dailyEntries } from "../db/schema.js";
import type { HistoryResponse, HistoryEntry } from "@arc/shared";

export const historyRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { days?: string; arcId?: string } }>(
    "/history",
    async (req) => {
      const days = Math.min(Number(req.query.days) || 30, 365);

      const [activeArc] = req.query.arcId
        ? await db().select().from(arcs).where(eq(arcs.id, req.query.arcId)).limit(1)
        : await db().select().from(arcs).where(eq(arcs.isActive, true)).limit(1);

      if (!activeArc) throw app.httpErrors.notFound("No arc found");

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);

      const rows = await db()
        .select()
        .from(dailyEntries)
        .where(
          and(
            eq(dailyEntries.userId, req.userId),
            eq(dailyEntries.arcId, activeArc.id),
          ),
        )
        .orderBy(dailyEntries.date);

      const entries: HistoryEntry[] = rows
        .filter((r) => r.date >= cutoffStr)
        .map((r) => ({
          date: r.date,
          score: r.score,
          payload: JSON.parse(r.payloadJson),
        }));

      const resp: HistoryResponse = {
        arcId: activeArc.id,
        entries,
      };
      return resp;
    },
  );
};
