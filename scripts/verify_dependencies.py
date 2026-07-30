#!/usr/bin/env python3
"""Verifica offline e senza dipendenze le skill vendorizzate/installate."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STORY_SKILLS = (
    "chapter-writing", "character-management", "plot-structure",
    "revision-continuity", "story-init", "story-maintenance", "worldbuilding",
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="emette un singolo oggetto JSON")
    args = parser.parse_args()
    errors: list[dict[str, str]] = []
    checked: list[str] = []

    required = [
        ROOT / "dependencies.lock.yaml",
        ROOT / "vendor/story-skills/LICENSE",
        ROOT / "vendor/better-writing/LICENSE",
        ROOT / ".opencode/skills/better-writing/SKILL.md",
        ROOT / ".opencode/skills/beat-adapter/SKILL.md",
    ] + [ROOT / ".opencode/skills" / name / "SKILL.md" for name in STORY_SKILLS]

    for path in required:
        relative = str(path.relative_to(ROOT))
        checked.append(relative)
        if not path.is_file():
            errors.append({"code": "missing_file", "path": relative})
            continue
        if path.name == "SKILL.md":
            text = path.read_text(encoding="utf-8")
            if not text.startswith("---\n") or "\nname:" not in text or "\ndescription:" not in text:
                errors.append({"code": "invalid_skill_frontmatter", "path": relative})

    broken = [str(p.relative_to(ROOT)) for base in (ROOT / "vendor", ROOT / ".opencode/skills")
              for p in base.rglob("*") if p.is_symlink() and not p.exists()]
    errors.extend({"code": "broken_symlink", "path": path} for path in broken)

    result = {
        "schema": "dependency-verification/v1",
        "ok": not errors,
        "checked": checked,
        "installed_story_skills": list(STORY_SKILLS),
        "better_writing": "installed" if not any("better-writing" in e["path"] for e in errors) else "invalid",
        "errors": errors,
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"Dependency verification: {'PASS' if result['ok'] else 'FAIL'}")
        print(f"Checked files: {len(checked)}")
        for error in errors:
            print(f"ERROR [{error['code']}] {error['path']}")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
