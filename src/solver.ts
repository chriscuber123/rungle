import type { Dictionary } from "./dictionary.js";
import { getNeighbors } from "./neighbors.js";

/**
 * BFS shortest path from `start` to `end`, inclusive of both endpoints.
 * Returns null if start or end is not in dict, or the pair is unreachable.
 * Returns [start] when start === end.
 * All words in the returned path are lowercase.
 */
export function shortestPath(
  start: string,
  end: string,
  dict: Dictionary,
): string[] | null {
  const s = start.toLowerCase();
  const e = end.toLowerCase();

  if (!dict.has(s) || !dict.has(e)) return null;
  if (s === e) return [s];

  const queue: string[][] = [[s]];
  const visited = new Set<string>([s]);

  while (queue.length > 0) {
    const path = queue.shift() as string[];
    const node = path[path.length - 1] as string;
    if (node === e) return path;
    for (const nb of getNeighbors(node, dict)) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(path.concat(nb));
      }
    }
  }

  return null;
}

/**
 * BFS that finds ALL shortest paths from `start` to `end`.
 *
 * Algorithm:
 *   1. Layer-by-layer BFS. For each node, record BFS distance and ALL parents that
 *      first reach it at that distance (multi-parent BFS). A node's parents are only
 *      recorded in the layer where the node is first discovered; later arrivals via
 *      longer paths are ignored.
 *   2. Once the layer that first contains `end` is fully expanded, stop BFS. No
 *      shorter paths can appear in subsequent layers.
 *   3. Backtrack from `end` through the parents map with an iterative DFS to
 *      reconstruct all shortest paths. Collection stops early when `cap` paths are
 *      gathered, preventing exponential blowup on highly-connected graphs.
 *
 * Returns [] for invalid/unknown words or unreachable pairs.
 * Returns [[start]] when start === end.
 * All words in returned paths are lowercase.
 *
 * @param start  Starting word (case-insensitive).
 * @param end    Target word (case-insensitive).
 * @param dict   The dictionary to search within.
 * @param cap    Maximum number of paths to return (default 20).
 */
export function enumerateShortestPaths(
  start: string,
  end: string,
  dict: Dictionary,
  cap = 20,
): string[][] {
  const s = start.toLowerCase();
  const e = end.toLowerCase();

  if (!dict.has(s) || !dict.has(e)) return [];
  if (s === e) return [[s]];

  // dist[word] = BFS layer at which this word was first reached.
  const dist = new Map<string, number>();
  dist.set(s, 0);

  // parents[word] = set of words that are valid shortest-path predecessors of word.
  const parents = new Map<string, Set<string>>();

  // BFS frontier: list of nodes in the current layer.
  let currentLayer: string[] = [s];
  let foundLayer = -1;

  while (currentLayer.length > 0 && foundLayer === -1) {
    const nextLayer: string[] = [];
    const nextLayerSet = new Set<string>();

    for (const node of currentLayer) {
      const nodeDepth = dist.get(node) as number;

      for (const nb of getNeighbors(node, dict)) {
        if (!dist.has(nb)) {
          // First time we see this neighbour: record distance and parent.
          dist.set(nb, nodeDepth + 1);
          parents.set(nb, new Set([node]));
          if (!nextLayerSet.has(nb)) {
            nextLayerSet.add(nb);
            nextLayer.push(nb);
          }
          if (nb === e) foundLayer = nodeDepth + 1;
        } else if (dist.get(nb) === nodeDepth + 1) {
          // Same layer as the first discovery: another valid shortest parent.
          parents.get(nb)!.add(node);
        }
        // dist.get(nb) < nodeDepth + 1 means a shorter path already exists;
        // do not add this node as a parent (would create a longer route).
      }
    }

    currentLayer = nextLayer;
  }

  if (foundLayer === -1) return [];

  // Backtrack: iterative DFS from `e` following parents in reverse.
  // Stack entries: [currentWord, partialPathFromEnd].
  const results: string[][] = [];
  const stack: [string, string[]][] = [[e, [e]]];

  while (stack.length > 0 && results.length < cap) {
    const [node, pathFromEnd] = stack.pop() as [string, string[]];

    if (node === s) {
      results.push(pathFromEnd.slice().reverse());
      continue;
    }

    const pSet = parents.get(node);
    if (!pSet) continue;

    for (const parent of pSet) {
      if (results.length >= cap) break;
      stack.push([parent, pathFromEnd.concat(parent)]);
    }
  }

  return results;
}

/**
 * BFS flood outward from `target` across the whole dictionary graph.
 * Returns a map of word to shortest number of steps to reach `target`
 * for every word reachable from `target`. The target itself maps to 0.
 * Words unreachable from target are absent from the map.
 * If target is not in dict, returns an empty Map.
 */
export function computeDistances(
  target: string,
  dict: Dictionary,
): Map<string, number> {
  const t = target.toLowerCase();
  const dist = new Map<string, number>();
  if (!dict.has(t)) return dist;
  dist.set(t, 0);
  let frontier = [t];
  let depth = 0;
  while (frontier.length > 0) {
    depth++;
    const next: string[] = [];
    for (const node of frontier) {
      for (const nb of getNeighbors(node, dict)) {
        if (!dist.has(nb)) {
          dist.set(nb, depth);
          next.push(nb);
        }
      }
    }
    frontier = next;
  }
  return dist;
}
