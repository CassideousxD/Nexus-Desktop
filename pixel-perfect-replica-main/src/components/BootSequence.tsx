import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

// ─── LED panel constants ─────────────────────────────────────────────────────
const COLS = 30;
const ROWS = 10;
const LEFT = 9;   // left eye column centre
const RIGHT = 20; // right eye column centre

type Pattern = Set<number>;
const key = (c: number, r: number) => r * COLS + c;

function stamp(set: Pattern, cx: number, rows: string[], top: number) {
  rows.forEach((line, r) => {
    const w = line.length;
    const x0 = cx - Math.floor(w / 2);
    [...line].forEach((ch, c) => {
      if (ch === "#") {
        const x = x0 + c;
        const y = top + r;
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) set.add(key(x, y));
      }
    });
  });
}

// ─── Eye shapes ───────────────────────────────────────────────────────────────
const OPEN   = [".####.", "######", "######", "######", ".####."];
const HALF   = ["######", "######", ".####."];
const CLOSED = [".####."];

/** Both eyes in the same shape, centred in top rows of the panel. */
function bothEyes(shape: string[], top: number): Pattern {
  const s: Pattern = new Set();
  stamp(s, LEFT,  shape, top);
  stamp(s, RIGHT, shape, top);
  return s;
}

/**
 * Asymmetric wink: one eye stays OPEN, the other squeezes shut.
 * closedSide = which eye winks.
 * squeeze = how far closed.
 */
function winkPattern(closedSide: "left" | "right", squeeze: "half" | "closed"): Pattern {
  const s: Pattern = new Set();
  const closedShape = squeeze === "half" ? HALF : CLOSED;
  const closedTop   = squeeze === "half" ? 4    : 5;
  if (closedSide === "right") {
    stamp(s, LEFT,  OPEN,        2);
    stamp(s, RIGHT, closedShape, closedTop);
  } else {
    stamp(s, LEFT,  closedShape, closedTop);
    stamp(s, RIGHT, OPEN,        2);
  }
  return s;
}

// ─── 5×5 pixel font for "NEXUS" ──────────────────────────────────────────────
// Each letter is exactly 5 columns wide, 5 rows tall.
const FONT: Record<string, string[]> = {
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#"],
  E: ["#####", "#....", "####.", "#....", "#####"],
  X: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  U: ["#...#", "#...#", "#...#", "#...#", ".###."],
  S: [".####", "#....", ".###.", "....#", "####."],
};

const LETTERS = ["N", "E", "X", "U", "S"] as const;
const LETTER_W = 5;
const LETTER_GAP = 1;
const NEXUS_TOTAL_W = LETTERS.length * LETTER_W + (LETTERS.length - 1) * LETTER_GAP; // = 29
const NEXUS_START_COL = Math.floor((COLS - NEXUS_TOTAL_W) / 2); // = 0 (centred)
const NEXUS_START_ROW = Math.floor((ROWS - 5) / 2);             // = 2 (centred vertically)

/** Pattern for the first `count` letters of NEXUS, centred in the panel. */
function nexusPattern(count: number): Pattern {
  const s: Pattern = new Set();
  let col = NEXUS_START_COL;
  for (let li = 0; li < count; li++) {
    const glyph = FONT[LETTERS[li]!]!;
    glyph.forEach((line, r) => {
      [...line].forEach((px, c) => {
        if (px === "#") {
          const x = col + c;
          const y = NEXUS_START_ROW + r;
          if (x >= 0 && x < COLS && y >= 0 && y < ROWS) s.add(key(x, y));
        }
      });
    });
    col += LETTER_W + LETTER_GAP;
  }
  return s;
}

// ─── Animation timeline ───────────────────────────────────────────────────────
//   0 ms  │ dark screen
// 300 ms  │ LED panel springs in — both eyes open         (EYES PHASE)
// 900 ms  │ right eye goes half-closed  (wink starts)
// 1050 ms │ right eye fully closed
// 1250 ms │ right eye half-open again
// 1400 ms │ right eye fully open  (wink done)
// 1700 ms │ eyes clear — panel transitions to TEXT PHASE
// 1900 ms │ N lights up
// 2060 ms │ NE
// 2220 ms │ NEX
// 2380 ms │ NEXU
// 2540 ms │ NEXUS — fully typed
// 2700 ms │ wordmark "NEXUS" fades in below the panel
// ≥3200 ms│ BOOT_MIN_MS in index.tsx lets the app open

type EyeState = "open" | "wink-half" | "wink-closed" | "wink-half-open";

/**
 * Full-screen boot animation.
 * Eyes pop up → right eye winks at the user → LED panel types "NEXUS" → overlay lifts.
 * App initialization runs in parallel in the parent; this is purely visual.
 */
export function BootSequence() {
  const [panelVisible, setPanelVisible] = useState(false);
  const [phase, setPhase]               = useState<"eyes" | "text">("eyes");
  const [eyeState, setEyeState]         = useState<EyeState>("open");
  const [letterCount, setLetterCount]   = useState(0);
  const [showWordmark, setShowWordmark] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    // Panel springs in with eyes open
    t(300,  () => setPanelVisible(true));

    // Wink sequence — right eye squeezes shut then reopens
    t(900,  () => setEyeState("wink-half"));
    t(1050, () => setEyeState("wink-closed"));
    t(1250, () => setEyeState("wink-half-open"));
    t(1400, () => setEyeState("open"));

    // Transition: clear eyes → start typing NEXUS
    t(1700, () => setPhase("text"));

    // Type each letter
    LETTERS.forEach((_, i) => t(1900 + i * 160, () => setLetterCount(i + 1)));

    // Wordmark appears after last letter
    t(1900 + LETTERS.length * 160 + 160, () => setShowWordmark(true));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Compute the LED pattern for the current moment
  const pattern: Pattern = useMemo(() => {
    if (!panelVisible) return new Set();
    if (phase === "text") return nexusPattern(letterCount);
    switch (eyeState) {
      case "open":           return bothEyes(OPEN,   2);
      case "wink-half":      return winkPattern("right", "half");
      case "wink-closed":    return winkPattern("right", "closed");
      case "wink-half-open": return winkPattern("right", "half");
    }
  }, [panelVisible, phase, eyeState, letterCount]);

  const cells    = useMemo(() => Array.from({ length: COLS * ROWS }, (_, i) => i), []);
  const ledColor = phase === "text" ? "var(--led-found)" : "var(--led-idle)";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      {/* Ambient particles */}
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-foreground"
          style={{ left: `${10 + ((i * 41) % 80)}%`, top: `${15 + ((i * 57) % 70)}%` }}
          animate={{ opacity: [0.04, 0.18, 0.04] }}
          transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.35 }}
        />
      ))}

      {/* LED Panel — mounts once, stays mounted for both phases */}
      <AnimatePresence>
        {panelVisible && (
          <motion.div
            key="panel"
            role="img"
            aria-label="Nexus booting"
            initial={{ opacity: 0, scale: 0.78, y: 28, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1,    y: 0,  filter: "blur(0px)"  }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
            className="mx-auto w-[min(72vw,280px)] rounded-2xl border border-border p-3 sm:w-[300px]"
            style={{
              background: "var(--led-panel)",
              boxShadow: `inset 0 1px 0 color-mix(in oklab, white 5%, transparent),
                          0 20px 60px -18px color-mix(in oklab, ${ledColor} 55%, transparent)`,
              transition: "box-shadow 700ms ease",
            }}
          >
            <div
              className="grid gap-[1.5px]"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {cells.map((i) => {
                const on = pattern.has(i);
                return (
                  <span
                    key={i}
                    className="aspect-square rounded-[1.5px]"
                    style={{
                      background: on ? ledColor : "var(--led-off)",
                      opacity:    on ? 1 : 0.28,
                      boxShadow:  on ? `0 0 4px ${ledColor}` : "none",
                      transition: "background 100ms ease, opacity 180ms ease, box-shadow 180ms ease",
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "NEXUS" wordmark below the panel */}
      <AnimatePresence>
        {showWordmark && (
          <motion.p
            key="wordmark"
            initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-[13px] font-semibold tracking-[0.45em] text-muted-foreground"
          >
            NEXUS
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
