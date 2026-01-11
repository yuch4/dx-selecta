#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path

NAME_RE = re.compile(r"^[a-z0-9-]{1,64}$")
INPUT_RE = re.compile(r"\$\{input:[^}]+}")

def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")

def extract_frontmatter(md: str) -> dict[str, str] | None:
    if not md.startswith("---"):
        return None
    end = md.find("\n---", 3)
    if end == -1:
        return None
    block = md[3:end].strip("\n")
    fm: dict[str, str] = {}
    for line in block.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm

def validate_prompt(p: Path) -> list[str]:
    errs: list[str] = []
    text = read_text(p)
    fm = extract_frontmatter(text)
    if fm is None:
        return [f"P0 missing/invalid YAML frontmatter: {p}"]

    name = fm.get("name", "")
    desc = fm.get("description", "")
    if not name:
        errs.append(f"P0 missing name: {p}")
    elif not NAME_RE.match(name):
        errs.append(f"P0 invalid name '{name}': {p}")
    if not desc:
        errs.append(f"P0 missing description: {p}")

    # Basic reusability check: at least 1 input variable (recommend 2+ but keep as P1)
    inputs = INPUT_RE.findall(text)
    if len(inputs) == 0:
        errs.append(f"P1 no ${'{input:...}'} variables found (hard to reuse): {p}")
    elif len(inputs) == 1:
        errs.append(f"P2 only 1 ${'{input:...}'} variable found (consider 2+): {p}")

    # Output stability hint
    if "Output" not in text and "出力" not in text:
        errs.append(f"P2 no explicit output format section found: {p}")

    return errs

def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".github/prompts")
    if not root.exists():
        print(f"P0 prompts root not found: {root}")
        return 2

    problems: list[str] = []
    for p in sorted(root.glob("*.prompt.md")):
        problems.extend(validate_prompt(p))

    if not problems:
        print("OK: no problems found")
        return 0

    order = {"P0": 0, "P1": 1, "P2": 2}
    problems.sort(key=lambda s: order.get(s.split()[0], 9))
    for line in problems:
        print(line)
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
