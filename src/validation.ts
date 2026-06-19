import type { Dictionary } from "./dictionary.js";
import { oneLetterDifferent } from "./neighbors.js";

/** A move is valid iff `guess` is in the dictionary and differs from `prev` by one letter. */
export function isValidStep(guess: string, prev: string, dict: Dictionary): boolean {
  const g = guess.toLowerCase();
  return dict.has(g) && oneLetterDifferent(g, prev);
}
