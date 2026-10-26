#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render THOT's original typographic Open Graph cards with Pillow.

No network access, photos, random data or website build dependency.
Run with --help for generation and deterministic verification commands.
"""
from __future__ import annotations
import portable_io  # Encodage CLI stable, sans dépendance système.

import argparse
from dataclasses import dataclass
from io import BytesIO
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, features

ROOT = Path(__file__).resolve().parents[1]
SIZE = (1200, 630)
SCALE = 2
NAVY = '#17243A'
CREAM = '#F8F6F1'
GOLD = '#B89558'
MUTED = '#455164'
DEFAULT_FONT_DIR = ROOT / 'tools' / 'fonts' / 'dejavu'


@dataclass(frozen=True)
class Card:
    category: str
    lines: tuple[str, ...]
    alt: str

    @property
    def title(self) -> str:
        return ' '.join(self.lines)


# Add a new article here, then add its original composition in draw_artwork().
# Titles are deliberately short; article H1s remain the editorial reference.
CARDS = {
    'autorite': Card(
        'PSYCHOLOGIE · SOCIÉTÉ',
        ('Face à l’autorité,', 'pourquoi réagit-on', 'différemment ?'),
        'THOT — Face à l’autorité, pourquoi réagit-on différemment ? '
        'Trois trajectoires géométriques sous un même cercle.'),
    'autrices-pseudonymes': Card(
        'LITTÉRATURE · HISTOIRE',
        ('Autrices, pourquoi', 'un nom d’homme ?'),
        'THOT — Autrices, pourquoi un nom d’homme ? '
        'Deux lettres A sur des feuillets géométriques superposés.'),
    'pieuvres-couleur': Card(
        'SCIENCES · VIVANT',
        ('Comment les pieuvres', 'changent de couleur'),
        'THOT — Comment les pieuvres changent de couleur. '
        'Un motif circulaire évoque les cellules colorées de leur peau.'),
    'puissance-etats-unis': Card(
        'GÉOPOLITIQUE · MONDE',
        ('Les limites de la', 'puissance américaine'),
        'THOT — Les limites de la puissance américaine. '
        'Un globe géométrique relié à plusieurs points.'),
    'roubaix-1917': Card(
        'HISTOIRE · MÉMOIRES',
        ('Roubaix, 1917', 'Vivre sous l’occupation'),
        'THOT — Roubaix, 1917 : vivre sous l’occupation. '
        'La date 1917 se détache sur une trame urbaine abstraite.'),
}


def font(font_dir: Path, filename: str, size: int) -> ImageFont.FreeTypeFont:
    path = font_dir / filename
    if not path.is_file():
        raise SystemExit(
            f'Police requise absente : {path}\n'
            'Restaurer tools/fonts/dejavu ou utiliser --font-directory avec les mêmes fichiers et leurs licences.')
    return ImageFont.truetype(str(path), size * SCALE)


def xy(point):
    return tuple(round(value * SCALE) for value in point)


class Canvas:
    def __init__(self, font_dir: Path):
        self.image = Image.new('RGB', xy(SIZE), CREAM)
        self.draw = ImageDraw.Draw(self.image)
        self.font_dir = font_dir

    def line(self, points, fill=GOLD, width=2):
        self.draw.line([xy(point) for point in points], fill=fill, width=round(width * SCALE), joint='curve')

    def ellipse(self, box, fill=None, outline=None, width=2):
        self.draw.ellipse(xy(box), fill=fill, outline=outline, width=round(width * SCALE))

    def rectangle(self, box, fill=None, outline=None, width=2):
        self.draw.rectangle(xy(box), fill=fill, outline=outline, width=round(width * SCALE))

    def arc(self, box, start, end, fill=GOLD, width=2):
        self.draw.arc(xy(box), start=start, end=end, fill=fill, width=round(width * SCALE))

    def text(self, at, text, size, fill=NAVY, family='DejaVuSans.ttf'):
        chosen = font(self.font_dir, family, size)
        self.draw.text(xy(at), text, font=chosen, fill=fill, anchor='lt')

    def tracked(self, at, text, size=16, spacing=2, fill=NAVY):
        chosen = font(self.font_dir, 'DejaVuSans.ttf', size)
        x, top = xy(at)
        # Use one baseline so accents and punctuation keep their natural position.
        baseline = top - chosen.getbbox('H', anchor='ls')[1]
        for letter in text:
            self.draw.text((round(x), baseline), letter, font=chosen, fill=fill, anchor='ls')
            x += self.draw.textlength(letter, font=chosen) + spacing * SCALE


def draw_artwork(c: Canvas, slug: str):
    """Original geometric ornaments; these never pretend to be documents/photos."""
    c.rectangle((888, 0, 1200, 630), fill=NAVY)
    c.line([(888, 0), (888, 630)], width=2)
    c.tracked((927, 66), 'LES ARTICLES', size=13, spacing=2.1, fill=CREAM)
    c.line([(927, 103), (1161, 103)], width=1)

    if slug == 'autorite':
        # One shared point, three possible responses.
        c.ellipse((1000, 166, 1088, 254), outline=GOLD, width=3)
        c.ellipse((1027, 193, 1061, 227), fill=CREAM)
        c.line([(1044, 254), (1044, 442)], fill=CREAM, width=3)
        c.line([(1044, 284), (960, 337), (960, 442)], width=3)
        c.line([(1044, 284), (1128, 337), (1128, 389), (1099, 419)], width=3)
        for cx, cy in [(960, 454), (1044, 454), (1090, 428)]:
            c.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), fill=GOLD)
        c.line([(941, 490), (1147, 490)], width=1)
    elif slug == 'autrices-pseudonymes':
        # Two names, one paper trail: type and paper, not a portrait.
        c.rectangle((934, 173, 1115, 379), outline=GOLD, width=2)
        c.text((964, 204), 'A', size=112, fill=GOLD, family='DejaVuSerif.ttf')
        c.rectangle((995, 298, 1160, 478), fill=CREAM)
        c.text((1025, 327), 'A', size=102, fill=NAVY, family='DejaVuSerif.ttf')
        c.line([(1021, 454), (1135, 454)], fill=GOLD, width=2)
        c.line([(958, 152), (1115, 152)], width=1)
        c.line([(1135, 173), (1135, 277)], width=1)
    elif slug == 'pieuvres-couleur':
        # A schematic chromatophore: concentric pigment and radial fibres.
        cx, cy = 1044, 328
        for index in range(16):
            angle = math.tau * index / 16
            start = (cx + 94 * math.cos(angle), cy + 94 * math.sin(angle))
            end = (cx + 128 * math.cos(angle), cy + 128 * math.sin(angle))
            c.line([start, end], width=2)
            radius = 4 if index % 2 else 7
            c.ellipse((end[0] - radius, end[1] - radius, end[0] + radius, end[1] + radius), fill=CREAM)
        c.ellipse((950, 234, 1138, 422), fill=GOLD)
        c.ellipse((969, 253, 1119, 403), outline=NAVY, width=2)
        c.ellipse((991, 275, 1097, 381), outline=NAVY, width=2)
        c.ellipse((1024, 308, 1064, 348), fill=NAVY)
    elif slug == 'puissance-etats-unis':
        # Distributed points on a globe; no flag or geopolitical map.
        c.ellipse((937, 221, 1151, 435), outline=GOLD, width=2)
        c.ellipse((990, 221, 1098, 435), outline=GOLD, width=2)
        c.ellipse((937, 268, 1151, 388), outline=GOLD, width=2)
        c.line([(937, 328), (1151, 328)], width=1)
        c.line([(1044, 221), (1044, 435)], width=1)
        for cx, cy in [(971, 250), (1134, 268), (1001, 418), (1062, 293)]:
            c.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), fill=NAVY)
            c.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=CREAM)
        c.arc((917, 201, 1171, 455), 8, 86, fill=CREAM, width=2)
        c.arc((917, 201, 1171, 455), 164, 235, fill=CREAM, width=2)
    elif slug == 'roubaix-1917':
        # An abstract city plan behind a date, not an archival image.
        for box in [(925, 173, 1007, 260), (1025, 173, 1161, 260),
                    (925, 278, 1056, 382), (1074, 278, 1161, 382),
                    (925, 400, 1007, 487), (1025, 400, 1161, 487)]:
            c.rectangle(box, outline=GOLD, width=1)
        c.rectangle((957, 207, 1135, 456), fill=NAVY)
        c.text((961, 209), '19', size=116, fill=CREAM, family='DejaVuSerif.ttf')
        c.text((961, 332), '17', size=116, fill=CREAM, family='DejaVuSerif.ttf')
        c.line([(960, 325), (1130, 325)], width=2)
    else:
        raise ValueError(f'Composition absente pour {slug}')

    c.tracked((927, 550), 'À DÉCOUVRIR', size=13, spacing=2, fill=CREAM)


def render(slug: str, card: Card, font_dir: Path) -> bytes:
    if not 1 <= len(card.lines) <= 3:
        raise ValueError(f'{slug} : le titre doit comporter une à trois lignes.')
    c = Canvas(font_dir)
    draw_artwork(c, slug)

    # A stable editorial frame shared by every article.
    c.ellipse((73, 64, 103, 94), outline=GOLD, width=2)
    c.line([(88, 57), (88, 101)], width=1)
    c.line([(66, 79), (110, 79)], width=1)
    c.text((130, 56), 'THOT', size=47, family='DejaVuSans-Bold.ttf')
    c.tracked((74, 126), 'LE GOÛT DE COMPRENDRE', size=13, spacing=2.3, fill=MUTED)
    c.line([(74, 169), (816, 169)], width=1)
    c.tracked((74, 204), card.category, size=15, spacing=2, fill=MUTED)

    # Measure real accented glyphs before drawing. Never truncate a title.
    max_width = 742 * SCALE
    chosen = None
    for size in range(65, 43, -1):
        candidate = font(font_dir, 'DejaVuSerif.ttf', size)
        if all(c.draw.textlength(line, font=candidate) <= max_width for line in card.lines):
            chosen = candidate
            break
    if chosen is None:
        raise ValueError(f'{slug} : raccourcir le titre, il dépasse la zone prévue.')
    line_height = round(size * 1.27)
    title_top = 259 if len(card.lines) <= 2 else 248
    for index, line in enumerate(card.lines):
        at = (74 * SCALE, (title_top + index * line_height) * SCALE)
        bounds = c.draw.textbbox(at, line, font=chosen, anchor='lt')
        if bounds[2] > 818 * SCALE or bounds[3] > 492 * SCALE:
            raise ValueError(f'{slug} : titre hors de sa zone de sécurité.')
        c.draw.text(at, line, font=chosen, fill=NAVY, anchor='lt')

    c.line([(74, 530), (816, 530)], width=1)
    c.tracked((74, 554), 'LA CURIOSITÉ N’A PAS DE LIMITES.', size=13, spacing=1.8, fill=MUTED)
    c.image = c.image.resize(SIZE, Image.Resampling.LANCZOS)
    # A fixed palette keeps smooth type edges while limiting transfer size.
    c.image = c.image.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    output = BytesIO()
    c.image.save(output, format='PNG', optimize=True, compress_level=9)
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slugs', nargs='*', help='Articles à générer (tous par défaut).')
    parser.add_argument('--font-directory', type=Path, default=DEFAULT_FONT_DIR)
    parser.add_argument('--output-directory', type=Path, default=ROOT / 'assets/social-cards')
    parser.add_argument('--check', action='store_true', help='Vérifier les fichiers sans les réécrire.')
    parser.add_argument('--list', action='store_true', help='Afficher les titres et ALT en JSON, sans générer.')
    args = parser.parse_args()
    slugs = args.slugs or list(CARDS)
    unknown = set(slugs) - CARDS.keys()
    if unknown:
        parser.error(f'Articles inconnus : {", ".join(sorted(unknown))}')
    if args.list:
        print(json.dumps({slug: {'title': CARDS[slug].title, 'alt': CARDS[slug].alt,
                                'path': f'assets/social-cards/{slug}.png'} for slug in slugs},
                         ensure_ascii=False, indent=2))
        return
    if not args.check:
        args.output_directory.mkdir(parents=True, exist_ok=True)
    for slug in slugs:
        content = render(slug, CARDS[slug], args.font_directory)
        destination = args.output_directory / f'{slug}.png'
        if len(content) >= 200_000:
            raise SystemExit(f'{slug} : {len(content)} octets, budget de 200 Ko dépassé.')
        if args.check:
            if not destination.is_file() or destination.read_bytes() != content:
                if destination.is_file():
                    with Image.open(destination) as stored, Image.open(BytesIO(content)) as generated:
                        pixels_equal = stored.convert('RGBA').tobytes() == generated.convert('RGBA').tobytes()
                        print('Diagnostic : pixels identiques = ' + str(pixels_equal) +
                              '; FreeType=' + str(features.version('freetype2')) +
                              '; RAQM=' + str(features.version('raqm')) +
                              '; zlib=' + str(features.version('zlib')) +
                              '; zlib-ng=' + str(features.version('zlib_ng')))
                raise SystemExit(f'{destination} : absent ou à régénérer avec les polices/Pillow documentés.')
        else:
            destination.write_bytes(content)
        with Image.open(destination) as checked:
            if checked.format != 'PNG' or checked.size != SIZE:
                raise SystemExit(f'{destination} : format ou dimensions incorrects.')
            checked.verify()
        print(f'{"Vérifié" if args.check else "Généré"} : {destination.relative_to(ROOT) if destination.is_relative_to(ROOT) else destination} '
              f'— {SIZE[0]} × {SIZE[1]} — {len(content):,} octets')


if __name__ == '__main__':
    main()
