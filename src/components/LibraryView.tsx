import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { FileRecord, IndexDirectoryResponse } from "../types";

export default function LibraryView({ providerConfigured }: { providerConfigured: boolean }) {
  const [singlePath, setSinglePath] = useState("");
  const [dirPath, setDirPath] = useState("");
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [indexingSingle, setIndexingSingle] = useState(false);
  const [indexingDir, setIndexingDir] = useState(false);
  const [dirSummary, setDirSummary] = useState<IndexDirectoryResponse | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    setLoadingFiles(true);
    try {
      const data = await api.listFiles(200, 0);
      setFiles(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  }

  async function handleIndexSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!singlePath.trim()) return;

    setIndexingSingle(true);
    setMessage(null);

    try {
      const res = await api.indexFile(singlePath.trim());
      setMessage({
        text: `Successfully indexed ${res.file_path} (${res.chunks_indexed} chunks)`,
        type: "success",
      });
      setSinglePath("");
      loadFiles();
    } catch (err: any) {
      setMessage({ text: err.message || "Indexing failed", type: "error" });
    } finally {
      setIndexingSingle(false);
    }
  }

  async function handleIndexDir(e: React.FormEvent) {
    e.preventDefault();
    if (!dirPath.trim()) return;

    setIndexingDir(true);
    setMessage(null);
    setDirSummary(null);

    try {
      const res = await api.indexDirectory(dirPath.trim());
      setDirSummary(res);
      setMessage({
        text: `Directory indexing complete: ${res.files_indexed} of ${res.total_files_found} files indexed (${res.total_chunks_indexed} total chunks)`,
        type: "success",
      });
      setDirPath("");
      loadFiles();
    } catch (err: any) {
      setMessage({ text: err.message || "Directory indexing failed", type: "error" });
    } finally {
      setIndexingDir(false);
    }
  }

  async function handleDeleteFile(fileId: number) {
    try {
      await api.deleteFile(fileId);
      loadFiles();
    } catch (err: any) {
      alert(`Failed to delete file: ${err.message}`);
    }
  }

  async function handleClearAll() {
    if (!window.confirm("Are you sure you want to purge all indexed files and vector embeddings?")) return;
    try {
      await api.clearAll();
      loadFiles();
      setMessage({ text: "Collection cleared successfully", type: "success" });
    } catch (err: any) {
      alert(`Failed to clear collection: ${err.message}`);
    }
  }

  function formatDate(timestamp: number | null): string {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {message && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            background: message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: message.type === "success" ? "#6ee7b7" : "#fca5a5",
            fontSize: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Index Inputs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Index Single File */}
        <div className="glass-card">
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", color: "var(--text-main)" }}>
            📄 Index Single File
          </h3>
          <form onSubmit={handleIndexSingle} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. C:\Users\documents\report.pdf"
              value={singlePath}
              onChange={(e) => setSinglePath(e.target.value)}
              disabled={indexingSingle || !providerConfigured}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={indexingSingle || !singlePath.trim() || !providerConfigured}
            >
              {indexingSingle ? "Indexing File…" : "Index File"}
            </button>
          </form>
        </div>

        {/* Index Folder / Directory */}
        <div className="glass-card">
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px", color: "var(--text-main)" }}>
            📁 Index Folder / Directory
          </h3>
          <form onSubmit={handleIndexDir} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. C:\Users\projects\my-repo"
              value={dirPath}
              onChange={(e) => setDirPath(e.target.value)}
              disabled={indexingDir || !providerConfigured}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={indexingDir || !dirPath.trim() || !providerConfigured}
            >
              {indexingDir ? "Scanning & Indexing Folder…" : "Index Directory"}
            </button>
          </form>
        </div>
      </div>

      {dirSummary && dirSummary.errors.length > 0 && (
        <div className="glass-card" style={{ border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          <h4 style={{ color: "#fca5a5", fontSize: "14px", marginBottom: "10px" }}>
            ⚠️ Encountered Errors ({dirSummary.errors.length} files)
          </h4>
          <div style={{ maxHeight: "150px", overflowY: "auto", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
            {dirSummary.errors.map((err, idx) => (
              <div key={idx} style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
                <strong style={{ color: "#fca5a5" }}>{err.file_path}:</strong> {err.error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indexed Files Management */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)" }}>Indexed Collection</h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Total files in metadata database: {files.length}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={loadFiles} disabled={loadingFiles}>
              🔄 Refresh
            </button>
            <button className="btn btn-danger" onClick={handleClearAll} disabled={files.length === 0}>
              🗑️ Purge Collection
            </button>
          </div>
        </div>

        {loadingFiles ? (
          <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Loading files library…</p>
        ) : files.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
            No files have been indexed yet. Add a file or directory path above to begin.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>File Path</th>
                  <th style={{ padding: "12px" }}>Type</th>
                  <th style={{ padding: "12px" }}>Chunks</th>
                  <th style={{ padding: "12px" }}>Last Indexed</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "12px" }}>
                      <span className={`badge badge-${f.status}`}>{f.status}</span>
                    </td>
                    <td style={{ padding: "12px", fontFamily: "var(--font-mono)", maxWidth: "350px", wordBreak: "break-all" }}>
                      {f.path}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span className="badge badge-type">{f.file_type}</span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: 600 }}>{f.chunk_count}</td>
                    <td style={{ padding: "12px", color: "var(--text-muted)" }}>{formatDate(f.last_indexed)}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => handleDeleteFile(f.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
