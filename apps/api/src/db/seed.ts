import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { consistencyArc } from "@arc/arc-engine";
import * as schema from "./schema.js";

const url = process.env.DATABASE_URL ?? "file:dev.db";
const client = createClient({ url });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  const userA = {
    id: nanoid(),
    displayName: "Player One",
    avatarSeed: "alpha",
    inviteCode: "invite-alpha",
    createdAt: new Date().toISOString(),
  };

  const userB = {
    id: nanoid(),
    displayName: "Player Two",
    avatarSeed: "beta",
    inviteCode: "invite-beta",
    createdAt: new Date().toISOString(),
  };

  await db.insert(schema.users).values(userA).onConflictDoNothing();
  await db.insert(schema.users).values(userB).onConflictDoNothing();

  const pair = {
    id: nanoid(),
    userAId: userA.id,
    userBId: userB.id,
    createdAt: new Date().toISOString(),
  };
  await db.insert(schema.pairs).values(pair).onConflictDoNothing();

  const arc = consistencyArc;
  await db
    .insert(schema.arcs)
    .values({
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
    })
    .onConflictDoNothing();

  const now = new Date().toISOString();
  for (const user of [userA, userB]) {
    await db
      .insert(schema.userArcStates)
      .values({
        id: nanoid(),
        userId: user.id,
        arcId: arc.id,
        startedAt: now,
        currentStreak: 0,
        bestStreak: 0,
        totalScore: 0,
      })
      .onConflictDoNothing();
  }

  console.log("Seed complete.");
  console.log(`  User A: ${userA.displayName} (code: ${userA.inviteCode})`);
  console.log(`  User B: ${userB.displayName} (code: ${userB.inviteCode})`);
}

seed().catch(console.error);
