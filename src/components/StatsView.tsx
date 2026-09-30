import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { StatsResponse } from "../types";

export default function StatsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)" }}>System Analytics & Storage</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time status of metadata store and Chroma vector collection
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadStats} disabled={loading}>
          🔄 Refresh Metrics
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading metrics…</p>
      ) : stats ? (
        <>
          {/* Top Metric Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Total Documents</span>
              <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-main)" }}>{stats.total_files}</span>
              <span style={{ fontSize: "12px", color: "var(--status-green)" }}>{stats.indexed_files} indexed</span>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Total Text Chunks</span>
              <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--accent-cyan)" }}>{stats.total_chunks}</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>SQLite metadata store</span>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Chroma Vector Count</span>
              <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--accent-primary)" }}>{stats.chroma_vectors}</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Dense embeddings</span>
            </div>

            <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Active Provider</span>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", textTransform: "capitalize" }}>
                {stats.active_provider || "None"}
              </span>
              <span style={{ fontSize: "12px", color: stats.provider_configured ? "var(--status-green)" : "var(--status-red)" }}>
                {stats.provider_configured ? "Ready for queries" : "Unconfigured"}
              </span>
            </div>
          </div>

          {/* Detailed System Breakdown Card */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>Pipeline Status Breakdown</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Indexed Files</span>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#6ee7b7" }}>{stats.indexed_files}</span>
              </div>

              <div style={{ padding: "16px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Pending Files</span>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#fde047" }}>{stats.pending_files}</span>
              </div>

              <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Failed / Error Files</span>
                <span style={{ fontSize: "24px", fontWeight: 700, color: "#fca5a5" }}>{stats.error_files}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: "var(--status-red)" }}>Unable to connect to backend service.</p>
      )}
    </div>
  );
}
