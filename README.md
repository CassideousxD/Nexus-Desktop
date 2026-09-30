# Nexus

Nexus is a desktop, privacy-first, AI-powered semantic file search engine. It indexes
local files (PDF, Word, Excel, PowerPoint, images, code) and lets you search them by
meaning, not just keywords, using a hybrid of sparse (BM25) and dense (embedding)
retrieval.

This is a from-scratch desktop rewrite of an earlier Streamlit prototype. No code is
shared with that prototype.

## Tech stack

| Layer            | Technology                                              |
|------------------|----------------------------------------------------------|
| Shell/packaging  | Tauri (Rust)                                              |
| Frontend         | React + Vite + TypeScript                                 |
| Backend          | Python + FastAPI, run as a Tauri sidecar process           |
| Vector store     | ChromaDB                                                   |
| Metadata store   | SQLite                                                     |
| Embeddings       | API-based (e.g. OpenAI `text-embedding-3`), provider-abstracted |
| Captioning       | API-based vision model (e.g. GPT-4V, Gemini), provider-abstracted |
| Retrieval        | Hybrid BM25 (sparse) + dense embedding search               |

## API keys

Nexus does not ship with any API keys. You must supply your own key(s) for whichever
embedding/captioning provider you choose, entered via the in-app Settings screen. Keys
are stored locally and encrypted at rest; they are never transmitted anywhere except
directly to the provider's own API.

## Status

This repository currently contains a **structural skeleton only** — no indexing,
embedding, or search logic is implemented yet. See `docs/architecture.md` for design
notes as they're written.

## Development

```bash
# Frontend + Tauri shell
npm install
npm run tauri dev

# Backend (run independently while developing)
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```