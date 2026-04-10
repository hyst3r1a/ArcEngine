import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { loginRequestSchema } from "@arc/shared";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import type { LoginResponse } from "@arc/shared";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { inviteCode: string } }>("/login", async (req) => {
    const body = loginRequestSchema.parse(req.body);

    const [user] = await db()
      .select()
      .from(users)
      .where(eq(users.inviteCode, body.inviteCode))
      .limit(1);

    if (!user) {
      throw app.httpErrors.unauthorized("Invalid invite code");
    }

    const resp: LoginResponse = {
      token: user.inviteCode,
      user: {
        id: user.id,
        displayName: user.displayName,
        avatarSeed: user.avatarSeed,
      },
    };
    return resp;
  });
};
