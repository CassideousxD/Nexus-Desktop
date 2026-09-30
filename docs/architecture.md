# Architecture

This document tracks design decisions as they're made. Placeholder for now.

## Open questions / to be documented here

- **Indexing pipeline**: chunking strategy per file type (PDF, DOCX, XLSX, PPTX,
  images, code); how large files get split; how re-indexing on file change is
  detected and handled.
- **Provider abstraction**: the `EmbeddingProvider` / `CaptioningProvider`
  interfaces in `backend/embeddings/`, how a provider is selected at runtime, and
  how provider-specific quirks (rate limits, max input size, batching) are
  normalized.
- **Retrieval design**: how BM25 and dense embedding scores are combined/re-ranked
  into a single hybrid result set; tunable weighting; latency budget.
- **Storage layout**: ChromaDB collection schema, SQLite metadata schema, and how
  the two stay in sync.
- **Sidecar packaging**: how the FastAPI backend is frozen with PyInstaller and
  wired into the Tauri sidecar for distribution (see `backend/README.md`).

## Decisions log

_(empty — fill in as decisions are made)_