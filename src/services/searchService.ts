import { api } from "@/api/client";
import type { AiProvider, FileKind, FileResult } from "@/types";

function parseFileKind(filePath: string): { type: FileKind; typeLabel: string; name: string } {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const name = parts[parts.length - 1] || filePath;
  const ext = name.includes(".") ? name.split(".").pop()?.toLowerCase() || "" : "";

  if (["pdf"].includes(ext)) return { type: "pdf", typeLabel: "PDF Document", name };
  if (["doc", "docx"].includes(ext)) return { type: "word", typeLabel: "Word Document", name };
  if (["xls", "xlsx", "csv"].includes(ext)) return { type: "excel", typeLabel: "Excel Spreadsheet", name };
  if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) return { type: "image", typeLabel: "Image File", name };
  if (["py", "js", "ts", "tsx", "jsx", "cpp", "c", "h", "java", "rs", "go", "json", "md", "sql", "sh", "yaml", "yml"].includes(ext))
    return { type: "code", typeLabel: `${ext.toUpperCase()} Source`, name };
  return { type: "text", typeLabel: "Text File", name };
}

export async function searchFiles(query: string): Promise<FileResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const response = await api.search(q, 10);
    return response.results.map((r: { file_path: string; snippet: string; score: number }, idx: number) => {
      const { type, typeLabel, name } = parseFileKind(r.file_path);
      return {
        id: `res-${idx}-${r.file_path}`,
        name,
        type,
        typeLabel,
        path: r.file_path,
        snippet: r.snippet,
        relevance: r.score,
      };
    });
  } catch (err: any) {
    console.error("Backend search failed:", err);
    throw new Error(err.message || "Search request failed");
  }
}

export async function testConnection(
  provider: AiProvider,
  apiKey: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    await api.saveSettings({ provider, apiKey: apiKey.trim() });
    return { ok: true, message: `Successfully connected to ${provider.toUpperCase()} API` };
  } catch (err: any) {
    return { ok: false, message: err.message || "Connection test failed" };
  }
}
