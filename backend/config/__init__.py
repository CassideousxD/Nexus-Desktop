"""
Config module — loading, storing, and encrypting user-supplied API keys and
provider selection.

Stubbed for now. Intended approach (see docs/architecture.md):
- Store a small local config file (provider name + encrypted key blob).
- Encrypt at rest using `cryptography.fernet` with a key held via `keyring`
  (OS-native credential store), so the key material itself never sits in
  plaintext next to the encrypted config.
"""

from .store import ConfigStore

__all__ = ["ConfigStore"]