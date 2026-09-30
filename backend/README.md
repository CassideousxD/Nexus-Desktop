# Nexus Backend

FastAPI service that will eventually handle indexing, embedding, and hybrid search.
During development it runs standalone (`uvicorn main:app --reload`). In production
it is frozen into a single binary and launched by Tauri as a **sidecar process** —
the frontend never requires a system Python install.

## Planned packaging approach (not yet implemented)

1. Freeze the FastAPI app with **PyInstaller** into a single executable:
```bash
   pyinstaller --onefile --name nexus-backend main.py
```
2. Place the resulting binary under `src-tauri/binaries/`, named per Tauri's
   sidecar convention (e.g. `nexus-backend-x86_64-pc-windows-msvc.exe`,
   `nexus-backend-x86_64-apple-darwin`, `nexus-backend-x86_64-unknown-linux-gnu`),
   one build per target platform.
3. Reference it in `src-tauri/tauri.conf.json` under `bundle.externalBin`, and
   spawn it from Rust via the `tauri-plugin-shell` sidecar API on app startup.
4. The frontend's `src/api/` client talks to it over `http://localhost:<port>`
   exactly as it does in development — the only change is who launches the
   process.

Open questions (port selection/collision handling, graceful shutdown, and
whether the binary is per-arch or universal) are tracked in
`docs/architecture.md`.

## Running standalone (development)

```bash
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then hit `http://localhost:8000/health`.