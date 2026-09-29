// Spoiler-free result card: one row per word, green where the letter already
// matches the goal in that position, white where it doesn't.

export function shareText(opts: {
  puzzle: number;
  path: readonly string[];
  goal: string;
  par: number;
  url: string;
}): string {
  const { puzzle, path, goal, par, url } = opts;
  const rows = path.map((word) =>
    [...word].map((ch, i) => (ch === goal[i] ? "🟩" : "⬜")).join("")
  );
  return [`RUNGLE #${puzzle} ${path.length - 1}/${par}`, ...rows, "", url].join("\n");
}
