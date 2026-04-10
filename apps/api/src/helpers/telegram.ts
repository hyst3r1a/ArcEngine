const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_MAP: Record<string, string> = parseChatMap();

function parseChatMap(): Record<string, string> {
  const raw = process.env.TELEGRAM_CHAT_MAP ?? "";
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    console.warn("TELEGRAM_CHAT_MAP is not valid JSON, skipping");
    return {};
  }
}

export function isTelegramConfigured(): boolean {
  return !!BOT_TOKEN && Object.keys(CHAT_MAP).length > 0;
}

export function getChatId(inviteCode: string): string | undefined {
  return CHAT_MAP[inviteCode];
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
