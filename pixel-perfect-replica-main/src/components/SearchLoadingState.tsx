import { motion } from "motion/react";

export function SearchLoadingState() {
  return (
    <div className="space-y-2.5">
      <p className="px-1 text-[13px] text-muted-foreground">Searching your files...</p>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="shimmer rounded-xl border border-border bg-surface px-4 py-3.5"
        >
          <div className="flex items-start gap-3.5">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-surface-raised" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/2 rounded bg-surface-raised" />
              <div className="h-3 w-full rounded bg-surface-raised" />
              <div className="h-2.5 w-1/3 rounded bg-surface-raised" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
