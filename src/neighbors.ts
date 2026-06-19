import type { Dictionary } from "./dictionary.js";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

/** True iff a and b are the same length and differ in exactly one position. */
export function oneLetterDifferent(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a.charAt(i).toLowerCase() !== b.charAt(i).toLowerCase()) {
      diff++;
      if (diff > 1) return false;
    }
  }
  return diff === 1;
}

/** Every dictionary word that differs from `word` by exactly one letter (lowercase). */
export function getNeighbors(word: string, dict: Dictionary): string[] {
  const w = word.toLowerCase();
  const out: string[] = [];
  for (let i = 0; i < w.length; i++) {
    for (const c of ALPHABET) {
      if (c === w[i]) continue;
      const candidate = w.slice(0, i) + c + w.slice(i + 1);
      if (dict.has(candidate)) out.push(candidate);
    }
  }
  return out;
}
