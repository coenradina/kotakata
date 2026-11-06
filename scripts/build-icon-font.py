#!/usr/bin/env python3
"""Builds Kotakata's pixel icon font from the grids in src/icons/art/*.json.

Every emoji and UI symbol the app uses gets a pixel glyph. Colour icons
become COLR v0 layers in the site palette; one-colour icons ("mono") are
plain outlines, so they take the text colour. The font goes first in the
page's font stacks, and its unicode-range limits it to these characters,
so it never changes how ordinary text looks or how lines are spaced.

Run it after changing any art file, then commit both outputs:
    python3 -m pip install fonttools brotli
    python3 scripts/build-icon-font.py

Writes src/assets/kk-icons.woff2, src/icons/icons.css and src/icons/codepoints.json.
"""
import json
import re
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.colorLib.builder import buildCOLR, buildCPAL

ROOT = Path(__file__).resolve().parent.parent
FAMILY = 'KK Icons'
PX = 100  # font units per grid pixel
TOP = 1000  # top edge of grid row 0; rows 10 and 11 hang below the baseline
BLEED = 3  # each colour layer overlaps its neighbours a little, so no seams show

css = (ROOT / 'src/styles/tokens.css').read_text() + (ROOT / 'src/styles/art.css').read_text()
hexes = {m[1]: m[2] for m in re.finditer(r'--(?:color|art)-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})', css)}
palette_map = {k: v for k, v in json.loads((ROOT / 'src/icons/palette.json').read_text()).items() if not k.startswith('_')}

icons = {}
for f in sorted((ROOT / 'src/icons/art').glob('*.json')):
    for name, icon in json.loads(f.read_text()).items():
        if name in icons:
            raise SystemExit(f'{f.name}: icon name {name} is used twice')
        icons[name] = icon


def runs(rows, keep):
    """Horizontal runs of pixels whose colour passes keep(ch), as (x, y, length)."""
    for y, row in enumerate(rows):
        x = 0
        while x < len(row):
            if keep(row[x]):
                start = x
                while x < len(row) and keep(row[x]):
                    x += 1
                yield start, y, x - start
            else:
                x += 1


def outline(rows, keep, bleed=0):
    """The glyph, and its left edge (TrueType renderers move a glyph so its left edge sits at the side bearing)."""
    pen = TTGlyphPen(None)
    left = None
    for x, y, n in runs(rows, keep):
        x0, x1 = PX // 2 + x * PX - bleed, PX // 2 + (x + n) * PX + bleed
        y1, y0 = TOP - y * PX + bleed, TOP - (y + 1) * PX - bleed
        left = x0 if left is None else min(left, x0)
        pen.moveTo((x0, y0))
        pen.lineTo((x0, y1))
        pen.lineTo((x1, y1))
        pen.lineTo((x1, y0))
        pen.closePath()
    return pen.glyph(), left or 0


order = ['.notdef', 'space', 'zwj', 'vs16']
glyphs = {g: TTGlyphPen(None).glyph() for g in order}
advances = {'.notdef': (600, 0), 'space': (600, 0), 'zwj': (0, 0), 'vs16': (0, 0)}
cmap = {0x20: 'space', 0x200D: 'zwj', 0xFE0F: 'vs16'}
colr = {}
colours = []  # CPAL entries, in order
ligatures = []
seen = {}

for name, icon in icons.items():
    rows = icon['rows']
    width = len(rows[0])
    if len(rows) != 12 or any(len(r) != width for r in rows) or width > 12:
        raise SystemExit(f'{name}: grids must be 12 rows of equal width, at most 12')
    char = icon['char'].replace('️', '')
    if char in seen:
        raise SystemExit(f'{name}: {char} is already drawn as {seen[char]}')
    seen[char] = name
    gname = f'i.{name}'
    order.append(gname)
    glyphs[gname], left = outline(rows, lambda ch: ch != '.')
    advances[gname] = ((width + 1) * PX, left)
    if not icon.get('mono'):
        used = {}
        for row in rows:
            for ch in row:
                if ch != '.':
                    used[ch] = used.get(ch, 0) + 1
        layers = []
        # Biggest areas first, so the small details paint on top of them.
        for ch in sorted(used, key=lambda c: -used[c]):
            if ch == 'x' or ch not in palette_map:
                raise SystemExit(f'{name}: colour {ch!r} is not in the palette')
            colour = hexes[palette_map[ch]]
            if colour not in colours:
                colours.append(colour)
            lname = f'{gname}.{ch}'
            order.append(lname)
            glyphs[lname], left = outline(rows, lambda c, ch=ch: c == ch, BLEED)
            advances[lname] = (advances[gname][0], left)
            layers.append((lname, colours.index(colour)))
        colr[gname] = layers
    codepoints = [ord(c) for c in char]
    if len(codepoints) == 1:
        cmap[codepoints[0]] = gname
    else:
        ligatures.append((codepoints, gname))

# Parts of a ligature that have no icon of their own still need a glyph to substitute from.
for codepoints, _ in ligatures:
    for cp in codepoints:
        if cp not in cmap:
            g = f'u{cp:04X}'
            order.append(g)
            glyphs[g] = TTGlyphPen(None).glyph()
            advances[g] = (0, 0)
            cmap[cp] = g

fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(advances)
fb.setupHorizontalHeader(ascent=1000, descent=-250)
fb.setupNameTable({'familyName': FAMILY, 'styleName': 'Regular'})
fb.setupOS2(sTypoAscender=1000, sTypoDescender=-250, usWinAscent=1000, usWinDescent=250)
fb.setupPost()
font = fb.font
font['COLR'] = buildCOLR(colr, version=0)
font['CPAL'] = buildCPAL([[tuple(int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)) + (1.0,) for c in colours]])
if ligatures:
    rules = '\n'.join(f"  sub {' '.join(cmap[cp] for cp in cps)} by {g};" for cps, g in ligatures)
    addOpenTypeFeaturesFromString(font, f'feature ccmp {{\n{rules}\n}} ccmp;\nfeature liga {{\n{rules}\n}} liga;\n')

font.flavor = 'woff2'
out = ROOT / 'src/assets/kk-icons.woff2'
out.parent.mkdir(exist_ok=True)
font.save(out)

points = sorted(cp for cp in cmap if cp != 0x20)
ranges = ', '.join(f'U+{cp:X}' for cp in points)
(ROOT / 'src/icons/icons.css').write_text(
    '/* Generated by scripts/build-icon-font.py. Do not edit by hand. */\n'
    '@font-face {\n'
    f"  font-family: '{FAMILY}';\n"
    "  src: url('../assets/kk-icons.woff2') format('woff2');\n"
    '  font-display: block;\n'
    f'  unicode-range: {ranges};\n'
    '}\n'
)
(ROOT / 'src/icons/codepoints.json').write_text(json.dumps([f'U+{cp:X}' for cp in points]) + '\n')
print(f'{len(icons)} icons, {len(colours)} colours, {out.stat().st_size} bytes -> {out.relative_to(ROOT)}')
