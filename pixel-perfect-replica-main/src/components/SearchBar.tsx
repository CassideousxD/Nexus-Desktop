import { motion, useAnimationControls } from "motion/react";
import { Search, X } from "lucide-react";
import { forwardRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onFocus: () => void;
  onBlur: () => void;
  focused: boolean;
}

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar(
  { value, onChange, onSubmit, onFocus, onBlur, focused },
  ref,
) {
  const press = useAnimationControls();
  return (
    <motion.div
      animate={{
        scale: focused ? 1.012 : 1,
        boxShadow: focused
          ? "0 0 0 1px var(--brand-soft), 0 12px 40px -22px var(--brand)"
          : "0 0 0 0px transparent, 0 0 0 0 transparent",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="relative w-full"
    >
      <motion.div
        animate={press}
        className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3.5 transition-colors duration-300 ${
          focused ? "border-brand/50" : "border-border"
        }`}
      >
        <Search
          className={`h-[18px] w-[18px] shrink-0 transition-colors duration-300 ${
            focused ? "text-brand" : "text-muted-foreground"
          }`}
        />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              press.start({
                scale: [1, 0.965, 1],
                transition: { duration: 0.32, ease: "easeOut" },
              });
              onSubmit();
            }
            if (e.key === "Escape") (e.target as HTMLInputElement).blur();
          }}
          placeholder="Search files by name or meaning..."
          spellCheck={false}
          className="w-full bg-transparent text-[17px] font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
        />
        {value ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </motion.button>
        ) : (
          <kbd className="hidden shrink-0 items-center gap-1 rounded-md border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        )}
      </motion.div>
    </motion.div>
  );
});
