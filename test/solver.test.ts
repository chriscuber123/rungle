import { describe, it, expect } from "vitest";
import {
  buildDictionary,
  getNeighbors,
  oneLetterDifferent,
  isValidStep,
  shortestPath,
  enumerateShortestPaths,
  computeDistances,
  WordLadder,
} from "../src/index.js";

// ---------------------------------------------------------------------------
// Inline fixtures
// ---------------------------------------------------------------------------

const WORDS = [
  "cold", "cord", "card", "ward", "warm", "word", "wart", "want", "wane", "cane",
  "care", "core", "bore", "bone", "bane", "band", "bend", "bond", "fond", "find",
];

const dict = buildDictionary(WORDS);

// A two-word dictionary where "cold" and "xyzz" are not one-letter neighbors,
// so no path exists between them.
const isolatedDict = buildDictionary(["cold", "xyzz"]);

// ---------------------------------------------------------------------------
// buildDictionary
// ---------------------------------------------------------------------------

describe("buildDictionary", () => {
  it("lowercases and trims input words", () => {
    const d = buildDictionary(["  COLD ", "Warm"]);
    expect(d.has("cold")).toBe(true);
    expect(d.has("warm")).toBe(true);
    expect(d.has("COLD")).toBe(false);
    expect(d.has("Warm")).toBe(false);
  });

  it("drops empty strings and whitespace-only entries", () => {
    const d = buildDictionary(["cold", "", "   ", "warm"]);
    expect(d.size).toBe(2);
    expect(d.has("cold")).toBe(true);
    expect(d.has("warm")).toBe(true);
  });

  it("builds dictionary from the full WORDS fixture with correct size", () => {
    expect(dict.size).toBe(20);
    expect(dict.has("cold")).toBe(true);
    expect(dict.has("find")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// oneLetterDifferent
// ---------------------------------------------------------------------------

describe("oneLetterDifferent", () => {
  it("returns true for words that differ in exactly one position", () => {
    expect(oneLetterDifferent("cold", "cord")).toBe(true);
    expect(oneLetterDifferent("care", "core")).toBe(true);
  });

  it("returns false for identical words (zero differences)", () => {
    expect(oneLetterDifferent("cold", "cold")).toBe(false);
    expect(oneLetterDifferent("warm", "warm")).toBe(false);
  });

  it("returns false for words that differ in more than one position", () => {
    expect(oneLetterDifferent("cold", "warm")).toBe(false);
    expect(oneLetterDifferent("cold", "bond")).toBe(false);
  });

  it("returns false for words of different lengths", () => {
    expect(oneLetterDifferent("cold", "col")).toBe(false);
    expect(oneLetterDifferent("cold", "colds")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getNeighbors
// ---------------------------------------------------------------------------

describe("getNeighbors", () => {
  it("returns the correct neighbors of 'care' within WORDS (order-independent)", () => {
    const neighbors = getNeighbors("care", dict).sort();
    // card (a->d@3), cane (r->n@2), core (a->o@1)
    expect(neighbors).toEqual(["cane", "card", "core"]);
  });

  it("returns no neighbors for a word with no one-letter matches in dict", () => {
    const d = buildDictionary(["xyzz"]);
    expect(getNeighbors("xyzz", d)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isValidStep
// ---------------------------------------------------------------------------

describe("isValidStep", () => {
  it("returns true when guess is in dict and differs from prev by one letter", () => {
    expect(isValidStep("cord", "cold", dict)).toBe(true);
    expect(isValidStep("care", "core", dict)).toBe(true);
  });

  it("returns false when guess is not in the dictionary", () => {
    expect(isValidStep("xxxx", "cold", dict)).toBe(false);
  });

  it("returns false when guess differs by more than one letter from prev", () => {
    // warm vs cold: w->c and a->o are already 2 differences
    expect(isValidStep("warm", "cold", dict)).toBe(false);
  });

  it("returns false when guess equals prev (zero differences)", () => {
    expect(isValidStep("cold", "cold", dict)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// shortestPath
// ---------------------------------------------------------------------------

describe("shortestPath", () => {
  it("finds the shortest path from cold to warm (length 5, 4 steps)", () => {
    const path = shortestPath("cold", "warm", dict);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(5);
    expect(path![0]).toBe("cold");
    expect(path![path!.length - 1]).toBe("warm");
  });

  it("returns [start] when start equals end", () => {
    expect(shortestPath("warm", "warm", dict)).toEqual(["warm"]);
  });

  it("returns null when start is not in dict", () => {
    expect(shortestPath("xyzz", "warm", dict)).toBeNull();
  });

  it("returns null when end is not in dict", () => {
    expect(shortestPath("cold", "xyzz", dict)).toBeNull();
  });

  it("returns null when no path exists between the two words", () => {
    // isolatedDict contains only "cold" and "xyzz" which are not one-letter neighbors
    expect(shortestPath("cold", "xyzz", isolatedDict)).toBeNull();
  });

  it("returns lowercase path words", () => {
    const path = shortestPath("COLD", "WARM", dict);
    expect(path).not.toBeNull();
    path!.forEach((w) => expect(w).toBe(w.toLowerCase()));
  });
});

// ---------------------------------------------------------------------------
// enumerateShortestPaths
// ---------------------------------------------------------------------------

describe("enumerateShortestPaths", () => {
  const coldWarmPaths = enumerateShortestPaths("cold", "warm", dict);
  const expectedLength = shortestPath("cold", "warm", dict)!.length;

  it("returns at least 2 distinct shortest paths for cold->warm", () => {
    expect(coldWarmPaths.length).toBeGreaterThanOrEqual(2);
  });

  it("every returned path has the same length as shortestPath", () => {
    coldWarmPaths.forEach((p) => {
      expect(p.length).toBe(expectedLength);
    });
  });

  it("every returned path starts with 'cold' and ends with 'warm'", () => {
    coldWarmPaths.forEach((p) => {
      expect(p[0]).toBe("cold");
      expect(p[p.length - 1]).toBe("warm");
    });
  });

  it("all paths are distinct (no duplicates)", () => {
    const serialized = coldWarmPaths.map((p) => p.join(","));
    const unique = new Set(serialized);
    expect(unique.size).toBe(coldWarmPaths.length);
  });

  it("returns [[start]] when start equals end", () => {
    expect(enumerateShortestPaths("warm", "warm", dict)).toEqual([["warm"]]);
  });

  it("returns [] when start is not in dict", () => {
    expect(enumerateShortestPaths("xyzz", "warm", dict)).toEqual([]);
  });

  it("returns [] when end is not in dict", () => {
    expect(enumerateShortestPaths("cold", "xyzz", dict)).toEqual([]);
  });

  it("returns [] when no path exists between the two words", () => {
    expect(enumerateShortestPaths("cold", "xyzz", isolatedDict)).toEqual([]);
  });

  it("respects the cap parameter: cap=1 yields exactly 1 path", () => {
    const capped = enumerateShortestPaths("cold", "warm", dict, 1);
    expect(capped.length).toBe(1);
    expect(capped[0]!.length).toBe(expectedLength);
  });
});

// ---------------------------------------------------------------------------
// computeDistances
// ---------------------------------------------------------------------------

describe("computeDistances", () => {
  const dists = computeDistances("warm", dict);

  it("maps target itself to 0", () => {
    expect(dists.get("warm")).toBe(0);
  });

  it("includes every word in WORDS (all reachable from warm)", () => {
    // The fixture is fully connected, so all 20 words should be present
    WORDS.forEach((w) => {
      expect(dists.has(w)).toBe(true);
    });
  });

  it("returns empty Map when target is not in dict", () => {
    const empty = computeDistances("aaaa", dict);
    expect(empty.size).toBe(0);
  });

  it("a word in an isolated dict is absent from distances of a different target", () => {
    // "xyzz" is reachable only from itself in isolatedDict
    const isoDists = computeDistances("xyzz", isolatedDict);
    expect(isoDists.has("cold")).toBe(false);
  });

  it("cross-checks with shortestPath for a sample of words", () => {
    const samples = ["cold", "cord", "card", "ward"];
    samples.forEach((w) => {
      const sp = shortestPath(w, "warm", dict);
      expect(sp).not.toBeNull();
      const cdDist = dists.get(w);
      expect(cdDist).toBeDefined();
      // shortestPath length - 1 == number of steps == computeDistances value
      expect(sp!.length - 1).toBe(cdDist);
    });
  });
});

// ---------------------------------------------------------------------------
// WordLadder class
// ---------------------------------------------------------------------------

describe("WordLadder", () => {
  const ladder = new WordLadder(WORDS);

  it("has .size equal to the number of distinct words", () => {
    expect(ladder.size).toBe(20);
  });

  it(".has() returns true for words in the dictionary", () => {
    expect(ladder.has("cold")).toBe(true);
    expect(ladder.has("warm")).toBe(true);
  });

  it(".has() returns false for words not in the dictionary", () => {
    expect(ladder.has("zzzz")).toBe(false);
    expect(ladder.has("xyzz")).toBe(false);
  });

  it(".shortestPath() mirrors the standalone shortestPath function", () => {
    expect(ladder.shortestPath("cold", "warm")).toEqual(
      shortestPath("cold", "warm", dict),
    );
  });

  it(".shortestPath() returns [start] when start===end", () => {
    expect(ladder.shortestPath("warm", "warm")).toEqual(["warm"]);
  });

  it(".shortestPath() returns null for unknown word", () => {
    expect(ladder.shortestPath("zzzz", "warm")).toBeNull();
  });

  it(".allShortestPaths() mirrors enumerateShortestPaths", () => {
    const via = ladder.allShortestPaths("cold", "warm");
    const direct = enumerateShortestPaths("cold", "warm", dict);
    expect(via.length).toBe(direct.length);
    via.forEach((p, i) => expect(p).toEqual(direct[i]));
  });

  it(".allShortestPaths() returns [[start]] when start===end", () => {
    expect(ladder.allShortestPaths("warm", "warm")).toEqual([["warm"]]);
  });

  it(".allShortestPaths() returns [] for unknown word", () => {
    expect(ladder.allShortestPaths("zzzz", "warm")).toEqual([]);
  });

  it(".distancesTo() mirrors computeDistances", () => {
    const via = ladder.distancesTo("warm");
    const direct = computeDistances("warm", dict);
    expect(via.size).toBe(direct.size);
    expect(via.get("cold")).toBe(direct.get("cold"));
    expect(via.get("warm")).toBe(0);
  });

  it(".distancesTo() returns empty Map when target not in dict", () => {
    expect(ladder.distancesTo("zzzz").size).toBe(0);
  });
});
