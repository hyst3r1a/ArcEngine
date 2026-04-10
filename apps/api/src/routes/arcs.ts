import type { FastifyPluginAsync } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { arcs, userArcStates } from "../db/schema.js";
import type { ArcListItem, ArcDetailResponse, ArcDefinition } from "@arc/shared";

function parseArcDefinition(row: typeof arcs.$inferSelect): ArcDefinition {
  return {
    id: row.id,
    name: row.name,
    description: "",
    order: row.order,
    schemaVersion: row.schemaVersion,
    theme: JSON.parse(row.themeJson),
    schema: JSON.parse(row.schemaJson),
    scoring: JSON.parse(row.scoringJson),
    completionRule: JSON.parse(row.completionJson),
  };
}

export const arcsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/arcs", async () => {
    const rows = await db.select().from(arcs);
    const items: ArcListItem[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: "",
      order: r.order,
      isActive: r.isActive,
      theme: JSON.parse(r.themeJson),
    }));
    return items;
  });

  app.get<{ Params: { arcId: string } }>("/arcs/:arcId", async (req) => {
    const { arcId } = req.params;
    const [row] = await db.select().from(arcs).where(eq(arcs.id, arcId)).limit(1);
    if (!row) throw app.httpErrors.notFound("Arc not found");

    const [state] = await db
      .select()
      .from(userArcStates)
      .where(
        and(eq(userArcStates.userId, req.userId), eq(userArcStates.arcId, arcId)),
      )
      .limit(1);

    const resp: ArcDetailResponse = {
      arc: parseArcDefinition(row),
      state: state
        ? {
            arcId: state.arcId,
            arcName: row.name,
            currentStreak: state.currentStreak,
            bestStreak: state.bestStreak,
            totalScore: state.totalScore,
            startedAt: state.startedAt,
            completedAt: state.completedAt,
          }
        : null,
    };
    return resp;
  });
};
