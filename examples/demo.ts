import { WordLadder } from "../src/index.js";
import { SAMPLE_WORDS } from "./sample-words.js";

// Build the word graph from the sample dictionary.
const ladder = new WordLadder(SAMPLE_WORDS);

// 1. Dictionary size.
console.log("Dictionary size:", ladder.size);

// 2. Neighbors of "care".
const careNeighbors = ladder.neighbors("care");
console.log('Neighbors of "care":', careNeighbors);

// 3. Shortest ladder from "cold" to "warm".
const path = ladder.shortestPath("cold", "warm");
if (path) {
  console.log(
    `Shortest ladder cold -> warm (${path.length - 1} steps):`,
    path.join(" -> ")
  );
} else {
  console.log("No ladder found from cold to warm.");
}

// 4. All shortest ladders from "cold" to "warm".
const allPaths = ladder.allShortestPaths("cold", "warm");
console.log(`All shortest ladders from cold to warm: ${allPaths.length} found`);
for (const p of allPaths) {
  console.log("  ", p.join(" -> "));
}

// 5. Par table: distances to "warm" for 5 sample words.
const distances = ladder.distancesTo("warm");
const sampleTargets = ["cold", "word", "find", "bond", "care"];
console.log('Par table (distances to "warm"):');
for (const w of sampleTargets) {
  const d = distances.get(w);
  console.log(`  ${w}: ${d !== undefined ? d : "unreachable"}`);
}
