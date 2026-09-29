import { describe, it, expect } from "vitest";
import { dailyPick, dayOf, easternDay } from "../site/daily.js";

describe("easternDay", () => {
  it("rolls over at midnight EDT (04:00 UTC) in summer", () => {
    expect(easternDay(new Date("2026-09-29T03:59:00Z"))).toBe(dayOf("2026-09-28"));
    expect(easternDay(new Date("2026-09-29T04:00:00Z"))).toBe(dayOf("2026-09-29"));
  });

  it("rolls over at midnight EST (05:00 UTC) in winter", () => {
    expect(easternDay(new Date("2026-12-01T04:59:00Z"))).toBe(dayOf("2026-11-30"));
    expect(easternDay(new Date("2026-12-01T05:00:00Z"))).toBe(dayOf("2026-12-01"));
  });
});

describe("dailyPick", () => {
  const pool = ["word", "cold", "fish", "moon", "tree"];

  it("uses the first pool word on launch day", () => {
    expect(dailyPick(pool, 0)).toBe("word");
  });

  it("visits every word once per cycle, then repeats", () => {
    const cycle = pool.map((_, i) => dailyPick(pool, i));
    expect(new Set(cycle)).toEqual(new Set(pool));
    expect(dailyPick(pool, pool.length + 2)).toBe(cycle[2]);
  });

  it("is deterministic", () => {
    expect(dailyPick(pool, 3)).toBe(dailyPick([...pool], 3));
  });
});
