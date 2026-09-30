"""
Cross-platform sidecar build & placement script for Nexus.

1. Runs PyInstaller with backend/nexus-backend.spec
2. Queries `rustc -vV` for the host target triple (e.g. x86_64-pc-windows-msvc)
3. Copies the binary to ../src-tauri/binaries/nexus-backend-<target-triple>[.exe]
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path


def get_rust_target_triple() -> str:
    try:
        res = subprocess.run(["rustc", "-vV"], capture_output=True, text=True, check=True)
    except FileNotFoundError:
        print("ERROR: `rustc` binary was not found on PATH. Please install Rust and ensure rustc is in PATH.", file=sys.stderr)
        sys.exit(1)
    except subprocess.CalledProcessError as exc:
        print(f"ERROR: Failed to run `rustc -vV`: {exc}", file=sys.stderr)
        sys.exit(1)

    for line in res.stdout.splitlines():
        if line.startswith("host:"):
            return line.split(":", 1)[1].strip()

    print("ERROR: Could not parse `host:` line from `rustc -vV` output.", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    backend_dir = Path(__file__).resolve().parent
    spec_path = backend_dir / "nexus-backend.spec"
    dist_dir = backend_dir / "dist"
    binaries_dir = backend_dir.parent / "src-tauri" / "binaries"

    if not spec_path.exists():
        print(f"ERROR: PyInstaller spec file missing at {spec_path}", file=sys.stderr)
        sys.exit(1)

    print("Step 1: Building PyInstaller executable from nexus-backend.spec...")
    pyinstaller_cmd = [sys.executable, "-m", "PyInstaller", str(spec_path)]
    try:
        subprocess.run(pyinstaller_cmd, cwd=str(backend_dir), check=True)
    except subprocess.CalledProcessError as exc:
        print(f"ERROR: PyInstaller build failed with exit code {exc.returncode}", file=sys.stderr)
        sys.exit(1)

    print("Step 2: Detecting Rust target triple...")
    triple = get_rust_target_triple()
    print(f"Detected target triple: {triple}")

    is_windows = sys.platform == "win32"
    exe_suffix = ".exe" if is_windows else ""

    src_binary = dist_dir / f"nexus-backend{exe_suffix}"
    if not src_binary.exists():
        print(f"ERROR: Expected PyInstaller binary not found at {src_binary}", file=sys.stderr)
        sys.exit(1)

    binaries_dir.mkdir(parents=True, exist_ok=True)
    target_binary_name = f"nexus-backend-{triple}{exe_suffix}"
    target_path = binaries_dir / target_binary_name

    print(f"Step 3: Copying {src_binary.name} to {target_path}...")
    shutil.copy2(src_binary, target_path)

    if not target_path.exists():
        print(f"ERROR: Failed to copy sidecar binary to {target_path}", file=sys.stderr)
        sys.exit(1)

    print(f"\n✅ SUCCESS: Sidecar binary created and placed at:\n{target_path}")


if __name__ == "__main__":
    main()
