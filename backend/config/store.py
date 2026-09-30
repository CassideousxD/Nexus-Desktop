"""
ConfigStore — local, encrypted persistence of provider settings and API
keys.

The config blob (active provider + per-provider keys) is encrypted with
`cryptography.fernet.Fernet`. The Fernet key itself is kept in the OS
credential manager via `keyring` (Keychain on macOS, Credential Manager on
Windows, Secret Service on Linux) rather than on disk next to the config,
so a copied config file alone isn't enough to decrypt it.

If no OS keyring backend is available (e.g. a headless Linux box with no
Secret Service running), this falls back to a locally-stored key file with
restricted permissions. That's weaker than a real keyring, but it keeps the
app functional everywhere, and the fallback path is isolated to
`_load_or_create_fernet` so swapping in a stronger scheme later is a
one-function change.
"""

import json
from pathlib import Path

import keyring
from cryptography.fernet import Fernet, InvalidToken

_SERVICE_NAME = "nexus-app"
_KEYRING_USERNAME = "encryption-key"


class ConfigStore:
    def __init__(self, config_dir: Path | None = None) -> None:
        self.config_dir = config_dir or Path.home() / ".nexus"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.config_path = self.config_dir / "config.enc"
        self._fernet = self._load_or_create_fernet()

    def _load_or_create_fernet(self) -> Fernet:
        key: str | None = None
        try:
            key = keyring.get_password(_SERVICE_NAME, _KEYRING_USERNAME)
        except Exception:
            key = None  # No usable keyring backend on this system.

        fallback_key_path = self.config_dir / ".keyring_fallback"

        if key is None and fallback_key_path.exists():
            key = fallback_key_path.read_text().strip()

        if key is None:
            key = Fernet.generate_key().decode("utf-8")
            try:
                keyring.set_password(_SERVICE_NAME, _KEYRING_USERNAME, key)
            except Exception:
                fallback_key_path.write_text(key)
                try:
                    fallback_key_path.chmod(0o600)
                except Exception:
                    pass  # Best-effort on platforms without POSIX permissions.

        return Fernet(key.encode("utf-8"))

    def _read(self) -> dict:
        if not self.config_path.exists():
            return {"active_provider": None, "keys": {}}

        encrypted = self.config_path.read_bytes()
        try:
            decrypted = self._fernet.decrypt(encrypted)
        except InvalidToken:
            # Config was encrypted with a different key (or is corrupt) —
            # treat it as absent rather than crashing the app.
            return {"active_provider": None, "keys": {}}

        return json.loads(decrypted.decode("utf-8"))

    def _write(self, data: dict) -> None:
        payload = json.dumps(data).encode("utf-8")
        encrypted = self._fernet.encrypt(payload)
        self.config_path.write_bytes(encrypted)
        try:
            self.config_path.chmod(0o600)
        except Exception:
            pass

    def get_active_provider(self) -> str | None:
        return self._read().get("active_provider")

    def save_provider_key(self, provider: str, api_key: str) -> None:
        data = self._read()
        data.setdefault("keys", {})[provider] = api_key
        data["active_provider"] = provider
        self._write(data)

    def get_provider_key(self, provider: str) -> str | None:
        return self._read().get("keys", {}).get(provider)

    def clear(self) -> None:
        if self.config_path.exists():
            self.config_path.unlink()