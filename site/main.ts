import { WordLadder } from "../src/index.js";
import WORDS from "./words.generated.json";
import { GOAL, LAUNCH_DATE, MIN_PAR, MAX_PAR, START_POOL } from "./config.js";
import { dailyPick, dayOf, easternDay } from "./daily.js";

const ladder = new WordLadder([...WORDS, GOAL]);
const distances = ladder.distancesTo(GOAL);
const pool = START_POOL.filter((w) => {
  const d = distances.get(w);
  return d !== undefined && d >= MIN_PAR && d <= MAX_PAR;
});
if (pool.length === 0) throw new Error(`No start words ${MIN_PAR}-${MAX_PAR} steps from ${GOAL}`);

const today = easternDay(new Date());
const puzzleIndex = today - dayOf(LAUNCH_DATE);
const START = dailyPick(pool, puzzleIndex);
const par = distances.get(START)!;

// If the tab stays open past midnight ET, load the new puzzle.
setInterval(() => {
  if (easternDay(new Date()) !== today) location.reload();
}, 60_000);

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const rungsEl = $<HTMLOListElement>("rungs");
const form = $<HTMLFormElement>("guess-form");
const input = $<HTMLInputElement>("guess");
const message = $<HTMLParagraphElement>("message");
const undoBtn = $<HTMLButtonElement>("undo");
const revealBtn = $<HTMLButtonElement>("reveal");

$("start").textContent = START;
$("goal").textContent = GOAL;
$("par").textContent = String(par);
$("puzzle").textContent = `#${puzzleIndex + 1}`;

let path = [START];
let finished = false;

function wordRow(word: string, cls: string): HTMLLIElement {
  const li = document.createElement("li");
  li.className = `rung ${cls}`;
  [...word].forEach((ch, i) => {
    const tile = document.createElement("span");
    tile.className = "tile";
    if (ch === GOAL[i]) tile.classList.add("match");
    tile.textContent = ch;
    li.append(tile);
  });
  return li;
}

function render(solution?: string[]): void {
  const rows = solution ?? path;
  rungsEl.replaceChildren(
    ...rows.map((w, i) => wordRow(w, i === 0 ? "start" : w === GOAL ? "goal" : ""))
  );
  if (!finished) {
    rungsEl.append(wordRow("????", "ghost"), wordRow(GOAL, "goal target"));
  }
  $("steps").textContent = String(path.length - 1);
  undoBtn.disabled = finished || path.length === 1;
  revealBtn.disabled = finished;
  input.disabled = finished;
}

function say(text: string, tone: "" | "error" | "win" = ""): void {
  message.textContent = text;
  message.className = tone;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const guess = input.value.trim().toLowerCase();
  const prev = path[path.length - 1];
  if (!/^[a-z]{4}$/.test(guess)) return say("Enter a four-letter word.", "error");
  if (!ladder.has(guess)) return say(`"${guess}" isn't in the word list.`, "error");
  if (!ladder.isValidStep(guess, prev)) return say(`Change exactly one letter of "${prev}".`, "error");
  path.push(guess);
  input.value = "";
  if (guess === GOAL) {
    finished = true;
    const steps = path.length - 1;
    say(
      steps === par
        ? `You reached the top in ${steps} steps — a perfect climb!`
        : `You reached the top in ${steps} steps (par is ${par}).`,
      "win"
    );
  } else {
    say("");
  }
  render();
});

undoBtn.addEventListener("click", () => {
  if (path.length > 1) path.pop();
  say("");
  render();
  input.focus();
});

revealBtn.addEventListener("click", () => {
  finished = true;
  const best = ladder.shortestPath(START, GOAL)!;
  say(`One ${par}-step solution:`);
  render(best);
});

render();
input.focus();
