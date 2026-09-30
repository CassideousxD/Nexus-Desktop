"""
Directory indexing utility — recursively crawls a target folder, identifies
supported files, and indexes them using the pipeline.
"""

from pathlib import Path
from typing import Callable

from embeddings.base import CaptioningProvider, EmbeddingProvider
from storage.chroma_client import ChromaClient
from storage.metadata_db import MetadataDB

from . import IMAGE_EXTENSIONS, CODE_EXTENSIONS, _EXTENSION_MAP
from .pipeline import index_path

_IGNORE_DIRS = {
    "node_modules", "venv", "env", ".venv", ".env", "__pycache__",
    "dist", "build", "target", "out", "bin", "obj", ".git", ".idea",
    ".vscode", ".gemini", ".nexus", ".next", ".nuxt",
}

SUPPORTED_EXTENSIONS = set(_EXTENSION_MAP.keys()).union(IMAGE_EXTENSIONS).union(CODE_EXTENSIONS)


def crawl_directory(dir_path: str) -> list[Path]:
    """
    Find all supported files in dir_path, ignoring common build/dependency
    directories and hidden folders.
    """
    root = Path(dir_path)
    if not root.exists() or not root.is_dir():
        raise ValueError(f"Directory path '{dir_path}' does not exist or is not a directory.")

    files: list[Path] = []

    for item in root.rglob("*"):
        if item.is_dir():
            continue
        # Skip if any parent directory is in _IGNORE_DIRS or starts with '.'
        if any(part in _IGNORE_DIRS or (part.startswith(".") and part != ".") for part in item.parts[:-1]):
            continue
        if item.suffix.lower() in SUPPORTED_EXTENSIONS:
            files.append(item)

    return sorted(files)


def index_directory(
    dir_path: str,
    embedding_provider: EmbeddingProvider,
    chroma_client: ChromaClient,
    metadata_db: MetadataDB,
    captioning_provider: CaptioningProvider | None = None,
    progress_callback: Callable[[str, int, int], None] | None = None,
) -> dict:
    """
    Index all supported files inside a directory.
    """
    files = crawl_directory(dir_path)
    total_files = len(files)
    indexed_files = 0
    total_chunks = 0
    errors: list[dict] = []

    for i, file_path in enumerate(files):
        if progress_callback:
            progress_callback(str(file_path), i + 1, total_files)
        try:
            chunks = index_path(
                file_path=str(file_path),
                embedding_provider=embedding_provider,
                chroma_client=chroma_client,
                metadata_db=metadata_db,
                captioning_provider=captioning_provider,
            )
            indexed_files += 1
            total_chunks += chunks
        except Exception as exc:
            errors.append({"file_path": str(file_path), "error": str(exc)})

    return {
        "directory": dir_path,
        "total_files_found": total_files,
        "files_indexed": indexed_files,
        "total_chunks_indexed": total_chunks,
        "errors": errors,
    }
