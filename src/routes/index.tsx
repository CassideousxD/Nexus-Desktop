import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { History, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { SearchLoadingState } from "@/components/SearchLoadingState";
import { EmptyState } from "@/components/EmptyState";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IndexingStatusBadge } from "@/components/IndexingStatusBadge";
import { RecentSearches } from "@/components/RecentSearches";
import { SearchEyes, type SearchEyeState } from "@/components/SearchEyes";
import { SemanticFileGraph } from "@/components/SemanticFileGraph";
import type { SearchPhase } from "@/components/SemanticSearchAnimation";
import { searchFiles } from "@/services/searchService";
import { initializeNexus } from "@/services/nexusService";
import { mockFolders } from "@/data/mockData";
import type { FileResult, IndexedFolder, IndexingStatus } from "@/types";
import { BootSequence } from "@/components/BootSequence";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus — Semantic file search" },
      {
        name: "description",
        content:
          "Nexus is a local, AI-powered semantic file search utility. Find documents by meaning, not just filenames.",
      },
      { property: "og:title", content: "Nexus — Semantic file search" },
      {
        property: "og:description",
        content: "Search your local files by meaning with a fast, private desktop utility.",
      },
    ],
  }),
  component: Nexus,
});

// Boot animation timeline:
// 300ms eyes pop in → 900ms wink → 1700ms text phase → 2540ms NEXUS typed → 2700ms wordmark
// Give 600ms of hold after wordmark appears before the overlay lifts.
const BOOT_MIN_MS = 3300;

function Nexus() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [booting, setBooting] = useState(true);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FileResult[] | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [folders, setFolders] = useState<IndexedFolder[]>(mockFolders);
  const [indexing, setIndexing] = useState<IndexingStatus>({
    processed: 240,
    total: 500,
    currentFolder: "~/Documents/Research",
    done: false,
  });

  // Boot: run mock initialization in parallel with the visual sequence.
  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    initializeNexus().then(({ recentSearches }) => {
      if (cancelled) return;
      setRecentSearches(recentSearches);
      const remaining = Math.max(0, BOOT_MIN_MS - (Date.now() - started));
      setTimeout(() => {
        if (!cancelled) {
          setBooting(false);
          inputRef.current?.focus();
        }
      }, remaining);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Background indexing simulation.
  useEffect(() => {
    if (indexing.done || booting) return;
    const t = setInterval(() => {
      setIndexing((s) => {
        const next = Math.min(s.total, s.processed + 11);
        return { ...s, processed: next, done: next >= s.total };
      });
    }, 900);
    return () => clearInterval(t);
  }, [indexing.done, booting]);

  // Debounced semantic search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(async () => {
      let res: FileResult[];
      try {
        res = await searchFiles(q);
      } catch {
        if (!cancelled) {
          setSearchError(true);
          setResults([]);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setSearchError(false);
        setResults(res);
        setLoading(false);
        setRecentSearches((prev) => [q, ...prev.filter((p) => p !== q)].slice(0, 8));
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  // Keyboard shortcuts.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape") {
        setSettingsOpen(false);
        setHistoryOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const phase: SearchPhase = loading
    ? "searching"
    : results
      ? "results"
      : query
        ? "typing"
        : focused
          ? "focused"
          : "idle";

  const found = results ? results.length > 0 : null;
  const [eyes, setEyes] = useState<SearchEyeState>("idle");
  useEffect(() => {
    if (loading) return setEyes("searching");
    if (!results) return setEyes("idle");
    const next: SearchEyeState = searchError ? "error" : found ? "found" : "no-results";
    setEyes(next);
    const t = setTimeout(() => setEyes("idle"), next === "found" ? 1800 : 2200);
    return () => clearTimeout(t);
  }, [loading, results, found, searchError]);

  return (
    <main className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background">
      {/* Boot overlay — rendered above everything, exits via AnimatePresence */}
      <AnimatePresence>
        {booting && <BootSequence key="boot" />}
      </AnimatePresence>

      <SemanticFileGraph phase={phase} found={found} />

      <header className="relative z-10 flex items-center justify-end gap-1 px-5 py-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.1 }}
          onClick={() => setHistoryOpen((o) => !o)}
          aria-label="Toggle recent searches"
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
            historyOpen
              ? "border-border bg-surface text-foreground"
              : "border-transparent text-muted-foreground hover:border-border hover:bg-surface hover:text-foreground"
          }`}
        >
          <History className="h-[17px] w-[17px]" />
        </motion.button>
        <ThemeToggle />
        <motion.button
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.1 }}
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-surface hover:text-foreground"
        >
          <Settings className="h-[17px] w-[17px]" />
        </motion.button>
      </header>

      <RecentSearches
        open={historyOpen}
        searches={recentSearches}
        onSelect={(q) => {
          setQuery(q);
          setHistoryOpen(false);
          inputRef.current?.focus();
        }}
        onClear={() => setRecentSearches([])}
        onClose={() => setHistoryOpen(false)}
      />

      <div className="relative z-10 flex min-h-0 flex-1 justify-center overflow-y-auto px-5 pb-[30vh]">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="flex w-full max-w-[640px] flex-col pt-[8vh]"
        >
          <motion.p
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-center text-[13px] font-medium tracking-[0.35em] text-muted-foreground"
          >
            NEXUS
          </motion.p>

          {/* Search bar emerges from the Nexus identity after boot. */}
          {!booting && (<>
          <div className="mb-5">
            <SearchEyes state={eyes} />
          </div>
          <motion.div
            initial={{ scaleX: 0.25, opacity: 0, y: -10 }}
            animate={{ scaleX: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 22, delay: 0.1 }}
          >
            <SearchBar
              ref={inputRef}
              value={query}
              onChange={setQuery}
              onSubmit={() => inputRef.current?.blur()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              focused={focused}
            />
          </motion.div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" exit={{ opacity: 0 }}>
                  <SearchLoadingState />
                </motion.div>
              ) : results ? (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SearchResults results={results} />
                </motion.div>
              ) : (
                <motion.div key="empty" exit={{ opacity: 0 }}>
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </>)}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-5 z-20">
        <div className="pointer-events-auto">
          <IndexingStatusBadge status={indexing} />
        </div>
      </div>

      {/* Settings dim backdrop */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 z-30 bg-background/60"
          />
        )}
      </AnimatePresence>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        folders={folders}
        onAddFolder={() =>
          setFolders((f) => [
            ...f,
            { id: crypto.randomUUID(), path: "~/Documents/New Folder", fileCount: 0 },
          ])
        }
        onRemoveFolder={(id) => setFolders((f) => f.filter((x) => x.id !== id))}
      />
    </main>
  );
}
