import { describe, expect, it } from "vitest";
import {
  POINTS_PER_PLAY, WIN_SCORE, expandSequence, formatTime, hasWon,
  playSummary, scoreAfterPlay,
} from "./loop-game";

describe("loop game", () => {
  it("repeats the sequence in order the selected number of times", () => {
    expect(expandSequence(["clap", "spin"], 3)).toEqual(["clap", "spin", "clap", "spin", "clap", "spin"]);
  });
  it("formats timer", () => {
    expect(formatTime(293)).toBe("04:53");
  });
  it("awards 25 points for one completed play", () => {
    expect(scoreAfterPlay(0)).toBe(25);
    expect(scoreAfterPlay(50)).toBe(75);
  });
  it("never scores past the 100 point goal", () => {
    expect(scoreAfterPlay(90)).toBe(WIN_SCORE);
    expect(scoreAfterPlay(WIN_SCORE)).toBe(WIN_SCORE);
  });
  it("counts the win only at the goal", () => {
    expect(hasWon(75)).toBe(false);
    expect(hasWon(WIN_SCORE)).toBe(true);
  });
  it("summarises the loop shown on the score card", () => {
    expect(playSummary(["clap", "wave"], 2)).toEqual({
      moves: 2, loops: 2, steps: 4, points: POINTS_PER_PLAY,
    });
  });
});
