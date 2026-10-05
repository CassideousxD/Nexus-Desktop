# Nexus Desktop Architecture

This document outlines the architectural decisions and technical structure for converting the **Nexus** privacy-first, AI-powered semantic file search engine from a local web service into a self-contained, native desktop application for macOS and Windows.

---

## 1. Desktop Framework Decision: Tauri v2 vs. Electron

### Evaluation Summary

| Dimension | Tauri v2 (Selected) | Electron |
|---|---|---|
| **Binary Bundle Size** | ~98 MB (including full frozen AI backend) | ~250+ MB |
| **RAM Footprint** | Extremely low (native OS WebKit / WebView2) | High (embedded Chromium instance) |
| **Backend Compatibility** | Native child process lifecycle / sidecars with port piping | Node.js `child_process.spawn` |
| **Code Modification** | Preserves existing Rust shell & Python entrypoints | Requires complete rewrite of Rust logic in JS |
| **Security Architecture** | Strict capability manifests (`capabilities/*.json`) & native sandboxing | Configurable, but requires granular IPC & preload auditing |
| **Distribution** | Native macOS `.app` / `.dmg`, Windows NSIS `.exe` installer | Electron Packager / Builder |

### Decision Rationale

1. **Native Repository Alignment**: The codebase already contained the initial Tauri v2 skeleton with native Rust sidecar lifecycle handling in `src-tauri/src/lib.rs`.
2. **Heavy AI Backend Isolation**: Nexus relies on Python for indexing (PDF, Word, Excel, PowerPoint, Images, Code), vector storage (ChromaDB), SQLite, and BM25 sparse retrieval. Tauri provides a clean sidecar mechanism (`bundle.externalBin`) that runs the frozen Python binary without exposing raw Node.js internals or bloating memory.
3. **No Unnecessary Rewriting**: Choosing Electron would require duplicating all process supervision and event emission logic in JavaScript, whereas Tauri v2 operates out-of-the-box with native OS webviews.

---

## 2. Desktop System Architecture

The overall system architecture follows an isolated desktop shell + local sidecar model:

```text
               Nexus Desktop Application
                          │
       ┌──────────────────┴──────────────────┐
       │                                     │
   Native Host                           Frontend
 (Tauri 2 / Rust)                    (React + Vite)
       │                                     │
       ├── 1. Spawns Sidecar                 ├── 1. Mounts & Boots Animation
       │   `nexus-backend` (port=0)          ├── 2. Listens for `backend-ready` event
       │                                     ├── 3. Queries `127.0.0.1:<port>`
       ├── 2. Reads Stdout                   │      (/health, /stats, /search, etc.)
       │   `NEXUS_BACKEND_PORT=<port>`       └── 4. Native OS file dialog integration
       │                                            via `@tauri-apps/plugin-dialog`
       ├── 3. Emits IPC Event
       │   `backend-ready` -> Frontend
       │
       └── 4. Application Lifecycle
           Kills backend child process
           on window close/quit
                          │
                          ▼
              Standalone Backend Sidecar
             (Frozen Python / PyInstaller)
                          │
          ┌───────────────┴───────────────┐
          │                               │
       FastAPI                         Stores
      Endpoints                   (~/.nexus/...)
   /health, /settings,            - metadata.db (SQLite)
   /index, /search, /stats        - chroma_data (ChromaDB)
```

---

## 3. Dynamic Port Allocation & Process Lifecycle

### Port Allocation
- Hardcoded ports (e.g. `8000`) cause immediate crashes if another service is running or multiple instances open.
- The Nexus backend binds to an ephemeral port (`port=0`) managed by the operating system kernel.
- Once bound, Uvicorn reports the bound port over `stdout`:
  ```text
  NEXUS_BACKEND_PORT=52634
  ```
- Tauri's Rust process intercepts this line asynchronously, stores the port in `BackendState`, and emits `backend-ready` to the webview.
- The webview client (`src/api/client.ts`) resolves this port for all future HTTP calls (`http://127.0.0.1:<port>`).

### Process Lifecycle & Graceful Termination
- Tauri registers a window event listener for `CloseRequested` and `Destroyed`.
- When the user closes the application, the native Rust process terminates the child backend process (`child.kill()`), guaranteeing no orphan backend processes consume background RAM or lock SQLite/ChromaDB databases.

---

## 4. Security & Isolation Boundary

1. **Context Isolation**: Webview runs in isolation; direct shell execution is not permitted by default.
2. **Capability Scopes**: Configured via `src-tauri/capabilities/default.json`:
   - `core:default`
   - `fs:default` (scoped access for file dialogs)
   - `dialog:default`
   - `shell:default` with explicit `shell:allow-spawn` targeting only `binaries/nexus-backend`
   - `http:default` restricted to localhost
3. **API Key Encryption**: API keys for OpenAI, Google Gemini, and Anthropic are encrypted at rest using `Fernet AES-128`. Encryption keys are maintained in the native OS credential store (macOS Keychain, Windows Credential Manager) and never stored alongside the database.
