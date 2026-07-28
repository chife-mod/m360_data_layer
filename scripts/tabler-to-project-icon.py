#!/usr/bin/env python3
"""
Convert a stock Tabler outline icon (24x24) into this project's icon format (32x32).

Why this exists
---------------
The icons already in `public/assets/icons/` are Tabler glyphs whose geometry was
scaled 24 -> 32 while `stroke-width` stayed at 2. That makes their stroke
proportionally thinner than stock Tabler (2/32 instead of 2/24), and it is the
look the cards were designed around.

`DataCard` rewrites `stroke-width="..."` at runtime (2 normal, 1 disabled) with a
regex, so the attribute must literally be on the paths and must be correct in a
32-unit space. That rules out wrapping the paths in `transform="scale(4/3)"` — a
group transform would also scale the stroke, and the regex would keep clobbering
the compensation. So the coordinates themselves are scaled here.

Arc handling: in `A rx ry x-axis-rotation large-arc-flag sweep-flag x y`, only
rx, ry, x and y are lengths. The rotation and the two flags must pass through
untouched, which is exactly what a naive "multiply every number" pass gets wrong.

Usage:
    python3 scripts/tabler-to-project-icon.py <tabler-name> <output-name>
    python3 scripts/tabler-to-project-icon.py --batch <mapping.tsv>
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLER_DIR = ROOT / "node_modules" / "@tabler" / "icons" / "icons" / "outline"
OUT_DIR = ROOT / "public" / "assets" / "icons"

SCALE = 32 / 24  # 1.333...

NUM = re.compile(r"-?\d*\.?\d+(?:e[-+]?\d+)?", re.I)
CMD = re.compile(r"([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)")

# How many params per command, and which slots are NOT lengths (must not scale).
ARC_PASSTHROUGH = {2, 3, 4}  # x-axis-rotation, large-arc-flag, sweep-flag


def fmt(v: float) -> str:
    s = f"{v:.4f}".rstrip("0").rstrip(".")
    return s if s not in ("", "-0") else "0"


def scale_path(d: str, k: float) -> str:
    out = []
    for cmd, raw in CMD.findall(d):
        nums = NUM.findall(raw)
        low = cmd.lower()

        if low == "z":
            out.append(cmd)
            continue

        if low == "a":
            scaled = []
            for i, n in enumerate(nums):
                slot = i % 7
                scaled.append(n if slot in ARC_PASSTHROUGH else fmt(float(n) * k))
        else:
            # M/L/C/S/Q/T/H/V — every parameter is a length or a delta.
            scaled = [fmt(float(n) * k) for n in nums]

        out.append(cmd + " " + " ".join(scaled) if scaled else cmd)

    return " ".join(out).strip()


def convert(tabler_name: str, out_name: str) -> Path:
    src = TABLER_DIR / f"{tabler_name}.svg"
    if not src.exists():
        raise SystemExit(f"Tabler icon not found: {src}")

    svg = src.read_text()
    paths = re.findall(r'<path\b[^>]*\bd="([^"]+)"[^>]*/?>', svg)

    body = []
    for d in paths:
        # Tabler ships a transparent 24x24 bounding path first — drop it.
        if re.match(r"^\s*M0\s+0h24v24H0z\s*$", d.replace(" ", " ")) or d.strip().startswith("M0 0h24v24H0z"):
            continue
        body.append(
            f'<path d="{scale_path(d, SCALE)}" stroke="currentColor" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        )

    if not body:
        raise SystemExit(f"No drawable paths extracted from {tabler_name}")

    out = (
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" '
        'xmlns="http://www.w3.org/2000/svg">\n<g>\n'
        + "\n".join(body)
        + "\n</g>\n</svg>\n"
    )

    dst = OUT_DIR / f"{out_name}.svg"
    dst.write_text(out)
    return dst


def main() -> None:
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == "--batch":
        pairs = [
            line.split()
            for line in Path(args[1]).read_text().splitlines()
            if line.strip() and not line.startswith("#")
        ]
    elif len(args) == 2:
        pairs = [args]
    else:
        raise SystemExit(__doc__)

    for tabler_name, out_name in pairs:
        dst = convert(tabler_name, out_name)
        print(f"  {tabler_name:<22} -> {dst.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
