export type FileKind = "pdf" | "word" | "excel" | "image" | "code" | "text";

export interface FileResult {
  id: string;
  name: string;
  type: FileKind;
  typeLabel: string;
  path: string;
  snippet: string;
  relevance: number;
}

export interface IndexedFolder {
  id: string;
  path: string;
  fileCount: number;
}

export interface IndexingStatus {
  processed: number;
  total: number;
  currentFolder: string;
  done: boolean;
}

export type AiProvider = "openai" | "gemini" | "anthropic";
