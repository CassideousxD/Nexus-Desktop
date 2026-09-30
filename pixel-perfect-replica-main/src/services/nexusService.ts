/**
 * Nexus application lifecycle service.
 *
 * MOCK IMPLEMENTATION — every function here simulates the local
 * Python/FastAPI backend startup. When the real backend lands, replace
 * the bodies of these functions with HTTP calls; the UI must not change.
 */

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Initialize the semantic search engine (mock). */
export async function initializeSearchEngine(): Promise<void> {
  await delay(600);
}

/** Load the user's indexed folders (mock). */
export async function loadIndexedFiles(): Promise<void> {
  await delay(400);
}

/** Load persisted recent searches (mock). */
export async function loadRecentSearches(): Promise<string[]> {
  await delay(350);
  return [
    "machine learning architecture",
    "project architecture",
    "timetable scheduler",
    "python embeddings",
    "internship documents",
  ];
}

/**
 * Full boot initialization. Runs the mock startup steps in parallel and
 * resolves when the application is ready to become active.
 */
export async function initializeNexus(): Promise<{ recentSearches: string[] }> {
  const [, , recentSearches] = await Promise.all([
    initializeSearchEngine(),
    loadIndexedFiles(),
    loadRecentSearches(),
  ]);
  return { recentSearches };
}

/** Alias kept for parity with the spec's lifecycle naming. */
export const launchNexus = initializeNexus;
