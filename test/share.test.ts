import { describe, it, expect } from "vitest";
import { shareText } from "../site/share.js";

describe("shareText", () => {
  it("renders one green/white row per word, matching the goal by position", () => {
    const text = shareText({
      puzzle: 1,
      path: ["word", "bord", "burd", "bund", "rund", "rung"],
      goal: "rung",
      par: 5,
      url: "https://chriscuber123.github.io/rungle/",
    });
    expect(text).toBe(
      [
        "RUNGLE #1 5/5",
        "⬜⬜⬜⬜",
        "⬜⬜⬜⬜",
        "⬜🟩⬜⬜",
        "⬜🟩🟩⬜",
        "🟩🟩🟩⬜",
        "🟩🟩🟩🟩",
        "",
        "https://chriscuber123.github.io/rungle/",
      ].join("\n")
    );
  });

  it("shows steps over par when the climb is longer than par", () => {
    const text = shareText({ puzzle: 7, path: ["a", "b", "c"], goal: "z", par: 1, url: "u" });
    expect(text.split("\n")[0]).toBe("RUNGLE #7 2/1");
  });
});
