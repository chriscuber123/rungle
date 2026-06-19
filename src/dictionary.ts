/** A set of legal words. All words are stored lowercased. */
export type Dictionary = ReadonlySet<string>;

/** Build a Dictionary from any iterable of words. Trims and lowercases; drops empties. */
export function buildDictionary(words: Iterable<string>): Dictionary {
  const set = new Set<string>();
  for (const w of words) {
    const key = w.trim().toLowerCase();
    if (key) set.add(key);
  }
  return set;
}
