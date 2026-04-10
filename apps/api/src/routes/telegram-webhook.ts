import type { FastifyPluginAsync } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { telegramLinkTokens, users } from "../db/schema.js";

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

export const telegramWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.post("/webhook", async (req, reply) => {
    if (WEBHOOK_SECRET) {
      const header = req.headers["x-telegram-bot-api-secret-token"];
      if (header !== WEBHOOK_SECRET) {
        return reply.code(403).send({ error: "Invalid secret" });
      }
    }

    const update = req.body as any;
    const text: string | undefined = update?.message?.text;
    const chatId: number | undefined = update?.message?.chat?.id;

    if (!text || !chatId) {
      return reply.code(200).send({ ok: true });
    }

    const match = text.match(/^\/start\s+(.+)$/);
    if (!match) {
      return reply.code(200).send({ ok: true });
    }

    const token = match[1].trim();

    const [row] = await db()
      .select()
      .from(telegramLinkTokens)
      .where(eq(telegramLinkTokens.token, token))
      .limit(1);

    if (!row) {
      return reply.code(200).send({ ok: true });
    }

    if (new Date(row.expiresAt) < new Date()) {
      await db()
        .delete(telegramLinkTokens)
        .where(eq(telegramLinkTokens.token, token));
      return reply.code(200).send({ ok: true });
    }

    await db()
      .update(users)
      .set({ telegramChatId: String(chatId) })
      .where(eq(users.id, row.userId));

    await db()
      .delete(telegramLinkTokens)
      .where(eq(telegramLinkTokens.token, token));

    // Send a confirmation message back to the user
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
    if (BOT_TOKEN) {
      try {
        await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Connected to Arc Tracker! You'll receive nudge notifications here.",
            }),
          },
        );
      } catch {
        // best-effort
      }
    }

    return reply.code(200).send({ ok: true });
  });
};
