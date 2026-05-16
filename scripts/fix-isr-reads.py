#!/usr/bin/env python3
"""
Fix Vercel ISR Read overhead by ensuring every SSG page has explicit
`export const revalidate = false` (pure SSG, no Data Cache layer) and
`export const dynamicParams = false` where the curated list is exhaustive.

- Skips routes already exporting revalidate / dynamicParams.
- Skips API routes (route.ts) — those are handled via Cache-Control headers.
- Preserves `dynamicParams = true` for the two open-ended routes
  (/comparer/[pair], /quitter/[pair]).
"""

import os
import re
from pathlib import Path

ROOT = Path("/home/flammeur/meilleurville/app")

# Routes that must keep dynamicParams=true (open-ended user input)
KEEP_DYNAMIC_PARAMS_TRUE = {
    "app/comparer/[pair]/page.tsx",
    "app/quitter/[pair]/page.tsx",
}

CONFIG_BLOCK = """
// ISR Reads optimization: pure SSG (no Vercel Data Cache layer) — see
// next.config.ts justification. revalidate=false means the page is built
// once at deploy time and served from the static edge cache forever
// (until next deploy), which avoids consuming ISR Reads per request.
export const revalidate = false;
"""

CONFIG_BLOCK_CLOSED = """
// ISR Reads optimization: pure SSG. dynamicParams=false so only the
// curated generateStaticParams() output ships; everything else 404s,
// preventing ISR Writes from random URL crawling.
export const revalidate = false;
export const dynamicParams = false;
"""


def has_generate_static_params(content: str) -> bool:
    return "generateStaticParams" in content


def has_revalidate(content: str) -> bool:
    return re.search(r"^export\s+const\s+revalidate\b", content, re.MULTILINE) is not None


def has_dynamic_params(content: str) -> bool:
    return re.search(r"^export\s+const\s+dynamicParams\b", content, re.MULTILINE) is not None


def find_insertion_point(content: str) -> int:
    """Insert after the last top-level import statement."""
    last_import = 0
    for m in re.finditer(r"^import\s.+$", content, re.MULTILINE):
        last_import = m.end()
    if last_import == 0:
        return 0
    # Skip to end of that line
    return last_import + 1


def process_file(path: Path) -> str:
    rel = path.relative_to(ROOT.parent)
    content = path.read_text()
    if not has_generate_static_params(content):
        return f"SKIP {rel}: no generateStaticParams"

    insertion_point = find_insertion_point(content)
    keep_open = str(rel) in KEEP_DYNAMIC_PARAMS_TRUE
    block = CONFIG_BLOCK if keep_open else CONFIG_BLOCK_CLOSED

    additions = []
    skip_revalidate = has_revalidate(content)
    skip_dynamic_params = has_dynamic_params(content)

    if skip_revalidate and skip_dynamic_params:
        return f"SKIP {rel}: already configured"

    # Build the addition based on what's missing
    parts = []
    if "\n// ISR Reads optimization" not in content:
        parts.append("// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).")
        parts.append("// revalidate=false → page built once at deploy, served from static edge cache.")
    if not skip_revalidate:
        parts.append("export const revalidate = false;")
    if not skip_dynamic_params and not keep_open:
        parts.append("export const dynamicParams = false;")

    if not parts:
        return f"SKIP {rel}: nothing to add"

    addition = "\n" + "\n".join(parts) + "\n"
    new_content = content[:insertion_point] + addition + content[insertion_point:]
    path.write_text(new_content)
    return f"PATCH {rel}: added {len(parts)} export(s){'  (open-ended)' if keep_open else ''}"


def main():
    results = []
    for path in ROOT.rglob("page.tsx"):
        results.append(process_file(path))
    for r in sorted(results):
        print(r)
    n_patched = sum(1 for r in results if r.startswith("PATCH"))
    n_skipped = sum(1 for r in results if r.startswith("SKIP"))
    print(f"\n→ Patched {n_patched}, skipped {n_skipped}")


if __name__ == "__main__":
    main()
