import { buildDictionary, type Dictionary } from "./dictionary.js";
import { getNeighbors, oneLetterDifferent } from "./neighbors.js";
import { isValidStep } from "./validation.js";
import { shortestPath, enumerateShortestPaths, computeDistances } from "./solver.js";

export class WordLadder {
  readonly dictionary: Dictionary;
  constructor(words: Iterable<string>) {
    this.dictionary = buildDictionary(words);
  }
  get size(): number { return this.dictionary.size; }
  has(word: string): boolean { return this.dictionary.has(word.toLowerCase()); }
  neighbors(word: string): string[] { return getNeighbors(word, this.dictionary); }
  isValidStep(guess: string, prev: string): boolean { return isValidStep(guess, prev, this.dictionary); }
  shortestPath(start: string, end: string): string[] | null { return shortestPath(start, end, this.dictionary); }
  allShortestPaths(start: string, end: string, cap = 20): string[][] { return enumerateShortestPaths(start, end, this.dictionary, cap); }
  distancesTo(target: string): Map<string, number> { return computeDistances(target, this.dictionary); }
}
export { oneLetterDifferent };
