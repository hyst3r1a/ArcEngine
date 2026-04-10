import "dotenv/config";
import { initDb } from "./db/init.js";
import { buildServer } from "./server.js";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST ?? "0.0.0.0";

async function registerTelegramWebhook(appUrl: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
  if (!token || !botUsername) return;

  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secret || undefined,
          allowed_updates: ["message"],
        }),
      },
    );
    const data = await res.json();
    console.log(`Telegram webhook registered: ${webhookUrl}`, data);
  } catch (err) {
    console.warn("Failed to register Telegram webhook:", err);
  }
}

async function main() {
  await initDb();
  const app = await buildServer();
  await app.listen({ port, host });

  const appUrl =
    process.env.RENDER_EXTERNAL_URL ??
    `http://localhost:${port}`;
  await registerTelegramWebhook(appUrl);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
