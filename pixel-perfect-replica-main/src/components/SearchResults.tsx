import { motion } from "motion/react";
import type { FileResult } from "@/types";
import { ResultCard } from "./ResultCard";

export function SearchResults({ results }: { results: FileResult[] }) {
  if (results.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-6 text-center text-[13px] text-muted-foreground"
      >
        No related files found. Try describing what the document is about.
      </motion.p>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="px-1 text-[11px] uppercase tracking-wide text-muted-foreground/70">
        {results.length} related files
      </p>
      {results.map((r, i) => (
        <ResultCard key={r.id} result={r} index={i} />
      ))}
    </div>
  );
}
