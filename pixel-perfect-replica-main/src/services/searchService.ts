import { mockFiles } from "@/data/mockData";
import type { AiProvider, FileResult } from "@/types";

/**
 * Mock search layer. Replace the bodies of these functions with calls to the
 * local FastAPI backend; the UI depends only on these signatures.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function searchFiles(query: string): Promise<FileResult[]> {
  await delay(650);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const tokens = q.split(/\s+/);
  const scored = mockFiles.map((file) => {
    const haystack = `${file.name} ${file.snippet} ${file.path} ${file.typeLabel}`.toLowerCase();
    const hits = tokens.filter((t) => haystack.includes(t)).length;
    const boost = tokens.length ? (hits / tokens.length) * 0.12 : 0;
    return { ...file, relevance: Math.min(0.99, file.relevance + boost) };
  });

  return scored.sort((a, b) => b.relevance - a.relevance).slice(0, 6);
}

export async function testConnection(
  provider: AiProvider,
  apiKey: string,
): Promise<{ ok: boolean; message: string }> {
  await delay(900);
  if (apiKey.trim().length < 8) {
    return { ok: false, message: "Invalid API key for " + provider };
  }
  return { ok: true, message: "Connection successful" };
}
