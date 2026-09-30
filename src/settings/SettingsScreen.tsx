import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { ProviderName, SettingsInfoResponse } from "../types";

export default function SettingsScreen({ onSettingsSaved }: { onSettingsSaved?: () => void }) {
  const [provider, setProvider] = useState<ProviderName>("openai");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [info, setInfo] = useState<SettingsInfoResponse | null>(null);

  useEffect(() => {
    loadSettingsInfo();
  }, []);

  async function loadSettingsInfo() {
    try {
      const data = await api.getSettings();
      setInfo(data);
      if (data.active_provider) {
        setProvider(data.active_provider as ProviderName);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setStatusMsg({ text: "Please enter a valid API key.", type: "error" });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      await api.saveSettings({ provider, apiKey: apiKey.trim() });
      setStatusMsg({ text: `Settings saved successfully for ${provider.toUpperCase()}. Key encrypted locally.`, type: "success" });
      setApiKey("");
      loadSettingsInfo();
      if (onSettingsSaved) onSettingsSaved();
    } catch (err: any) {
      setStatusMsg({ text: err.message || "Failed to save settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "640px" }}>
      <div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)" }}>AI Provider & API Configuration</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
          Configure API credentials for embedding generation and image captioning.
        </p>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            background: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${statusMsg.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: statusMsg.type === "success" ? "#6ee7b7" : "#fca5a5",
            fontSize: "14px",
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Configuration Card */}
      <div className="glass-card">
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="input-group">
            <label className="input-label" htmlFor="provider-select">Select Embedding / Vision Provider</label>
            <select
              id="provider-select"
              className="select-input"
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderName)}
            >
              <option value="openai">OpenAI (text-embedding-3-small + gpt-4o captioning)</option>
              <option value="gemini">Google Gemini (text-embedding-004 + gemini-1.5-flash captioning)</option>
              <option value="anthropic">Anthropic Claude (vision captioning)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="api-key-input">
              {provider.toUpperCase()} API Key
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                id="api-key-input"
                type={showKey ? "text" : "password"}
                className="text-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === "openai"
                    ? "sk-proj-..."
                    : provider === "gemini"
                    ? "AIzaSy..."
                    : "sk-ant-..."
                }
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowKey(!showKey)}
                style={{ padding: "0 14px", fontSize: "13px" }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !apiKey.trim()}
            style={{ padding: "14px", fontSize: "15px", marginTop: "4px" }}
          >
            {saving ? "Encrypting & Saving Key…" : "Save API Settings"}
          </button>
        </form>
      </div>

      {/* Security & Info Box */}
      <div className="glass-card" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
        <h4 style={{ color: "var(--text-main)", marginBottom: "8px", fontSize: "14px", fontWeight: 700 }}>
          🔒 Privacy & Key Encryption Security
        </h4>
        <p>
          Your API keys are encrypted at rest using <code>Fernet AES-128</code> encryption via Python's cryptography engine.
          Encryption keys are stored safely in your operating system's native Credential Manager (Windows Credential Store / macOS Keychain).
          Keys are never sent to any external server except directly to your chosen API provider.
        </p>
      </div>

      {info && (
        <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Active Provider:</span>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)", textTransform: "capitalize", marginTop: "2px" }}>
              {info.active_provider || "None configured"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Configured Keys:</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              {info.configured_providers.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-subtle)" }}>None</span>
              ) : (
                info.configured_providers.map((p) => (
                  <span key={p} className="badge badge-indexed">
                    {p}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
