type EntryForStreak = { date: string; score: number };

/**
 * Compute current streak and best streak from an ordered list of daily entries.
 * Entries must be sorted by date ascending. A day counts toward a streak
 * if score > 0.
 */
export function computeStreak(
  entries: EntryForStreak[],
  today?: string,
): { current: number; best: number } {
  if (entries.length === 0) return { current: 0, best: 0 };

  const todayStr = today ?? new Date().toISOString().slice(0, 10);

  let current = 0;
  let best = 0;
  let streak = 0;
  let expectedDate = "";

  for (const entry of entries) {
    if (entry.score > 0) {
      if (expectedDate === "" || entry.date === expectedDate) {
        streak++;
      } else {
        streak = 1;
      }
      if (streak > best) best = streak;
    } else {
      streak = 0;
    }
    expectedDate = nextDay(entry.date);
  }

  // Current streak only counts if the chain reaches today or yesterday
  const lastEntry = entries[entries.length - 1];
  if (lastEntry && lastEntry.score > 0) {
    const lastDate = lastEntry.date;
    if (lastDate === todayStr || lastDate === prevDay(todayStr)) {
      current = streak;
    }
  }

  return { current, best };
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
