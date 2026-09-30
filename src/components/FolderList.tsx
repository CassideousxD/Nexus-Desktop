import { motion, AnimatePresence } from "motion/react";
import { Folder, Plus, Trash2 } from "lucide-react";
import type { IndexedFolder } from "@/types";

interface Props {
  folders: IndexedFolder[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function FolderList({ folders, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {folders.map((f) => (
          <motion.div
            key={f.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5"
          >
            <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-mono text-[12px] text-foreground">{f.path}</span>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
              {f.fileCount}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(f.id)}
              aria-label={`Remove ${f.path}`}
              className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong py-2.5 text-[13px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> Add Folder
      </motion.button>
    </div>
  );
}
