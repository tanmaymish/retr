#!/usr/bin/env python3
"""Extract the 25 wireframe screens from the Claude Design export into a JSON
data file the React app can render, applying the Safebox -> Akshayvridhi
rebrand. Run once at authoring time (not part of the build)."""
import html
import json
import re
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[2] / "project" / "Safebox Wireframes.dc.html"
OUT = Path(__file__).resolve().parents[1] / "src" / "data" / "screens.json"

REPLACEMENTS = [
    ("Safebox.life", "Akshayvridhi"),
    ("SAFEBOX", "AKSHAYVRIDHI"),
    ("Safebox", "Akshayvridhi"),
]


def rebrand(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    return text


def find_matching_close(text: str, open_idx: int, open_tag: str, close_tag: str) -> int:
    """open_idx points at the '<' of the opening tag. Returns the index just
    after the matching close tag, counting nested opens of the same tag."""
    depth = 0
    i = open_idx
    n = len(text)
    open_re = re.compile(re.escape(open_tag))
    while i < n:
        o = text.find(open_tag, i)
        c = text.find(close_tag, i)
        if c == -1:
            raise ValueError("unterminated tag")
        if o != -1 and o < c:
            depth += 1
            i = o + len(open_tag)
        else:
            depth -= 1
            i = c + len(close_tag)
            if depth == 0:
                return i
    raise ValueError("unbalanced")


def extract_blocks(text: str, open_tag: str, close_tag: str):
    """Yield (start, end) spans for each top-level (non-nested-in-a-sibling)
    occurrence of open_tag...close_tag, depth-matched."""
    i = 0
    spans = []
    while True:
        o = text.find(open_tag, i)
        if o == -1:
            break
        end = find_matching_close(text, o, open_tag, close_tag)
        spans.append((o, end))
        i = end
    return spans


def strip_tags(text: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", text)).strip()


def parse_x_imports(block_html: str):
    """Find every <x-import ...>...</x-import> in block_html (not nested)."""
    panels = []
    i = 0
    while True:
        o = block_html.find("<x-import", i)
        if o == -1:
            break
        tag_end = block_html.find(">", o)
        attrs_str = block_html[o:tag_end]
        close = block_html.find("</x-import>", tag_end)
        inner = block_html[tag_end + 1:close]
        i = close + len("</x-import>")

        def attr(name):
            m = re.search(name + r'="([^"]*)"', attrs_str)
            return m.group(1) if m else None

        comp = attr("component-from-global-scope")
        title = attr("title")
        panels.append({
            "type": "ios" if comp == "IOSDevice" else "android",
            "title": rebrand(title) if title else title,
            "large": attr("large") == "true",
            "html": rebrand(inner.strip()),
        })
    return panels


def parse_dv_cards(block_html: str):
    """Find every top-level <div class="dv-card" ...>...</div> in block_html."""
    panels = []
    i = 0
    while True:
        o = block_html.find('<div class="dv-card"', i)
        if o == -1:
            break
        tag_end = block_html.find(">", o)
        attrs_str = block_html[o:tag_end]
        end = find_matching_close(block_html, o, "<div", "</div>")
        inner = block_html[tag_end + 1:end - len("</div>")]
        i = end
        m = re.search(r"width:(\d+)px", attrs_str)
        width = int(m.group(1)) if m else None
        panels.append({
            "type": "card",
            "width": width,
            "html": rebrand(inner.strip()),
        })
    return panels


def main():
    text = SRC.read_text(encoding="utf-8")

    turns = []
    for tspan in extract_blocks(text, '<section class="dv-turn"', "</section>"):
        tstart, tend = tspan
        section_html = text[tstart:tend]
        turn_id = re.search(r'id="(t\d)"', section_html).group(1)
        turn_number = int(turn_id[1:])
        turn_name = strip_tags(re.search(r'<span class="dv-tname">(.*?)</span>', section_html, re.S).group(1))
        turn_name = rebrand(turn_name)
        desc_m = re.search(r'<p style="margin:0 0 22px[^"]*">(.*?)</p>', section_html, re.S)
        turn_desc = rebrand(strip_tags(desc_m.group(1))) if desc_m else ""

        screens = []
        # dv-opt blocks live inside <div class="dv-opts">...</div>; find them
        # directly by scanning for `<div class="dv-opt" id="`.
        i = 0
        while True:
            o = section_html.find('<div class="dv-opt" id="', i)
            if o == -1:
                break
            end = find_matching_close(section_html, o, "<div", "</div>")
            block = section_html[o:end]
            sid = re.search(r'id="([^"]+)"', block).group(1)
            i = end

            label_m = re.search(r'<div class="dv-olabel">(.*?)</div>\s*(?=(<div|<x-import))', block, re.S)
            # dv-olabel div itself is depth-balanced (contains only an <a> child)
            olabel_o = block.find('<div class="dv-olabel">')
            olabel_end = find_matching_close(block, olabel_o, "<div", "</div>")
            label_html = block[olabel_o:olabel_end]
            label_text = strip_tags(re.sub(r"<a[^>]*>[^<]*</a>", "", label_html))
            label_text = rebrand(label_text.strip())

            rest = block[olabel_end:]
            panels = parse_x_imports(rest) + parse_dv_cards(rest)

            screens.append({
                "id": sid,
                "label": label_text,
                "panels": panels,
                "interactive": sid == "4a",
            })

        turns.append({
            "id": turn_id,
            "number": turn_number,
            "name": turn_name,
            "description": turn_desc,
            "screens": screens,
        })

    turns.sort(key=lambda t: t["number"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"turns": turns}, indent=2, ensure_ascii=False), encoding="utf-8")
    total_screens = sum(len(t["screens"]) for t in turns)
    total_panels = sum(len(s["panels"]) for t in turns for s in t["screens"])
    print(f"Wrote {OUT} — {len(turns)} turns, {total_screens} screens, {total_panels} panels")


if __name__ == "__main__":
    sys.exit(main())
