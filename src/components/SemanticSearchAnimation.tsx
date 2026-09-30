import { motion } from "motion/react";
import { useMemo } from "react";

export type SearchPhase = "idle" | "focused" | "typing" | "searching" | "results";

interface Node {
  id: number;
  x: number;
  y: number;
  r: number;
  delay: number;
  duration: number;
}

const NODE_COUNT = 22;
const CENTER = { x: 50, y: 46 };

// Deterministic pseudo-random so SSR and client agree.
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

function rand(seed: number) {
  const v = Math.sin(seed * 127.1) * 43758.5453;
  return round(v - Math.floor(v));
}

export function SemanticSearchAnimation({ phase }: { phase: SearchPhase }) {
  const nodes = useMemo<Node[]>(
    () =>
      Array.from({ length: NODE_COUNT }, (_, i) => ({
        id: i,
        x: 6 + rand(i + 1) * 88,
        y: 8 + rand(i + 11) * 80,
        r: 0.35 + rand(i + 23) * 0.5,
        delay: rand(i + 31) * 4,
        duration: 9 + rand(i + 43) * 9,
      })),
    [],
  );

  const links = useMemo(() => {
    const pairs: Array<[Node, Node]> = [];
    nodes.forEach((a, i) => {
      nodes.slice(i + 1).forEach((b) => {
        if (Math.hypot(a.x - b.x, a.y - b.y) < 20) pairs.push([a, b]);
      });
    });
    return pairs.slice(0, 26);
  }, [nodes]);

  const intensity =
    phase === "idle" ? 0.35 : phase === "focused" ? 0.6 : phase === "typing" ? 0.8 : phase === "searching" ? 1 : 0.45;

  // How strongly nodes are pulled toward the search center.
  const pull = phase === "idle" ? 0 : phase === "focused" ? 0.08 : phase === "typing" ? 0.18 : phase === "searching" ? 0.3 : 0.06;

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      animate={{ opacity: intensity }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <g stroke="var(--brand)" strokeWidth={0.08}>
        {links.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={round(a.x + (CENTER.x - a.x) * pull)}
            y1={round(a.y + (CENTER.y - a.y) * pull)}
            x2={round(b.x + (CENTER.x - b.x) * pull)}
            y2={round(b.y + (CENTER.y - b.y) * pull)}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{
              duration: 7 + (i % 5),
              delay: (i % 7) * 0.9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </g>

      {nodes.map((n) => {
        const tx = round(n.x + (CENTER.x - n.x) * pull);
        const ty = round(n.y + (CENTER.y - n.y) * pull);
        return (
          <motion.circle
            key={n.id}
            r={n.r}
            fill="var(--foreground)"
            fillOpacity={0.5}
            animate={{
              cx: [tx, tx + (rand(n.id + 3) - 0.5) * 4, tx],
              cy: [ty, ty + (rand(n.id + 5) - 0.5) * 4, ty],
            }}
            transition={{
              cx: { duration: n.duration, delay: n.delay, repeat: Infinity, ease: "easeInOut" },
              cy: { duration: n.duration * 1.2, delay: n.delay, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        );
      })}

      {/* abstract file glyphs */}
      {[0, 1, 2, 3].map((i) => {
        const x = 12 + rand(i + 71) * 74;
        const y = 12 + rand(i + 83) * 70;
        return (
          <motion.rect
            key={`f-${i}`}
            x={x + (CENTER.x - x) * pull}
            y={y + (CENTER.y - y) * pull}
            width={1.6}
            height={2.1}
            rx={0.3}
            fill="none"
            stroke="var(--brand)"
            strokeWidth={0.12}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 10, delay: i * 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}

      <motion.circle
        cx={CENTER.x}
        cy={CENTER.y}
        fill="var(--brand)"
        animate={{
          r: phase === "searching" ? [0.9, 1.6, 0.9] : 0.7,
          opacity: phase === "idle" ? 0.15 : 0.5,
        }}
        transition={{ duration: 1.6, repeat: phase === "searching" ? Infinity : 0, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}
