// Parses words.txt: whitespace-separated four-letter words, in any case.
// Shared by the site build and the tests so both see the same dictionary.
import fs from "node:fs";

export const WORDS_FILE = new URL("./words.txt", import.meta.url);

/** @returns {string[]} sorted, lowercase, de-duplicated four-letter words */
export function loadWords(file = WORDS_FILE) {
  const words = new Set();
  for (const token of fs.readFileSync(file, "utf8").split(/\s+/)) {
    const w = token.toLowerCase();
    if (/^[a-z]{4}$/.test(w)) words.add(w);
  }
  return [...words].sort();
}
