"""
Script to copy and merge pixel-perfect-replica-main frontend into nexus/src
"""

import os
import shutil
from pathlib import Path

src_replica = Path("pixel-perfect-replica-main/src")
target_src = Path("src")

# Ensure target directories exist
for item in src_replica.rglob("*"):
    rel_path = item.relative_to(src_replica)
    target_path = target_src / rel_path

    if item.is_dir():
        target_path.mkdir(parents=True, exist_ok=True)
    elif item.is_file():
        # Do not overwrite api/ directory if target exists
        if "api" in rel_path.parts and target_path.exists():
            continue
        shutil.copy2(item, target_path)
        print(f"Copied {rel_path} -> {target_path}")

print("Frontend files copied successfully!")
