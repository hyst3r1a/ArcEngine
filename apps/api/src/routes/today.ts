import type { FastifyPluginAsync } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { todayPutSchema } from "@arc/shared";
import type { TodayResponse, TodayEntry } from "@arc/shared";
import { buildPayloadSchema, computeScore, computeStreak } from "@arc/arc-engine";
import { db } from "../db/client.js";
import { users, arcs, userArcStates, dailyEntries } from "../db/schema.js";
import { findPartnerIdAndPairId } from "../helpers/pair-lookup.js";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseArcDef(row: typeof arcs.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: "",
    order: row.order,
    schemaVersion: row.schemaVersion,
    theme: JSON.parse(row.themeJson),
    schema: JSON.parse(row.schemaJson),
    scoring: JSON.parse(row.scoringJson),
    completionRule: JSON.parse(row.completionJson),
  };
}

async function getArcState(userId: string, arcId: string) {
  const [state] = await db
    .select()
    .from(userArcStates)
    .where(and(eq(userArcStates.userId, userId), eq(userArcStates.arcId, arcId)))
    .limit(1);
  return state;
}

async function getTodayEntry(
  userId: string,
  arcId: string,
  date: string,
): Promise<TodayEntry> {
  const [entry] = await db
    .select()
    .from(dailyEntries)
    .where(
      and(
        eq(dailyEntries.userId, userId),
        eq(dailyEntries.arcId, arcId),
        eq(dailyEntries.date, date),
      ),
    )
    .limit(1);

  if (!entry) {
    return { date, payload: {}, score: 0, saved: false };
  }
  return {
    date: entry.date,
    payload: JSON.parse(entry.payloadJson),
    score: entry.score,
    saved: true,
  };
}

export const todayRoutes: FastifyPluginAsync = async (app) => {
  app.get("/today", async (req) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
    if (!user) throw app.httpErrors.notFound();

    const [activeArc] = await db.select().from(arcs).where(eq(arcs.isActive, true)).limit(1);
    if (!activeArc) throw app.httpErrors.notFound("No active arc");

    const arcDef = parseArcDef(activeArc);
    const date = todayStr();
    const today = await getTodayEntry(req.userId, activeArc.id, date);
    const state = await getArcState(req.userId, activeArc.id);

    let partner: TodayResponse["partner"] = null;
    const pairResult = await findPartnerIdAndPairId(req.userId);
    if (pairResult) {
      const [partnerUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, pairResult.partnerId))
        .limit(1);
      const partnerToday = await getTodayEntry(pairResult.partnerId, activeArc.id, date);
      const partnerState = await getArcState(pairResult.partnerId, activeArc.id);

      if (partnerUser) {
        partner = {
          user: {
            id: partnerUser.id,
            displayName: partnerUser.displayName,
            avatarSeed: partnerUser.avatarSeed,
          },
          today: partnerToday.saved ? partnerToday : null,
          arcState: {
            arcId: activeArc.id,
            arcName: activeArc.name,
            currentStreak: partnerState?.currentStreak ?? 0,
            bestStreak: partnerState?.bestStreak ?? 0,
            totalScore: partnerState?.totalScore ?? 0,
            startedAt: partnerState?.startedAt ?? "",
            completedAt: partnerState?.completedAt ?? null,
          },
        };
      }
    }

    const resp: TodayResponse = {
      user: {
        id: user.id,
        displayName: user.displayName,
        avatarSeed: user.avatarSeed,
      },
      arc: arcDef,
      arcState: {
        arcId: activeArc.id,
        arcName: activeArc.name,
        currentStreak: state?.currentStreak ?? 0,
        bestStreak: state?.bestStreak ?? 0,
        totalScore: state?.totalScore ?? 0,
        startedAt: state?.startedAt ?? "",
        completedAt: state?.completedAt ?? null,
      },
      today,
      partner,
    };
    return resp;
  });

  app.put<{ Body: { arcId: string; payload: Record<string, unknown> } }>(
    "/today",
    async (req) => {
      const body = todayPutSchema.parse(req.body);
      const { arcId, payload } = body;

      const [arcRow] = await db.select().from(arcs).where(eq(arcs.id, arcId)).limit(1);
      if (!arcRow) throw app.httpErrors.notFound("Arc not found");

      const arcDef = parseArcDef(arcRow);

      // Validate payload against arc schema
      const payloadSchema = buildPayloadSchema(arcDef.schema);
      const validated = payloadSchema.parse(payload);

      // Compute score
      const score = computeScore(validated as Record<string, unknown>, arcDef.scoring);

      const date = todayStr();
      const now = new Date().toISOString();

      // Upsert daily entry
      const [existing] = await db
        .select()
        .from(dailyEntries)
        .where(
          and(
            eq(dailyEntries.userId, req.userId),
            eq(dailyEntries.arcId, arcId),
            eq(dailyEntries.date, date),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(dailyEntries)
          .set({
            payloadJson: JSON.stringify(validated),
            score,
            updatedAt: now,
          })
          .where(eq(dailyEntries.id, existing.id));
      } else {
        await db.insert(dailyEntries).values({
          id: nanoid(),
          userId: req.userId,
          arcId,
          date,
          payloadJson: JSON.stringify(validated),
          score,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Recompute streak
      const allEntries = await db
        .select({ date: dailyEntries.date, score: dailyEntries.score })
        .from(dailyEntries)
        .where(
          and(eq(dailyEntries.userId, req.userId), eq(dailyEntries.arcId, arcId)),
        )
        .orderBy(dailyEntries.date);

      const { current, best } = computeStreak(allEntries, date);

      // Get existing state for cumulative total
      const [prevState] = await db
        .select()
        .from(userArcStates)
        .where(
          and(
            eq(userArcStates.userId, req.userId),
            eq(userArcStates.arcId, arcId),
          ),
        )
        .limit(1);

      const totalScore = allEntries.reduce((sum, e) => sum + e.score, 0);

      if (prevState) {
        await db
          .update(userArcStates)
          .set({ currentStreak: current, bestStreak: best, totalScore })
          .where(eq(userArcStates.id, prevState.id));
      } else {
        await db.insert(userArcStates).values({
          id: nanoid(),
          userId: req.userId,
          arcId,
          startedAt: now,
          currentStreak: current,
          bestStreak: best,
          totalScore,
        });
      }

      // Return fresh today response
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.userId))
        .limit(1);

      const todayEntry: TodayEntry = {
        date,
        payload: validated as Record<string, unknown>,
        score,
        saved: true,
      };

      let partner: TodayResponse["partner"] = null;
      const pairResult = await findPartnerIdAndPairId(req.userId);
      if (pairResult) {
        const [partnerUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, pairResult.partnerId))
          .limit(1);
        const partnerToday = await getTodayEntry(pairResult.partnerId, arcId, date);
        const partnerState = await getArcState(pairResult.partnerId, arcId);
        if (partnerUser) {
          partner = {
            user: {
              id: partnerUser.id,
              displayName: partnerUser.displayName,
              avatarSeed: partnerUser.avatarSeed,
            },
            today: partnerToday.saved ? partnerToday : null,
            arcState: {
              arcId,
              arcName: arcRow.name,
              currentStreak: partnerState?.currentStreak ?? 0,
              bestStreak: partnerState?.bestStreak ?? 0,
              totalScore: partnerState?.totalScore ?? 0,
              startedAt: partnerState?.startedAt ?? "",
              completedAt: partnerState?.completedAt ?? null,
            },
          };
        }
      }

      const resp: TodayResponse = {
        user: {
          id: user!.id,
          displayName: user!.displayName,
          avatarSeed: user!.avatarSeed,
        },
        arc: arcDef,
        arcState: {
          arcId,
          arcName: arcRow.name,
          currentStreak: current,
          bestStreak: best,
          totalScore,
          startedAt: prevState?.startedAt ?? now,
          completedAt: prevState?.completedAt ?? null,
        },
        today: todayEntry,
        partner,
      };
      return resp;
    },
  );
};
