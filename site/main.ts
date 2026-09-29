import { WordLadder } from "../src/index.js";
import WORDS from "./words.generated.json";
import { GOAL, START } from "./config.js";

const ladder = new WordLadder([...WORDS, START, GOAL]);
const par = ladder.distancesTo(GOAL).get(START);
if (par === undefined) throw new Error(`No ladder from ${START} to ${GOAL}`);

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

let path = [START];
let finished = false;

function wordRow(word: string, prev: string | undefined, cls: string): HTMLLIElement {
  const li = document.createElement("li");
  li.className = `rung ${cls}`;
  [...word].forEach((ch, i) => {
    const tile = document.createElement("span");
    tile.className = "tile";
    if (prev && prev[i] !== ch) tile.classList.add("changed");
    tile.textContent = ch;
    li.append(tile);
  });
  return li;
}

function render(solution?: string[]): void {
  const rows = solution ?? path;
  rungsEl.replaceChildren(
    ...rows.map((w, i) =>
      wordRow(w, rows[i - 1], i === 0 ? "start" : w === GOAL ? "goal" : "")
    )
  );
  if (!finished) {
    const ghost = wordRow("????", undefined, "ghost");
    rungsEl.append(ghost, wordRow(GOAL, undefined, "goal target"));
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
