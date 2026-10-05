# Nexus Desktop Build & Development Guide

This guide covers development workflows and production distributable packaging for **Nexus Desktop** (macOS and Windows).

---

## 1. Prerequisites

### Universal Requirements
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Python**: >= 3.10 (only needed by developers to freeze the sidecar; end users do NOT need Python)
- **Rust**: >= 1.77.0 (`rustup` toolchain with `cargo` and `rustc`)

### Platform-Specific Tools
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Windows**: Microsoft C++ Build Tools (MSVC v143 or newer) and WebView2 (preinstalled on Windows 10/11)

---

## 2. Development Workflows

### Web Development Mode (Browser)
Run frontend with hot reload and backend in standalone reload mode:

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
npm install
npm run dev                    # Runs Vite on http://localhost:1420
```

### Desktop Development Mode (Tauri)
Run the desktop app directly with hot reloading:

```bash
# 1. Build the sidecar binary once for your machine:
npm run build:sidecar

# 2. Run Tauri dev (spawns Vite dev server and native desktop window):
npm run dev:desktop
```

---

## 3. Production Builds

### macOS Build (`.app` and `.dmg`)

To produce the native macOS distributables:

```bash
# 1. Install dependencies
npm install

# 2. Package sidecar & build macOS app + DMG
npm run build:mac
```

Output artifacts:
- Application Bundle: `src-tauri/target/release/bundle/macos/Nexus.app`
- Disk Image: `src-tauri/target/release/bundle/dmg/Nexus_0.0.1_aarch64.dmg` (or `x86_64.dmg` on Intel Macs)

### Windows Build (NSIS `.exe` Installer)

To produce the Windows installer executable:

```bash
# On a Windows host machine with Python and MSVC installed:
npm install
npm run build:windows
```

Output artifacts:
- NSIS Installer: `src-tauri/target/release/bundle/nsis/Nexus_0.0.1_x64-setup.exe`

The NSIS installer will:
- Install the application to `%LOCALAPPDATA%\Programs\Nexus`
- Create Start Menu shortcuts
- Create an optional Desktop icon
- Bundle all web assets and the frozen Python sidecar
- Provide a clean uninstaller in Windows Settings / Control Panel

---

## 4. Build Scripts Reference

| Command | Purpose |
|---|---|
| `npm run dev` | Runs Vite web dev server on port 1420 |
| `npm run dev:desktop` | Launches Tauri desktop shell pointing to live Vite dev server |
| `npm run build` | Compiles TypeScript (`tsc`) and bundles frontend with Vite (`dist/`) |
| `npm run build:sidecar` | Freezes Python FastAPI + ChromaDB into native sidecar binary via PyInstaller |
| `npm run build:desktop` | Runs `build:sidecar` followed by default `tauri build` |
| `npm run build:mac` | Produces macOS `.app` and `.dmg` bundles |
| `npm run build:windows` | Produces Windows NSIS `.exe` setup installer |

---

## 5. End-User Installation & Requirements

End users **DO NOT** need:
- Node.js or npm
- Python or pip
- Rust or cargo
- Terminal access or manually starting servers

The distributed application (`.dmg`, `.app`, `.exe`) is completely self-contained. On first launch, Nexus boots its local storage, initializes its vector database and SQLite metadata store in `~/.nexus/`, and launches the search interface.
