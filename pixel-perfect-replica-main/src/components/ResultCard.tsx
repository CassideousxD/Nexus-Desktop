import { motion } from "motion/react";
import { FileText, FileCode2, FileSpreadsheet, FileImage, FileType2, File } from "lucide-react";
import type { FileResult } from "@/types";

const iconFor = {
  pdf: { Icon: FileText, color: "text-file-pdf" },
  word: { Icon: FileType2, color: "text-file-word" },
  excel: { Icon: FileSpreadsheet, color: "text-file-excel" },
  image: { Icon: FileImage, color: "text-file-image" },
  code: { Icon: FileCode2, color: "text-file-code" },
  text: { Icon: File, color: "text-file-text" },
} as const;

export function ResultCard({ result, index }: { result: FileResult; index: number }) {
  const { Icon, color } = iconFor[result.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.01 }}
      className="group cursor-default rounded-xl border border-border bg-surface px-4 py-3.5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-raised">
          <Icon className={`h-[18px] w-[18px] ${color}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <p className="truncate text-[15px] font-semibold text-foreground">{result.name}</p>
            <span className="ml-auto shrink-0 font-mono text-xs font-medium text-brand">
              {Math.round(result.relevance * 100)}%
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {result.snippet}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="uppercase tracking-wide">{result.typeLabel}</span>
            <span className="opacity-40">·</span>
            <span className="truncate font-mono">{result.path}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
