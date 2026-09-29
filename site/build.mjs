// Builds the static game site into site/dist for GitHub Pages.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const siteDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(siteDir, "dist");
const wordlistDir = path.join(siteDir, "..", "node_modules", "wordlist-english");

// English + American words up to frequency tier 50: broad enough to accept
// real guesses, small enough to skip most obscure Scrabble-only words.
const MAX_TIER = 50;
// Keep offensive words out of guesses and revealed solutions.
const BLOCKED = new Set([
  "cunt", "fuck", "shit", "piss", "cock", "dick", "twat", "tits", "dyke",
  "fags", "homo", "spic", "gook", "kike", "coon", "wank", "jizz", "pwns",
]);
const words = new Set();
for (const file of fs.readdirSync(wordlistDir)) {
  const m = file.match(/^(english|american)-words-(\d+)\.json$/);
  if (!m || Number(m[2]) > MAX_TIER) continue;
  for (const w of JSON.parse(fs.readFileSync(path.join(wordlistDir, file), "utf8"))) {
    if (/^[a-z]{4}$/.test(w) && !BLOCKED.has(w)) words.add(w);
  }
}
fs.writeFileSync(
  path.join(siteDir, "words.generated.json"),
  JSON.stringify([...words].sort())
);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
await build({
  entryPoints: [path.join(siteDir, "main.ts")],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2020",
  outfile: path.join(outDir, "app.js"),
});
fs.copyFileSync(path.join(siteDir, "index.html"), path.join(outDir, "index.html"));
console.log(`Built site/dist with ${words.size} words.`);
