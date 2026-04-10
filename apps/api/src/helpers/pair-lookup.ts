import { eq, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { pairs } from "../db/schema.js";

export async function findPartnerIdAndPairId(
  userId: string,
): Promise<{ pairId: string; partnerId: string } | null> {
  const [pair] = await db
    .select()
    .from(pairs)
    .where(or(eq(pairs.userAId, userId), eq(pairs.userBId, userId)))
    .limit(1);

  if (!pair) return null;

  const partnerId = pair.userAId === userId ? pair.userBId : pair.userAId;
  return { pairId: pair.id, partnerId };
}
