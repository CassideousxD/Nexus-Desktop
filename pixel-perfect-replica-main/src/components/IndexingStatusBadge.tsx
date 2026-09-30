import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { useState } from "react";
import type { IndexingStatus } from "@/types";

export function IndexingStatusBadge({ status }: { status: IndexingStatus }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((status.processed / status.total) * 100);

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute bottom-10 right-0 w-64 rounded-xl border border-border bg-popover p-3.5 shadow-card-hover"
          >
            <p className="text-[13px] font-medium text-foreground">
              {status.done ? "Index up to date" : "Indexing files"}
            </p>
            <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-surface-raised">
              <motion.div
                className="h-full rounded-full bg-brand"
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
              />
            </div>
            <dl className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <dt>Processed</dt>
                <dd className="font-mono text-foreground">
                  {status.processed} / {status.total}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Current folder</dt>
                <dd className="truncate font-mono">{status.currentFolder}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd>{status.done ? "Idle" : "Running in background"}</dd>
              </div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.1 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface/80 px-2.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
      >
        {status.done ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-brand"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className="font-mono">
          {status.done
            ? `Indexed ${status.total} files`
            : `Indexing ${status.processed} / ${status.total}`}
        </span>
      </motion.button>
    </div>
  );
}
