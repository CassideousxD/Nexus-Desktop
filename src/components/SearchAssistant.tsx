import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import type { SearchPhase } from "@/components/SemanticSearchAnimation";

export type CatMood = "neutral" | "attentive" | "happy" | "confused";

interface Spot {
  x: number; // % of container width
  y: number; // % of container height
}

const IDLE_SPOTS: Spot[] = [
  { x: 16, y: 64 },
  { x: 26, y: 72 },
  { x: 20, y: 56 },
  { x: 12, y: 70 },
];

const SEARCH_NODES: Spot[] = [
  { x: 22, y: 28 },
  { x: 70, y: 22 },
  { x: 78, y: 60 },
  { x: 38, y: 74 },
  { x: 56, y: 38 },
];

const FOUND_SPOT: Spot = { x: 70, y: 22 };
const CENTER: Spot = { x: 46, y: 58 };

/**
 * The Nexus search assistant — a small, monochrome cat with an accent tie.
 * Lives inside the background search environment and reacts to the search
 * phase: wanders when idle, traverses file nodes while searching, celebrates
 * briefly on a match, and tilts its head when nothing is found.
 */
export function SearchAssistant({
  phase,
  found,
}: {
  phase: SearchPhase;
  /** null = no completed search yet; true = matches; false = no matches */
  found: boolean | null;
}) {
  const [spot, setSpot] = useState<Spot>(IDLE_SPOTS[0]!);
  const [mood, setMood] = useState<CatMood>("neutral");
  const [flip, setFlip] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clear = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    clear();

    if (phase === "searching") {
      setMood("attentive");
      let i = 0;
      const step = () => {
        setSpot((prev) => {
          const next = SEARCH_NODES[i % SEARCH_NODES.length]!;
          setFlip(next.x < prev.x);
          i += 1;
          return next;
        });
        timers.current.push(setTimeout(step, 850));
      };
      step();
      return clear;
    }

    if (phase === "results") {
      if (found) {
        setSpot((prev) => {
          setFlip(FOUND_SPOT.x < prev.x);
          return FOUND_SPOT;
        });
        setMood("happy");
        timers.current.push(setTimeout(() => setMood("neutral"), 700));
      } else {
        setMood("confused");
        timers.current.push(
          setTimeout(() => {
            setMood("neutral");
            setSpot(CENTER);
          }, 1400),
        );
      }
      return clear;
    }

    if (phase === "typing" || phase === "focused") {
      setMood("attentive");
      return clear;
    }

    // idle — slow wander with long rests
    setMood("neutral");
    let i = 0;
    const wander = () => {
      setSpot((prev) => {
        const next = IDLE_SPOTS[i % IDLE_SPOTS.length]!;
        setFlip(next.x < prev.x);
        i += 1;
        return next;
      });
      timers.current.push(setTimeout(wander, 4200));
    };
    timers.current.push(setTimeout(wander, 1800));
    return clear;
  }, [phase, found]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-[5] h-11 w-11 text-foreground"
      animate={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        opacity: phase === "idle" ? 0.55 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 55, damping: 16, mass: 1.1 }}
      style={{ translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div animate={{ scaleX: flip ? -1 : 1 }} transition={{ duration: 0.3 }}>
        <CatFigure mood={mood} />
      </motion.div>
    </motion.div>
  );
}

/**
 * Minimal vector cat. Monochrome (currentColor) with an accent tie.
 * Also used by the boot sequence.
 */
export function CatFigure({ mood }: { mood: CatMood }) {
  const happy = mood === "happy";
  const confused = mood === "confused";

  return (
    <svg viewBox="0 0 48 48" className="h-full w-full overflow-visible">
      {/* tail */}
      <motion.path
        d="M12 36 Q4 33 6 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        animate={happy ? { rotate: [0, -14, 6, -10, 0] } : { rotate: 0 }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
        style={{ originX: "12px", originY: "36px" }}
      />
      {/* body */}
      <ellipse cx="25" cy="33" rx="10" ry="9" fill="currentColor" />
      {/* head */}
      <motion.g
        animate={{ rotate: confused ? 10 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        style={{ originX: "25px", originY: "22px" }}
      >
        <circle cx="25" cy="16" r="8.5" fill="currentColor" />
        {/* ears */}
        <motion.path
          d="M18 11 L19.5 3.5 L24 9 Z"
          fill="currentColor"
          animate={happy ? { rotate: [0, -8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
          style={{ originX: "21px", originY: "10px" }}
        />
        <motion.path
          d="M32 11 L30.5 3.5 L26 9 Z"
          fill="currentColor"
          animate={happy ? { rotate: [0, 8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
          style={{ originX: "29px", originY: "10px" }}
        />
        {/* eyes — neutral dots */}
        <motion.g animate={{ opacity: happy ? 0 : 1 }} transition={{ duration: 0.15 }}>
          <circle cx="22" cy="15.5" r="1.1" fill="var(--background)" />
          <circle cx="28" cy="15.5" r="1.1" fill="var(--background)" />
        </motion.g>
        {/* eyes — happy arcs */}
        <motion.g
          animate={{ opacity: happy ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          stroke="var(--background)"
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
        >
          <path d="M20.6 16 Q22 14.4 23.4 16" />
          <path d="M26.6 16 Q28 14.4 29.4 16" />
        </motion.g>
        {/* smile */}
        <motion.path
          d="M23 19.5 Q25 21 27 19.5"
          fill="none"
          stroke="var(--background)"
          strokeWidth={1}
          strokeLinecap="round"
          animate={{ opacity: happy ? 1 : 0.35 }}
        />
      </motion.g>
      {/* tie */}
      <motion.path
        d="M25 24.5 L22.4 27.2 L25 35 L27.6 27.2 Z"
        fill="var(--brand)"
        animate={happy ? { rotate: [0, -6, 5, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ originX: "25px", originY: "24.5px" }}
      />
      <circle cx="25" cy="24.6" r="1.4" fill="var(--brand)" />
    </svg>
  );
}
