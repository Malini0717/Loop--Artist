import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Star, Volume2, VolumeX, RotateCcw, Maximize, HelpCircle, Play, Square, X } from "lucide-react";
import robot from "@/assets/robot.webp";
import logo from "@/assets/logo.webp";
import {
  ACTIONS, ACTION_MS, GAME_SECONDS, MAX_SEQUENCE, POINTS_PER_PLAY, WIN_SCORE,
  expandSequence, formatTime, type ActionId,
} from "@/lib/loop-game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loop Artist – Grade 2 Coding Game" },
      { name: "description", content: "Build a sequence of robot dance moves, loop it, and press Play." },
      { property: "og:title", content: "Loop Artist – Grade 2 Coding Game" },
      { property: "og:description", content: "Build a sequence of robot dance moves, loop it, and press Play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ACT_BG: Record<ActionId, string> = {
  clap: "bg-act-clap", spin: "bg-act-spin", jump: "bg-act-jump", wave: "bg-act-wave",
};
const ACT_ANIM: Record<ActionId, string> = {
  clap: "anim-clap", spin: "anim-spin", jump: "anim-jump", wave: "anim-wave",
};

function Index() {
  const [started, setStarted] = useState(false);
  return started ? <Game /> : <Intro onStart={() => setStarted(true)} />;
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <main className="bg-intro flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <img src={logo} alt="" width={180} height={180} className="h-40 w-40 object-contain" />
      <h1 className="mt-12 text-5xl font-extrabold text-foreground">Loop Artist</h1>
      <p className="mt-2 text-xs font-bold tracking-[0.3em] text-grade">GRADE 2</p>
      <p className="mt-5 max-w-md text-base font-semibold leading-relaxed text-muted-foreground">
        Tap colored action blocks to build a sequence, choose how many times to loop it, then press Play!
      </p>
      <button onClick={onStart}
        className="mt-8 inline-flex h-20 items-center gap-3 rounded-full bg-cta px-12 text-lg font-extrabold tracking-wide text-primary-foreground shadow-[0_14px_30px_-8px] shadow-cta/60 transition hover:brightness-105 active:scale-95">
        <Play className="h-6 w-6 fill-current" /> START ACTIVITY
      </button>
    </main>
  );
}

function Thumb({ size = 24 }: { size?: number }) {
  return <img src={robot} alt="" width={size} height={size} style={{ width: size, height: size }} className="object-contain" />;
}

function Game() {
  const [seq, setSeq] = useState<ActionId[]>([]);
  const [repeat, setRepeat] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<{ id: ActionId; key: number; idx: number } | null>(null);
  const [time, setTime] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [help, setHelp] = useState(false);
  const [done, setDone] = useState<null | "win" | "time">(null);
  const runId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => setTime((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [done]);
  useEffect(() => { if (time === 0 && !done) setDone("time"); }, [time, done]);

  const stop = useCallback(() => {
    runId.current++;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
    setCurrent(null);
  }, []);

  const play = () => {
    if (playing || seq.length === 0 || done) return;
    const steps = expandSequence(seq, repeat);
    const id = ++runId.current;
    setPlaying(true);
    steps.forEach((a, i) => {
      timers.current.push(window.setTimeout(() => {
        if (runId.current !== id) return;
        setCurrent({ id: a, key: Date.now() + i, idx: i % seq.length });
      }, i * (ACTION_MS + 150)));
    });
    timers.current.push(window.setTimeout(() => {
      if (runId.current !== id) return;
      setPlaying(false); setCurrent(null); timers.current = [];
      setScore((s) => {
        const n = Math.min(WIN_SCORE, s + POINTS_PER_PLAY);
        if (n >= WIN_SCORE) setDone("win");
        return n;
      });
    }, steps.length * (ACTION_MS + 150)));
  };

  const reset = () => {
    stop(); setSeq([]); setRepeat(1); setScore(0); setTime(GAME_SECONDS); setDone(null);
  };

  useEffect(() => () => stop(), [stop]);

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-[52px] shrink-0 items-center justify-between bg-header px-5 text-header-foreground">
        <div className="flex w-1/3 items-center gap-2">
          <img src={logo} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <span className="text-lg font-extrabold">Loop Artist</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-header-foreground/10 bg-chip px-3">
            <Clock className="h-4 w-4 opacity-80" />
            <div className="leading-none">
              <div className="text-[9px] font-bold tracking-wider opacity-60">TIMING</div>
              <div className="font-mono text-sm font-bold">{formatTime(time)}</div>
            </div>
          </div>
          <div className="mx-1 h-6 w-px bg-header-foreground/15" />
          <div className="flex h-10 items-center gap-2 rounded-lg border border-header-foreground/10 bg-chip px-3">
            <Star className="h-4 w-4 fill-act-jump text-act-jump" />
            <div className="leading-none">
              <div className="text-[9px] font-bold tracking-wider opacity-60">SCORE</div>
              <div className="font-mono text-sm font-bold">{score}</div>
            </div>
          </div>
        </div>
        <div className="flex w-1/3 items-center justify-end gap-5 opacity-80">
          <button aria-label="Sound" onClick={() => setMuted((m) => !m)}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
          <button aria-label="Reset" onClick={reset}><RotateCcw className="h-4 w-4" /></button>
          <button aria-label="Fullscreen" onClick={fullscreen}><Maximize className="h-4 w-4" /></button>
          <button aria-label="Help" onClick={() => setHelp(true)}><HelpCircle className="h-4 w-4" /></button>
        </div>
      </header>

      {/* Stage */}
      <section className="bg-stage relative flex flex-1 flex-col items-center justify-center">
        <div className="h-6">
          {current && (
            <span key={current.key} className="anim-pop inline-block rounded-full bg-card/60 px-3 py-0.5 text-[10px] font-extrabold tracking-widest text-grade">
              {current.id.toUpperCase()}!
            </span>
          )}
        </div>
        <div className="relative mt-3">
          <div className="bg-spotlight absolute -bottom-12 left-1/2 h-16 w-[520px] max-w-[90vw] -translate-x-1/2 blur-md" />
          <div key={current?.key ?? "idle"} className={current ? ACT_ANIM[current.id] : "anim-idle"}>
            <img src={robot} alt="Robot" width={512} height={512} className="relative h-[26vh] max-h-[290px] min-h-[150px] w-auto object-contain drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Control panel */}
      <section className="-mt-4 shrink-0 rounded-t-3xl border-t border-card bg-card/90 px-4 pb-4 pt-3 backdrop-blur">
        <div className="flex justify-center gap-3">
          {ACTIONS.map((a) => (
            <button key={a.id} disabled={playing || seq.length >= MAX_SEQUENCE}
              onClick={() => setSeq((s) => [...s, a.id])}
              className={`${ACT_BG[a.id]} flex h-[46px] w-[46px] flex-col items-center justify-center rounded-lg text-[8px] font-bold text-primary-foreground shadow-md transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50`}>
              <Thumb size={24} />{a.label}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-2 flex max-w-[620px] flex-wrap items-center justify-center gap-3">
          <div className="flex h-[54px] min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-xl border-2 border-seq-border bg-seq-bg px-1.5">
            {seq.length === 0 && (
              <span className="w-full text-center text-xs font-semibold text-muted-foreground">Tap action blocks above to build your sequence</span>
            )}
            {seq.map((a, i) => (
              <div key={i} className={`${ACT_BG[a]} anim-pop relative flex h-[42px] w-[60px] shrink-0 flex-col items-center justify-center rounded-md text-[8px] font-extrabold text-primary-foreground shadow ${playing && current?.idx === i ? "ring-2 ring-foreground" : ""} ${playing && current?.idx !== i ? "opacity-50" : ""}`}>
                <Thumb size={22} />{a.toUpperCase()}
                {!playing && (
                  <button aria-label="Remove" onClick={() => setSeq((s) => s.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    <X className="h-2.5 w-2.5" strokeWidth={3} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex h-[30px] items-center gap-1 rounded-lg border border-seq-border bg-repeat-bg px-2">
            <span className="mr-1 text-[8px] font-extrabold text-repeat">REPEAT:</span>
            {[1, 2, 3, 4].map((n) => (
              <button key={n} disabled={playing} onClick={() => setRepeat(n)}
                className={`h-5 w-5 rounded text-[10px] font-bold ${repeat === n ? "bg-repeat text-primary-foreground" : "text-foreground hover:bg-card"}`}>
                {n}
              </button>
            ))}
          </div>
          {playing ? (
            <button onClick={stop} className="flex h-[28px] items-center gap-1.5 rounded-lg bg-stop px-4 text-xs font-extrabold text-primary-foreground shadow-md">
              <Square className="h-3 w-3 fill-current" /> STOP
            </button>
          ) : (
            <button onClick={play} disabled={seq.length === 0}
              className="flex h-[28px] items-center gap-1.5 rounded-lg bg-play px-4 text-xs font-extrabold text-primary-foreground shadow-md disabled:opacity-50">
              <Play className="h-3 w-3 fill-current" /> PLAY
            </button>
          )}
        </div>
      </section>

      {help && (
        <Modal onClose={() => setHelp(false)}>
          <h2 className="text-2xl font-extrabold">How to play</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-left text-sm font-semibold text-muted-foreground">
            <li>Tap the colored action blocks to add moves to your sequence.</li>
            <li>Tap the red ✕ on a block to remove it.</li>
            <li>Choose how many times to repeat (1–4).</li>
            <li>Press Play to watch the robot dance. Stop interrupts it.</li>
            <li>Each completed loop earns {POINTS_PER_PLAY} points. Reach {WIN_SCORE} to win!</li>
          </ol>
          <button onClick={() => setHelp(false)} className="mt-5 rounded-full bg-cta px-8 py-2 font-extrabold text-primary-foreground">GOT IT</button>
        </Modal>
      )}
      {done && (
        <Modal>
          <img src={robot} alt="" width={120} height={120} className="anim-jump mx-auto h-28 w-28 object-contain" />
          <h2 className="mt-2 text-3xl font-extrabold">{done === "win" ? "Great Job!" : "Time's Up!"}</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {done === "win" ? "You're a true Loop Artist!" : "Nice try — play again!"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1 font-extrabold">
            <Star className="h-4 w-4 fill-act-jump text-act-jump" /> {score}
          </div>
          <div><button onClick={reset} className="mt-5 rounded-full bg-cta px-8 py-2 font-extrabold text-primary-foreground">PLAY AGAIN</button></div>
        </Modal>
      )}
    </main>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="anim-pop w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
