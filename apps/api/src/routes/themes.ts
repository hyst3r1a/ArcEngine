import type { FastifyPluginAsync } from "fastify";
import { db } from "../db/client.js";
import { arcs } from "../db/schema.js";
import type { ArcTheme } from "@arc/shared";

export const themesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/themes", async () => {
    const rows = await db().select().from(arcs);
    const themes: Record<string, ArcTheme> = {};
    for (const row of rows) {
      themes[row.id] = JSON.parse(row.themeJson);
    }
    return themes;
  });
};
