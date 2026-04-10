import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authPlugin } from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.js";
import { meRoutes } from "./routes/me.js";
import { pairRoutes } from "./routes/pair.js";
import { arcsRoutes } from "./routes/arcs.js";
import { todayRoutes } from "./routes/today.js";
import { historyRoutes } from "./routes/history.js";
import { scoreboardRoutes } from "./routes/scoreboard.js";
import { nudgeRoutes } from "./routes/nudge.js";
import { themesRoutes } from "./routes/themes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(sensible);

  // Auth
  await app.register(authPlugin);

  // API routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(meRoutes, { prefix: "/api" });
  await app.register(pairRoutes, { prefix: "/api" });
  await app.register(arcsRoutes, { prefix: "/api" });
  await app.register(todayRoutes, { prefix: "/api" });
  await app.register(historyRoutes, { prefix: "/api" });
  await app.register(scoreboardRoutes, { prefix: "/api" });
  await app.register(nudgeRoutes, { prefix: "/api" });
  await app.register(themesRoutes, { prefix: "/api" });

  // Serve frontend static build in production
  const webDist = path.resolve(__dirname, "../../web/dist");
  await app.register(fastifyStatic, {
    root: webDist,
    wildcard: false,
  });

  // SPA fallback
  app.setNotFoundHandler((_req, reply) => {
    return reply.sendFile("index.html");
  });

  return app;
}
