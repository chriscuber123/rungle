// Daily puzzle selection. Days roll over at midnight US Eastern time
// (America/New_York, so daylight saving is handled by Intl).

const MS_PER_DAY = 86_400_000;

/** Days since the Unix epoch for the calendar date in New York at `now`. */
export function easternDay(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return Date.UTC(get("year"), get("month") - 1, get("day")) / MS_PER_DAY;
}

/** Day number for a "YYYY-MM-DD" date string. */
export function dayOf(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`) / MS_PER_DAY;
}

// Small deterministic PRNG so every player gets the same shuffle.
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pool words whose shortest ladder to the goal is between minPar and maxPar
 * steps. `distances` is the goal's distance map (WordLadder.distancesTo).
 */
export function eligibleStarts(
  pool: readonly string[],
  distances: ReadonlyMap<string, number>,
  minPar: number,
  maxPar: number
): string[] {
  return pool.filter((w) => {
    const d = distances.get(w);
    return d !== undefined && d >= minPar && d <= maxPar;
  });
}

/**
 * Word for puzzle number `n` (0 = launch day). The first pool word is always
 * puzzle 0; the rest are shuffled once and cycled, so no word repeats until
 * the whole pool has been used.
 */
export function dailyPick(pool: readonly string[], n: number): string {
  const [first, ...rest] = pool;
  const rand = mulberry32(0x52554e47); // "RUNG"
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const order = [first, ...rest];
  return order[((n % order.length) + order.length) % order.length];
}
