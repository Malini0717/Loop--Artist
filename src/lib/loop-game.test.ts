import { describe, expect, it } from "vitest";
import { expandSequence, formatTime } from "./loop-game";

describe("loop game", () => {
  it("repeats the sequence in order the selected number of times", () => {
    expect(expandSequence(["clap", "spin"], 3)).toEqual(["clap", "spin", "clap", "spin", "clap", "spin"]);
  });
  it("formats timer", () => {
    expect(formatTime(293)).toBe("04:53");
  });
});
