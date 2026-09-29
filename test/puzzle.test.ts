// Guards the live puzzle config: fails CI (and blocks the Pages deploy) if an
// edit to words.txt or config.ts would give players an unsolvable or
// out-of-range daily puzzle.
import { describe, it, expect } from "vitest";
import { WordLadder } from "../src/index.js";
import { loadWords } from "../site/words.mjs";
import { GOAL, LAUNCH_DATE, MIN_PAR, MAX_PAR, START_POOL } from "../site/config.js";
import { dailyPick, dayOf, eligibleStarts } from "../site/daily.js";

const words: string[] = loadWords();
const ladder = new WordLadder(words);
const distances = ladder.distancesTo(GOAL);

describe("puzzle config", () => {
  it("GOAL is in the word list", () => {
    expect(ladder.has(GOAL)).toBe(true);
  });

  it("START_POOL has no duplicates", () => {
    const dupes = START_POOL.filter((w, i) => START_POOL.indexOf(w) !== i);
    expect(dupes).toEqual([]);
  });

  it(`every START_POOL word is ${MIN_PAR}-${MAX_PAR} steps from GOAL`, () => {
    const bad = START_POOL.filter((w) => !eligibleStarts([w], distances, MIN_PAR, MAX_PAR).length)
      .map((w) => `${w} (${ladder.has(w) ? distances.get(w) ?? "no ladder" : "not in words.txt"})`);
    expect(bad).toEqual([]);
  });

  it("every puzzle for the next two years has a valid shortest ladder", () => {
    const pool = eligibleStarts(START_POOL, distances, MIN_PAR, MAX_PAR);
    const firstDay = dayOf(LAUNCH_DATE);
    const today = Math.floor(Date.now() / 86_400_000);
    for (let day = Math.max(firstDay, today - 1); day < today + 730; day++) {
      const start = dailyPick(pool, day - firstDay);
      const par = distances.get(start);
      expect(par, `no ladder from ${start}`).toBeDefined();
      expect(par).toBeGreaterThanOrEqual(MIN_PAR);
      expect(par).toBeLessThanOrEqual(MAX_PAR);
      // Walk an actual ladder down the distance map, one legal step at a time.
      let word = start;
      for (let d = par!; d > 0; d--) {
        const next = ladder.neighbors(word).find((n) => distances.get(n) === d - 1);
        expect(next, `ladder from ${start} breaks at ${word}`).toBeDefined();
        expect(ladder.isValidStep(next!, word)).toBe(true);
        word = next!;
      }
      expect(word).toBe(GOAL);
    }
  });
});
