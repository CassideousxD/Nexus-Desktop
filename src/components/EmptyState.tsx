import { motion } from "motion/react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-2 py-6 text-center"
    >
      <svg viewBox="0 0 64 28" className="h-7 w-28 opacity-60" aria-hidden>
        <g stroke="var(--muted-foreground)" strokeWidth="0.6" opacity="0.6">
          <line x1="10" y1="14" x2="26" y2="8" />
          <line x1="26" y1="8" x2="42" y2="18" />
          <line x1="42" y1="18" x2="54" y2="11" />
          <line x1="26" y1="8" x2="30" y2="22" />
        </g>
        <g fill="var(--muted-foreground)">
          <circle cx="10" cy="14" r="1.4" />
          <circle cx="26" cy="8" r="1.8" />
          <circle cx="42" cy="18" r="1.4" />
          <circle cx="54" cy="11" r="1.2" />
          <circle cx="30" cy="22" r="1.2" />
        </g>
      </svg>
      <p className="text-sm font-medium text-foreground">Search across your files instantly</p>
      <p className="text-[13px] text-muted-foreground">
        Find documents by meaning, not just filenames.
      </p>
    </motion.div>
  );
}
