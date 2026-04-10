import type { ArcDefinition, ArcTheme } from "./arc-types.js";

export type UserSummary = {
  id: string;
  displayName: string;
  avatarSeed: string;
};

export type ArcStateSummary = {
  arcId: string;
  arcName: string;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
  startedAt: string;
  completedAt: string | null;
};

export type TodayEntry = {
  date: string;
  payload: Record<string, unknown>;
  score: number;
  saved: boolean;
};

export type TodayResponse = {
  user: UserSummary;
  arc: ArcDefinition;
  arcState: ArcStateSummary;
  today: TodayEntry;
  partner: {
    user: UserSummary;
    today: TodayEntry | null;
    arcState: ArcStateSummary;
  } | null;
};

export type HistoryEntry = {
  date: string;
  score: number;
  payload: Record<string, unknown>;
};

export type HistoryResponse = {
  arcId: string;
  entries: HistoryEntry[];
};

export type ScoreboardRow = {
  user: UserSummary;
  totalScore: number;
  currentStreak: number;
  bestStreak: number;
  weeklyScore: number;
};

export type ScoreboardResponse = {
  arcId: string;
  rows: ScoreboardRow[];
};

export type PairResponse = {
  pairId: string;
  users: [ScoreboardRow, ScoreboardRow];
};

export type ArcListItem = {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
  theme: ArcTheme;
};

export type ArcDetailResponse = {
  arc: ArcDefinition;
  state: ArcStateSummary | null;
};

export type LoginResponse = {
  token: string;
  user: UserSummary;
};

export type MeResponse = {
  user: UserSummary;
  activeArc: ArcStateSummary | null;
};
