import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  avatarSeed: text("avatar_seed").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const pairs = sqliteTable(
  "pairs",
  {
    id: text("id").primaryKey(),
    userAId: text("user_a_id")
      .notNull()
      .references(() => users.id),
    userBId: text("user_b_id")
      .notNull()
      .references(() => users.id),
    createdAt: text("created_at").notNull(),
  },
  (t) => [uniqueIndex("pair_users_idx").on(t.userAId, t.userBId)],
);

export const arcs = sqliteTable("arcs", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  schemaVersion: integer("schema_version").notNull().default(1),
  themeJson: text("theme_json").notNull(),
  schemaJson: text("schema_json").notNull(),
  scoringJson: text("scoring_json").notNull(),
  completionJson: text("completion_json").notNull(),
});

export const userArcStates = sqliteTable(
  "user_arc_states",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    arcId: text("arc_id")
      .notNull()
      .references(() => arcs.id),
    startedAt: text("started_at").notNull(),
    completedAt: text("completed_at"),
    currentStreak: integer("current_streak").notNull().default(0),
    bestStreak: integer("best_streak").notNull().default(0),
    totalScore: integer("total_score").notNull().default(0),
  },
  (t) => [uniqueIndex("user_arc_idx").on(t.userId, t.arcId)],
);

export const dailyEntries = sqliteTable(
  "daily_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    arcId: text("arc_id")
      .notNull()
      .references(() => arcs.id),
    date: text("date").notNull(),
    payloadJson: text("payload_json").notNull(),
    score: integer("score").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [uniqueIndex("daily_entry_unique_idx").on(t.userId, t.arcId, t.date)],
);

export const eventLog = sqliteTable("event_log", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  arcId: text("arc_id").references(() => arcs.id),
  type: text("type").notNull(),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});
