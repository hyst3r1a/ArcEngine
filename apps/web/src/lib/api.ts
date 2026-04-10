import type {
  LoginResponse,
  MeResponse,
  TodayResponse,
  HistoryResponse,
  ScoreboardResponse,
  PairResponse,
  ArcListItem,
  ArcDetailResponse,
  ArcTheme,
} from "@arc/shared";

let authToken: string | null = localStorage.getItem("arc-token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("arc-token", token);
  } else {
    localStorage.removeItem("arc-token");
  }
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (inviteCode: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    }),

  me: () => request<MeResponse>("/api/me"),

  today: () => request<TodayResponse>("/api/today"),

  saveToday: (arcId: string, payload: Record<string, unknown>) =>
    request<TodayResponse>("/api/today", {
      method: "PUT",
      body: JSON.stringify({ arcId, payload }),
    }),

  history: (days = 30, arcId?: string) => {
    const params = new URLSearchParams({ days: String(days) });
    if (arcId) params.set("arcId", arcId);
    return request<HistoryResponse>(`/api/history?${params}`);
  },

  pair: () => request<PairResponse>("/api/pair"),

  scoreboard: () => request<ScoreboardResponse>("/api/scoreboard"),

  arcs: () => request<ArcListItem[]>("/api/arcs"),

  arcDetail: (arcId: string) =>
    request<ArcDetailResponse>(`/api/arcs/${arcId}`),

  nudge: () =>
    request<{ ok: boolean; message?: string }>("/api/nudge", {
      method: "POST",
      body: "{}",
    }),

  themes: () => request<Record<string, ArcTheme>>("/api/themes"),

  setTelegramChatId: (telegramChatId: string) =>
    request<{ ok: boolean }>("/api/me/telegram", {
      method: "PUT",
      body: JSON.stringify({ telegramChatId }),
    }),

  removeTelegram: () =>
    request<{ ok: boolean }>("/api/me/telegram", { method: "DELETE" }),
};
