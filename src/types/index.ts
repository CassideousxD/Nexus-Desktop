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
export type ProviderName = AiProvider;

export interface FileRecord {
  id: number;
  path: string;
  file_type: string;
  last_modified: number;
  last_indexed: number | null;
  status: string;
  chunk_count: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  provider_configured: boolean;
  active_provider: string | null;
}

export interface IndexResponse {
  file_path: string;
  chunks_indexed: number;
}

export interface IndexDirectoryResponse {
  directory: string;
  total_files_found: number;
  files_indexed: number;
  total_chunks_indexed: number;
  errors: Array<{ file_path: string; error: string }>;
}

export interface SearchResult {
  file_path: string;
  snippet: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SettingsInfoResponse {
  active_provider: string | null;
  configured_providers: string[];
}

export interface ProviderConfig {
  provider: AiProvider | string;
  apiKey: string;
}

export interface StatsResponse {
  total_files: number;
  indexed_files: number;
  pending_files: number;
  error_files: number;
  total_chunks: number;
  chroma_vectors: number;
  active_provider: string | null;
  provider_configured: boolean;
}

