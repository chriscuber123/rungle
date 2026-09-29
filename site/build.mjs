// Builds the static game site into site/dist for GitHub Pages.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const siteDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(siteDir, "dist");
// Keep offensive words out of guesses and revealed solutions.
const BLOCKED = new Set([
  "cunt", "fuck", "shit", "piss", "cock", "dick", "twat", "tits", "dyke",
  "fags", "homo", "gook", "coon", "wank", "jizz", "jism", "gism", "cums",
  "slut", "clit", "milf", "quim", "pwns",
]);
// words.txt holds whitespace-separated four-letter words, in any case.
const words = new Set();
for (const token of fs.readFileSync(path.join(siteDir, "words.txt"), "utf8").split(/\s+/)) {
  const w = token.toLowerCase();
  if (/^[a-z]{4}$/.test(w) && !BLOCKED.has(w)) words.add(w);
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
