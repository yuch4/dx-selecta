#!/usr/bin/env python3
"""
Lightweight validator for Agent Skills under .github/skills.
- Checks: SKILL.md existence, YAML frontmatter presence, name regex, line count, etc.
Designed to be run and only its OUTPUT used (progressive disclosure friendly).
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

NAME_RE = re.compile(r"^[a-z0-9-]{1,64}$")

def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")

def extract_frontmatter(md: str) -> dict[str, str] | None:
    # Very small parser: expects leading --- ... ---
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
        fm[k.strip()] = v.strip()
    return fm

def validate_skill_dir(skill_dir: Path) -> list[str]:
    errs: list[str] = []
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return [f"P0 missing SKILL.md: {skill_dir}"]

    text = read_text(skill_md)
    lines = text.splitlines()
    if len(lines) > 500:
        errs.append(f"P1 SKILL.md too long (>500 lines): {skill_md} ({len(lines)} lines)")

    fm = extract_frontmatter(text)
    if fm is None:
        errs.append(f"P0 missing/invalid YAML frontmatter: {skill_md}")
        return errs

    name = fm.get("name", "")
    desc = fm.get("description", "")

    if not name:
        errs.append(f"P0 missing name in frontmatter: {skill_md}")
    elif not NAME_RE.match(name):
        errs.append(f"P0 invalid name '{name}' (must match ^[a-z0-9-]{{1,64}}$): {skill_md}")

    # Directory name match is "recommended", treat as P2
    if name and skill_dir.name != name:
        errs.append(f"P2 directory name '{skill_dir.name}' differs from skill name '{name}': {skill_dir}")

    if not desc:
        errs.append(f"P0 missing description in frontmatter: {skill_md}")
    elif len(desc) > 1024:
        errs.append(f"P1 description too long (>1024 chars): {skill_md} ({len(desc)} chars)")

    return errs

def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".github/skills")
    if not root.exists():
        print(f"P0 skills root not found: {root}")
        return 2

    problems: list[str] = []
    for d in sorted(root.iterdir()):
        if d.is_dir():
            problems.extend(validate_skill_dir(d))

    if not problems:
        print("OK: no problems found")
        return 0

    # Group by severity order
    order = {"P0": 0, "P1": 1, "P2": 2}
    problems.sort(key=lambda s: order.get(s.split()[0], 9))
    for p in problems:
        print(p)
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
