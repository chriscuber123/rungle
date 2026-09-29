// Builds the static game site into site/dist for GitHub Pages.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const siteDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(siteDir, "dist");
// words.txt holds whitespace-separated four-letter words, in any case.
const words = new Set();
for (const token of fs.readFileSync(path.join(siteDir, "words.txt"), "utf8").split(/\s+/)) {
  const w = token.toLowerCase();
  if (/^[a-z]{4}$/.test(w)) words.add(w);
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
// Version the script URL by content so browsers never pair a new page with a
// stale cached app.js (GitHub Pages caches files for 10 minutes).
const hash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(path.join(outDir, "app.js")))
  .digest("hex")
  .slice(0, 10);
const html = fs.readFileSync(path.join(siteDir, "index.html"), "utf8");
if (!html.includes('src="./app.js"')) throw new Error('index.html must load src="./app.js"');
fs.writeFileSync(
  path.join(outDir, "index.html"),
  html.replace('src="./app.js"', `src="./app.js?v=${hash}"`)
);
console.log(`Built site/dist with ${words.size} words.`);
