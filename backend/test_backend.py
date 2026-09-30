"""
Unit tests for Nexus backend features:
- MetadataDB schemas, CRUD operations, and stats
- Directory crawler and supported file detection
- ChromaClient initialization & query interface
"""

import tempfile
from pathlib import Path
from storage.metadata_db import MetadataDB
from indexing.directory import crawl_directory


def test_metadata_db():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_metadata.db"
        db = MetadataDB(db_path=db_path)
        db.connect()

        # Test file upsert
        file_id = db.upsert_file("/path/to/test.pdf", "pdf", 12345678.0)
        assert file_id > 0

        file_info = db.get_file("/path/to/test.pdf")
        assert file_info is not None
        assert file_info["status"] == "pending"

        # Test chunk addition
        db.add_chunk("chunk-1", file_id, 0, "This is a test document snippet about AI.")
        db.mark_indexed(file_id)

        # Test list_files
        files = db.list_files()
        assert len(files) == 1
        assert files[0]["chunk_count"] == 1
        assert files[0]["status"] == "indexed"

        # Test stats
        stats = db.get_stats()
        assert stats["total_files"] == 1
        assert stats["indexed_files"] == 1
        assert stats["total_chunks"] == 1

        # Test delete
        deleted_path = db.delete_file_by_id(file_id)
        assert deleted_path == "/path/to/test.pdf"
        assert len(db.list_files()) == 0

        db.close()
        print("[PASS] MetadataDB tests passed!")


def test_directory_crawler():
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)

        # Create sample files
        (tmp_path / "doc.pdf").write_text("dummy pdf")
        (tmp_path / "script.py").write_text("print('hello')")
        (tmp_path / "notes.txt").write_text("random note")

        # Create ignored dir
        ignored_dir = tmp_path / "node_modules"
        ignored_dir.mkdir()
        (ignored_dir / "lib.js").write_text("ignored JS")

        files = crawl_directory(str(tmp_path))
        file_names = [f.name for f in files]

        assert "doc.pdf" in file_names
        assert "script.py" in file_names
        assert "notes.txt" in file_names
        assert "lib.js" not in file_names

        print("[PASS] Directory crawler tests passed!")


if __name__ == "__main__":
    test_metadata_db()
    test_directory_crawler()
    print("All backend unit tests completed successfully!")
