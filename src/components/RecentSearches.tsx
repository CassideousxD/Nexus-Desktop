import { AnimatePresence, motion } from "motion/react";
import { Clock, Search, X } from "lucide-react";

interface Props {
  open: boolean;
  searches: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
  onClose: () => void;
}

/**
 * Recent Searches — a lightweight history utility panel on the left edge.
 * Not navigation: clicking an entry drops the query into the search bar
 * and executes it.
 */
export function RecentSearches({ open, searches, onSelect, onClear, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-5 top-16 z-20 w-56 rounded-xl border border-border bg-surface p-3 shadow-card"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Recent Searches
            </span>
            <button
              onClick={onClose}
              aria-label="Close recent searches"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {searches.length === 0 ? (
            <p className="px-1 py-3 text-[13px] text-muted-foreground">No recent searches yet.</p>
          ) : (
            <ul className="space-y-0.5">
              <AnimatePresence initial={false}>
                {searches.map((q) => (
                  <motion.li
                    key={q}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                  >
                    <button
                      onClick={() => onSelect(q)}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-secondary-foreground transition-colors hover:bg-accent"
                    >
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:opacity-0" />
                      <span className="truncate transition-transform duration-200 group-hover:translate-x-0.5">
                        {q}
                      </span>
                      <Search className="ml-auto h-3.5 w-3.5 shrink-0 text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {searches.length > 0 && (
            <button
              onClick={onClear}
              className="mt-2 w-full rounded-lg px-2 py-1.5 text-left text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Clear history
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
