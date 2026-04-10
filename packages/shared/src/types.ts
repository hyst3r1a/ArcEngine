export type User = {
  id: string;
  displayName: string;
  avatarSeed: string;
  createdAt: string;
};

export type Pair = {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
};

export type Arc = {
  id: string;
  key: string;
  name: string;
  order: number;
  isActive: boolean;
  schemaVersion: number;
  themeJson: string;
  schemaJson: string;
  scoringJson: string;
  completionJson: string;
};

export type UserArcState = {
  id: string;
  userId: string;
  arcId: string;
  startedAt: string;
  completedAt: string | null;
  currentStreak: number;
  bestStreak: number;
  totalScore: number;
};

export type DailyEntry = {
  id: string;
  userId: string;
  arcId: string;
  date: string;
  payloadJson: string;
  score: number;
  createdAt: string;
  updatedAt: string;
};

export type EventLog = {
  id: string;
  userId: string;
  arcId: string;
  type: string;
  metadataJson: string;
  createdAt: string;
};
