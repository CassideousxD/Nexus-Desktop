import type { FileResult, IndexedFolder } from "@/types";

export const mockFiles: FileResult[] = [
  {
    id: "1",
    name: "Machine Learning Architecture.pdf",
    type: "pdf",
    typeLabel: "PDF",
    path: "~/Documents/Projects/Nexus/",
    snippet:
      "...semantic similarity, embeddings, vector retrieval and document indexing across local corpora...",
    relevance: 0.94,
  },
  {
    id: "2",
    name: "semantic_search.py",
    type: "code",
    typeLabel: "Python",
    path: "~/Documents/Projects/Nexus/backend/",
    snippet:
      "...def search(query: str) -> list[Match]: encode the query, run approximate nearest neighbour lookup...",
    relevance: 0.91,
  },
  {
    id: "3",
    name: "Nexus Project Specification.docx",
    type: "word",
    typeLabel: "Word",
    path: "~/Documents/Projects/Nexus/docs/",
    snippet:
      "...the desktop shell communicates with a local FastAPI service that owns indexing and retrieval...",
    relevance: 0.88,
  },
  {
    id: "4",
    name: "Research Notes.pdf",
    type: "pdf",
    typeLabel: "PDF",
    path: "~/Documents/Research/",
    snippet:
      "...comparison of sentence-transformer models for on-device inference, latency and recall tradeoffs...",
    relevance: 0.83,
  },
  {
    id: "5",
    name: "embedding_pipeline.py",
    type: "code",
    typeLabel: "Python",
    path: "~/Documents/Projects/Nexus/pipeline/",
    snippet:
      "...chunk documents, batch encode, persist vectors with metadata for incremental re-indexing...",
    relevance: 0.79,
  },
  {
    id: "6",
    name: "HRMS Architecture.xlsx",
    type: "excel",
    typeLabel: "Excel",
    path: "~/Documents/Work/HRMS/",
    snippet:
      "...service boundaries, data ownership, and projected storage per module for the coming quarter...",
    relevance: 0.71,
  },
  {
    id: "7",
    name: "System Design.png",
    type: "image",
    typeLabel: "Image",
    path: "~/Desktop/diagrams/",
    snippet: "...diagram: indexer → embedder → vector store → query planner → ranked results...",
    relevance: 0.66,
  },
  {
    id: "8",
    name: "README.md",
    type: "text",
    typeLabel: "Markdown",
    path: "~/Documents/Projects/Nexus/",
    snippet:
      "...run the local daemon, point Nexus at a folder, and search by meaning rather than filename...",
    relevance: 0.58,
  },
];

export const mockFolders: IndexedFolder[] = [
  { id: "f1", path: "~/Documents/Projects", fileCount: 212 },
  { id: "f2", path: "~/Documents/Research", fileCount: 168 },
  { id: "f3", path: "~/Desktop", fileCount: 120 },
];
