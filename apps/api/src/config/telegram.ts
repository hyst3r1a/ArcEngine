const explicit = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const safe = explicit.replace(/[^A-Za-z0-9_-]/g, "");

export const WEBHOOK_SECRET = safe
  || (process.env.TELEGRAM_BOT_TOKEN ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64)
  || "";

export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
export const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME ?? "";
