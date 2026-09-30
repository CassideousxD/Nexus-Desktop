import React, { useState } from "react";
import { api } from "../api/client";
import type { SearchResult } from "../types";

export default function SearchView({ providerConfigured }: { providerConfigured: boolean }) {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await api.search(query.trim(), topK);
      setResults(res.results);
    } catch (err: any) {
      setError(err.message || "Search request failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function getFileExtension(path: string): string {
    const parts = path.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {!providerConfigured && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fef08a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <strong>⚠️ No API Provider Configured</strong>
            <p style={{ fontSize: "13px", marginTop: "4px", opacity: 0.9 }}>
              You need to configure an API key in Settings before performing semantic search or indexing files.
            </p>
          </div>
        </div>
      )}

      {/* Search Input Card */}
      <div className="glass-card">
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                className="text-input"
                style={{
                  fontSize: "16px",
                  padding: "14px 18px",
                  paddingLeft: "44px",
                }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across your documents by meaning or keywords…"
                disabled={!providerConfigured}
              />
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                  opacity: 0.6,
                }}
              >
                🔍
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "14px 28px", fontSize: "15px" }}
              disabled={loading || !providerConfigured}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span>Top Results:</span>
              {[5, 10, 20, 50].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTopK(k)}
                  style={{
                    background: topK === k ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.05)",
                    color: topK === k ? "#fff" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
            <span>Hybrid BM25 + Dense Vector Search</span>
          </div>
        </form>
      </div>

      {error && (
        <div
          style={{
            padding: "16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#fca5a5",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Results Header */}
      {searched && !loading && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </h3>
        </div>
      )}

      {/* Search Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {results.map((item, idx) => (
          <div key={idx} className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="badge badge-type">{getFileExtension(item.file_path)}</span>
                <code
                  style={{
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    color: "#cbd5e1",
                    wordBreak: "break-all",
                  }}
                >
                  {item.file_path}
                </code>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: item.score > 0.5 ? "var(--status-green)" : "var(--accent-cyan)",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  Score: {(item.score * 100).toFixed(1)}%
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={() => copyToClipboard(item.file_path)}
                  title="Copy path to clipboard"
                >
                  📋 Copy Path
                </button>
              </div>
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                padding: "14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#e2e8f0",
                fontFamily: "var(--font-mono)",
                whiteSpace: "pre-wrap",
              }}
            >
              {item.snippet}
            </div>
          </div>
        ))}

        {searched && !loading && results.length === 0 && (
          <div
            className="glass-card"
            style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📂</div>
            <h4 style={{ fontSize: "16px", color: "var(--text-main)", marginBottom: "6px" }}>No matching snippets found</h4>
            <p style={{ fontSize: "14px" }}>
              Try broadening your query keywords or index additional folders in the Library tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
