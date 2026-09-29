# Rungle

A daily word ladder puzzle: climb from the day's start word to **RUNG** by changing one letter at a time. Every step has to be a real four-letter word, and a new start word arrives every day at midnight US Eastern time.

**Play it:** https://chriscuber123.github.io/rungle/

---

## How to play

1. Start on today's word. Type a four-letter word that differs from the current word by exactly one letter.
2. Keep climbing until you reach **RUNG**.
3. Try to match **par**, the fewest steps possible (5 or 6, depending on the day).

Letters that are already in the right place for RUNG turn green. Use **Undo** to step back, or **Show solution** to reveal one shortest ladder.

## Changing the puzzle

Everything lives in [`site/config.ts`](./site/config.ts):

| Setting | What it does |
|---|---|
| `GOAL` | The word every ladder climbs to (`"rung"`). |
| `LAUNCH_DATE` | The date of puzzle #1 (`"2026-09-28"`). |
| `START_POOL` | Candidate start words. The first one is used on launch day; the rest rotate in a fixed shuffled order, so no word repeats until the whole pool has been used (about 200 days). |
| `MIN_PAR` / `MAX_PAR` | Pool words outside this par range are skipped automatically. |

The daily word is chosen in each player's browser from the current date in New York (`site/daily.ts`), so everyone sees the same puzzle and no redeploy is needed when the day changes. To change the settings, edit the file, commit, and push to `main`; the site redeploys in about a minute.

Changing `START_POOL`, `GOAL` or the word list changes which word lands on which day, so upcoming puzzles will shuffle.

## Word list

Guesses are checked against [`site/words.txt`](./site/words.txt), about 5,600 four-letter Scrabble words. The file is whitespace-separated and case-insensitive, so you can paste in a new list as-is.

## Development

Requires Node 18+ and pnpm (or run `corepack pnpm` if pnpm isn't installed).

```bash
pnpm install
pnpm run site:build   # builds the game into site/dist
pnpm test             # runs the engine and daily-rotation tests
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
