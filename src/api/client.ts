import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import type {
  FileRecord,
  HealthResponse,
  IndexDirectoryResponse,
  IndexResponse,
  ProviderConfig,
  SearchResponse,
  SettingsInfoResponse,
  StatsResponse,
} from "../types";

let currentPort: number | null = null;
let resolvePortPromise: (port: number) => void;
const portPromise = new Promise<number>((resolve) => {
  resolvePortPromise = resolve;
});

// Check if running inside Tauri environment
const isTauri = typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);

if (!isTauri) {
  // Plain browser dev mode — fallback to default port 8000
  currentPort = 8000;
  resolvePortPromise!(8000);
} else {
  // Listen for backend-ready event from Tauri Rust sidecar launcher
  listen<number>("backend-ready", (event) => {
    if (event.payload) {
      currentPort = event.payload;
      if (resolvePortPromise) resolvePortPromise(event.payload);
    }
  }).catch(() => {
    if (!currentPort) {
      currentPort = 8000;
      if (resolvePortPromise) resolvePortPromise(8000);
    }
  });

  // Query state in case backend port was assigned before listener mounted
  invoke<number | null>("get_backend_port")
    .then((p) => {
      if (p && !currentPort) {
        currentPort = p;
        if (resolvePortPromise) resolvePortPromise(p);
      }
    })
    .catch(() => {
      // Ignore invoke failure if command not registered
    });

  // Safety fallback after 5 seconds
  setTimeout(() => {
    if (!currentPort) {
      currentPort = 8000;
      if (resolvePortPromise) resolvePortPromise(8000);
    }
  }, 5000);
}

async function getBaseUrl(): Promise<string> {
  if (currentPort) {
    return `http://127.0.0.1:${currentPort}`;
  }
  const port = await portPromise;
  return `http://127.0.0.1:${port}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = `Request to ${path} failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthResponse>("/health"),

  getSettings: () => request<SettingsInfoResponse>("/settings"),

  saveSettings: (config: ProviderConfig) =>
    request<{ provider: string; saved: boolean }>("/settings", {
      method: "POST",
      body: JSON.stringify({ provider: config.provider, api_key: config.apiKey }),
    }),

  search: (query: string, topK = 10) =>
    request<SearchResponse>("/search", {
      method: "POST",
      body: JSON.stringify({ query, top_k: topK }),
    }),

  indexFile: (filePath: string) =>
    request<IndexResponse>("/index", {
      method: "POST",
      body: JSON.stringify({ file_path: filePath }),
    }),

  indexDirectory: (directoryPath: string) =>
    request<IndexDirectoryResponse>("/index-directory", {
      method: "POST",
      body: JSON.stringify({ directory_path: directoryPath }),
    }),

  listFiles: (limit = 100, offset = 0, status?: string) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (status) params.append("status", status);
    return request<FileRecord[]>(`/files?${params.toString()}`);
  },

  deleteFile: (fileId: number) =>
    request<{ deleted: boolean; file_id: number; path: string }>(`/files/${fileId}`, {
      method: "DELETE",
    }),

  clearAll: () =>
    request<{ cleared: boolean }>("/clear", {
      method: "POST",
    }),

  getStats: () => request<StatsResponse>("/stats"),
};
