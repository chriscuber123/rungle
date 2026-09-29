# Rungle

A word ladder puzzle: climb from **WORD** to **RUNG** by changing one letter at a time. Every step has to be a real four-letter word.

**Play it:** https://chriscuber123.github.io/rungle/

---

## How to play

1. You start on **WORD**. Type a four-letter word that differs from the current word by exactly one letter.
2. Keep climbing until you reach **RUNG**.
3. Try to match **par**, the fewest steps possible. For this puzzle, par is **5**.

Changed letters are highlighted on each rung. Use **Undo** to step back, or **Show solution** to reveal one shortest ladder.

## Changing the puzzle

The start and goal words live in [`site/config.ts`](./site/config.ts):

```typescript
export const GOAL = "rung";
export const START = "word";
```

Edit them, commit, and push to `main`. The site rebuilds and redeploys automatically in about a minute. Par is computed from the word list, so pick a start word that can actually reach the goal. If no ladder exists, the game won't load.

## Word list

Guesses are checked against [`site/words.txt`](./site/words.txt), about 5,600 four-letter Scrabble words. The file is whitespace-separated and case-insensitive, so you can paste in a new list as-is. A small blocklist in [`site/build.mjs`](./site/build.mjs) filters out offensive words.

## Development

Requires Node 18+ and pnpm (or run `corepack pnpm` if pnpm isn't installed).

```bash
pnpm install
pnpm run site:build   # builds the game into site/dist
pnpm test             # runs the engine's tests
```

To preview locally, serve `site/dist` with any static file server, for example `npx serve site/dist`.

## Deployment

[`.github/workflows/pages.yml`](./.github/workflows/pages.yml) builds `site/dist` and publishes it to GitHub Pages on every push to `main`. In the repo settings, **Settings → Pages → Source** must be set to **GitHub Actions**.

## How it works

Rungle is built on the [poople](https://github.com/horushe93/poople) word ladder engine, a small TypeScript library that lives in [`src/`](./src). It treats every word as a node in a graph, with an edge between words that differ by one letter:

- `isValidStep` checks each guess.
- `distancesTo("rung")` runs one breadth-first search from the goal to compute par.
- `shortestPath` finds the ladder shown by **Show solution**.

See the [upstream README](https://github.com/horushe93/poople#readme) for the full engine API.

## License

[MIT](./LICENSE). The word ladder engine is by horushe93.
