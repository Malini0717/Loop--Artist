export type ActionId = "clap" | "spin" | "jump" | "wave";

export const ACTIONS: { id: ActionId; label: string }[] = [
  { id: "clap", label: "Clap" },
  { id: "spin", label: "Spin" },
  { id: "jump", label: "Jump" },
  { id: "wave", label: "Wave" },
];

export const ACTION_MS = 1000;
export const GAME_SECONDS = 300;
export const POINTS_PER_PLAY = 25;
export const WIN_SCORE = 100;
export const MAX_SEQUENCE = 8;

/** What the score card shows once a play (or the timer) has finished. */
export type PlayResult = {
  kind: "play" | "win" | "time";
  points: number;
  total: number;
  moves: number;
  loops: number;
  steps: number;
};

/** Flatten a sequence into the ordered list of steps the robot performs. */
export function expandSequence(seq: ActionId[], repeat: number): ActionId[] {
  const out: ActionId[] = [];
  for (let r = 0; r < repeat; r++) out.push(...seq);
  return out;
}

/** Score after one completed play: +POINTS_PER_PLAY, never past WIN_SCORE. */
export function scoreAfterPlay(score: number): number {
  return Math.min(WIN_SCORE, score + POINTS_PER_PLAY);
}

export function hasWon(score: number): boolean {
  return score >= WIN_SCORE;
}

/** The numbers printed on the score card for one finished play. */
export function playSummary(seq: ActionId[], repeat: number) {
  return {
    moves: seq.length,
    loops: repeat,
    steps: seq.length * repeat,
    points: POINTS_PER_PLAY,
  };
}

export function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
