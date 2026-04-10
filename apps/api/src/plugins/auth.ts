import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest("userId", "");

  app.addHook("onRequest", async (req: FastifyRequest) => {
    if (req.url.startsWith("/api/auth/")) return;
    if (!req.url.startsWith("/api/")) return;

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw app.httpErrors.unauthorized("Missing authorization token");
    }

    // MVP: token is the user's invite code
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.inviteCode, token))
      .limit(1);

    if (!user) {
      throw app.httpErrors.unauthorized("Invalid token");
    }

    req.userId = user.id;
  });
});
