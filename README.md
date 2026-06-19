# poople

A tiny, dependency-free TypeScript word ladder engine.

Find the shortest path between two words by changing one letter at a time, using any dictionary you supply.

[![npm version](https://img.shields.io/npm/v/poople.svg)](https://www.npmjs.com/package/poople)
[![license](https://img.shields.io/npm/l/poople.svg)](https://github.com/horushe93/poople/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/horushe93/poople/ci.yml?label=CI)](https://github.com/horushe93/poople/actions)

---

A word ladder (also called Doublets, invented by Lewis Carroll in 1877) is a sequence of words where each step changes exactly one letter and every intermediate word is a real dictionary word. For example: **cold** → cord → card → ward → **warm**. This library finds the shortest such ladder between any two words using breadth-first search over a word graph you build from any dictionary you provide.

See it in action in the daily [Poople word ladder game](https://poople.io/).

---

## Features

- Zero runtime dependencies
- Full TypeScript types included, ships as ESM
- Bring-your-own-dictionary: no bundled word list, works with any language or domain
- Single shortest path via BFS
- All shortest paths via multi-parent BFS with an optional cap
- Whole-graph distance map for computing "par" scores across an entire puzzle set

## Install

```bash
npm i poople
```

```bash
pnpm add poople
```

```bash
yarn add poople
```

## Quick start

```typescript
import { buildDictionary, shortestPath, WordLadder } from "poople";

// Build a dictionary from any iterable of strings.
const words = ["cold", "cord", "card", "ward", "warm", "bold", "bard"];
const dict = buildDictionary(words);

// Find the shortest word ladder between two words.
const path = shortestPath("cold", "warm", dict);
console.log(path);
// => ["cold", "cord", "card", "ward", "warm"]

// Or use the WordLadder class for an ergonomic, stateful wrapper.
const ladder = new WordLadder(words);

console.log(ladder.shortestPath("cold", "warm"));
// => ["cold", "cord", "card", "ward", "warm"]

// Compute the distance from every reachable word to a target.
// Useful for setting a "par" score for the whole puzzle set.
const distances = ladder.distancesTo("warm");
console.log(distances.get("cold")); // => 4
console.log(distances.get("cord")); // => 3
```

## API reference

### Types

| Export | Description |
|---|---|
| `Dictionary` | `ReadonlySet<string>`, the normalized set of legal words |

### Functions

#### `buildDictionary(words: Iterable<string>): Dictionary`

Normalizes each word (trim + lowercase), drops empty strings, and returns a `ReadonlySet<string>`.

#### `getNeighbors(word: string, dict: Dictionary): string[]`

Returns every word in `dict` that differs from `word` by exactly one letter. Input is lowercased automatically.

#### `oneLetterDifferent(a: string, b: string): boolean`

Returns `true` if `a` and `b` are the same length and differ in exactly one character position. Case-insensitive.

#### `isValidStep(guess: string, prev: string, dict: Dictionary): boolean`

Returns `true` if `guess` is present in `dict` and differs from `prev` by exactly one letter. Useful for validating player moves in a word ladder game.

#### `shortestPath(start: string, end: string, dict: Dictionary): string[] | null`

BFS shortest path from `start` to `end`. Returns an inclusive array of words (both endpoints included), or `null` if either word is absent from the dictionary or no ladder exists. Returns `[start]` when `start === end`. All words in the result are lowercase.

#### `enumerateShortestPaths(start: string, end: string, dict: Dictionary, cap?: number): string[][]`

Returns all shortest ladders from `start` to `end`, up to `cap` results (default `20`). Uses multi-parent BFS to discover every shortest-path predecessor, then backtracks to reconstruct all routes. Returns an empty array if either word is unknown or the pair is unreachable. Returns `[[start]]` when `start === end`.

#### `computeDistances(target: string, dict: Dictionary): Map<string, number>`

BFS flood from `target` outward across the entire word graph. Returns a `Map<string, number>` where each key is a word reachable from `target` and the value is the minimum number of steps to reach `target`. The target itself maps to `0`. Words unreachable from `target` are absent from the map. Use this to pre-compute the "par" (optimal step count) for every possible puzzle start word in a given dictionary.

### Class: `WordLadder`

An ergonomic wrapper that holds a dictionary and exposes all operations as methods.

```typescript
const ladder = new WordLadder(words: Iterable<string>)
```

| Member | Signature | Description |
|---|---|---|
| `size` | `number` | Number of words in the dictionary |
| `has` | `(word: string) => boolean` | Whether `word` is in the dictionary (case-insensitive) |
| `neighbors` | `(word: string) => string[]` | Words one letter away from `word` |
| `isValidStep` | `(guess: string, prev: string) => boolean` | Whether `guess` is a legal next step from `prev` |
| `shortestPath` | `(start: string, end: string) => string[] \| null` | BFS shortest ladder, or `null` |
| `allShortestPaths` | `(start: string, end: string, cap?: number) => string[][]` | All shortest ladders, up to `cap` (default 20) |
| `distancesTo` | `(target: string) => Map<string, number>` | BFS distance map from every reachable word to `target` |

## How it works

The library models the word puzzle as a graph where each node is a word and two nodes share an edge when the words differ by exactly one letter. `shortestPath` runs standard BFS over this graph, which guarantees the shortest-step solution.

`enumerateShortestPaths` uses multi-parent BFS: during layer-by-layer expansion, every node records all predecessors that reach it at the minimum depth, not just the first one found. After the layer containing the target word is fully expanded, the algorithm backtracks through the parent map with a depth-first traversal to reconstruct all distinct shortest routes. Collection stops once `cap` paths are gathered, preventing exponential blowup on highly connected graphs.

`computeDistances` is a single BFS flood starting from the target word. Because BFS expands level by level, every word is assigned its exact minimum distance the first time it is reached. One call covers the entire connected component, making it efficient for bulk "par" precomputation.

## Live demo

This engine powers the daily [Poople word ladder game](https://poople.io/), a four-letter word ladder game with a new puzzle every day.

## License

[MIT](./LICENSE)
