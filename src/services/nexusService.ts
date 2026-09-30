/**
 * Nexus application lifecycle service connected to live FastAPI backend.
 */

import { api } from "@/api/client";
import type { IndexedFolder } from "@/types";

export async function initializeSearchEngine(): Promise<void> {
  try {
    await api.health();
  } catch (err) {
    console.warn("Backend health check failed on boot:", err);
  }
}

export async function loadIndexedFiles(): Promise<IndexedFolder[]> {
  try {
    const files = await api.listFiles(200, 0);
    const folderMap = new Map<string, number>();

    files.forEach((file) => {
      const normalized = file.path.replace(/\\/g, "/");
      const parts = normalized.split("/");
      parts.pop(); // Remove filename
      const folderPath = parts.join("/") || "/";
      folderMap.set(folderPath, (folderMap.get(folderPath) || 0) + 1);
    });

    const folders: IndexedFolder[] = Array.from(folderMap.entries()).map(([path, count], idx) => ({
      id: `folder-${idx}-${path}`,
      path,
      fileCount: count,
    }));

    return folders;
  } catch (err) {
    console.error("Failed to load indexed files:", err);
    return [];
  }
}

export async function loadRecentSearches(): Promise<string[]> {
  const saved = localStorage.getItem("nexus_recent_searches");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return [
    "machine learning architecture",
    "project architecture",
    "vector store indexing",
    "python embeddings",
  ];
}

export async function initializeNexus(): Promise<{ recentSearches: string[]; folders: IndexedFolder[] }> {
  await initializeSearchEngine();
  const [recentSearches, folders] = await Promise.all([
    loadRecentSearches(),
    loadIndexedFiles(),
  ]);
  return { recentSearches, folders };
}

export const launchNexus = initializeNexus;
