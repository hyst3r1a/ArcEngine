import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

export function isBotConfigured(): boolean {
  return !!BOT_TOKEN;
}

export async function getChatIdForUser(
  userId: string,
): Promise<string | null> {
  const [user] = await db()
    .select({ telegramChatId: users.telegramChatId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.telegramChatId ?? null;
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      console.error("Telegram API error:", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Telegram send failed:", err);
    return false;
  }
}
