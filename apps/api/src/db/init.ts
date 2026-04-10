import { sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { consistencyArc } from "@arc/arc-engine";
import { getDb } from "./client.js";
import * as schema from "./schema.js";

/**
 * Creates tables if they don't exist and seeds initial data.
 * Safe to call on every startup — all operations are idempotent.
 */
export async function initDb() {
  const db = await getDb();
  // Create tables via raw SQL (drizzle-kit push isn't available at runtime)
  await db.run(sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    avatar_seed TEXT NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  )`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS pairs (
    id TEXT PRIMARY KEY,
    user_a_id TEXT NOT NULL REFERENCES users(id),
    user_b_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  )`);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS pair_users_idx ON pairs(user_a_id, user_b_id)`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS arcs (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    schema_version INTEGER NOT NULL DEFAULT 1,
    theme_json TEXT NOT NULL,
    schema_json TEXT NOT NULL,
    scoring_json TEXT NOT NULL,
    completion_json TEXT NOT NULL
  )`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS user_arc_states (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    arc_id TEXT NOT NULL REFERENCES arcs(id),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0
  )`);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS user_arc_idx ON user_arc_states(user_id, arc_id)`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS daily_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    arc_id TEXT NOT NULL REFERENCES arcs(id),
    date TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS daily_entry_unique_idx ON daily_entries(user_id, arc_id, date)`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS event_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    arc_id TEXT REFERENCES arcs(id),
    type TEXT NOT NULL,
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
  )`);

  await db.run(sql`CREATE TABLE IF NOT EXISTS telegram_link_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  )`);

  // Migrations — idempotent column additions
  try {
    await db.run(sql`ALTER TABLE users ADD COLUMN telegram_chat_id TEXT`);
  } catch {
    // column already exists
  }

  // Seed if empty
  const existingUsers = await db.select().from(schema.users).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database...");
  const now = new Date().toISOString();

  const userA = {
    id: nanoid(),
    displayName: "Player One",
    avatarSeed: "alpha",
    inviteCode: "invite-alpha",
    createdAt: now,
  };

  const userB = {
    id: nanoid(),
    displayName: "Player Two",
    avatarSeed: "beta",
    inviteCode: "invite-beta",
    createdAt: now,
  };

  await db.insert(schema.users).values(userA);
  await db.insert(schema.users).values(userB);

  await db.insert(schema.pairs).values({
    id: nanoid(),
    userAId: userA.id,
    userBId: userB.id,
    createdAt: now,
  });

  const arc = consistencyArc;
  await db.insert(schema.arcs).values({
    id: arc.id,
    key: arc.id,
    name: arc.name,
    order: arc.order,
    isActive: true,
    schemaVersion: arc.schemaVersion,
    themeJson: JSON.stringify(arc.theme),
    schemaJson: JSON.stringify(arc.schema),
    scoringJson: JSON.stringify(arc.scoring),
    completionJson: JSON.stringify(arc.completionRule),
  });

  for (const user of [userA, userB]) {
    await db.insert(schema.userArcStates).values({
      id: nanoid(),
      userId: user.id,
      arcId: arc.id,
      startedAt: now,
      currentStreak: 0,
      bestStreak: 0,
      totalScore: 0,
    });
  }

  console.log("Seed complete.");
  console.log(`  User A: ${userA.displayName} (code: ${userA.inviteCode})`);
  console.log(`  User B: ${userB.displayName} (code: ${userB.inviteCode})`);
}
