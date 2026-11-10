#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contrôles SEO locaux, sans réseau, ni promesse d'indexation. --output : inventaire JSON."""
import portable_io
import argparse
from collections import Counter
from datetime import date
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.canonical, self.links, self.images, self.schemas = [], [], [], []
        self.resources, self.headings, self.ids, self.titles = [], [], set(), []
        self.in_head, self.active, self.buffer = False, None, ''
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if a.get('id'):
            self.ids.add(a['id'])
        if tag == 'meta':
            key = a.get('name', a.get('property', '')).lower()
            self.meta.setdefault(key, []).append(a.get('content', ''))
        if tag == 'link':
            rel = a.get('rel', '').split()
            if 'canonical' in rel:
                self.canonical.append(a.get('href'))
            if set(rel) & {'stylesheet', 'icon', 'preload'}:
                self.resources.append(a.get('href', ''))
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if tag in ('img', 'script', 'source') and a.get('src'):
            self.resources.append(a['src'])
        if tag == 'img':
            self.images.append(a)
        if (tag == 'title' and self.in_head or re.fullmatch(r'h[1-6]', tag)
                or tag == 'script' and a.get('type') == 'application/ld+json'):
            self.active, self.buffer = tag, ''

    def handle_data(self, text):
        if self.active:
            self.buffer += text

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        if tag != self.active:
            return
        if tag == 'script':
            self.schemas.append(json.loads(self.buffer))
        elif tag == 'title':
            self.titles.append(self.buffer.strip())
        else:
            self.headings.append((tag, ' '.join(self.buffer.split())))
        self.active = None

    def one(self, key):
        values = self.meta.get(key, [])
        return values[0] if len(values) == 1 else None

    @property
    def noindex(self):
        return any('noindex' in value.lower() for key in ('robots', 'googlebot') for value in self.meta.get(key, []))


def audit(root=ROOT):
    config = json.loads((root / 'assets/article-editorial.json').read_text(encoding='utf-8'))
    base = config['base_url']
    paths = sorted([*root.glob('*.html'), *(root / 'articles').glob('*.html'), *(root / 'explorer').rglob('*.html')])
    pages = {p.relative_to(root).as_posix(): Page(p.read_text(encoding='utf-8')) for p in paths}
    errors, warnings, inventory = [], [], []
    inbound = {name: set() for name in pages}
    records = {row['slug']: row for row in config['articles']}
    def fail(name, message):
        errors.append(name + ' : ' + message)
    def target(url, source):
        absolute = urlsplit(urljoin(base + source, url))
        prefix = urlsplit(base)
        if absolute.netloc != prefix.netloc:
            return None, None
        if not absolute.path.startswith(prefix.path):
            return '__hors_prefixe__', None
        name = unquote(absolute.path[len(prefix.path):]) or 'index.html'
        return name, unquote(absolute.fragment)
    for name, page in pages.items():
        canonical = base if name == 'index.html' else urljoin(base, name)
        h1 = [text for tag, text in page.headings if tag == 'h1']
        if page.canonical != [canonical] and not (page.noindex and not page.canonical):
            fail(name, 'canonique incorrecte ou multiple')
        if len(page.titles) != 1 or not page.titles[0]:
            fail(name, 'titre HTML absent ou multiple')
        if len(h1) != 1 or not h1[0]:
            fail(name, 'un H1 principal attendu')
        if not page.one('description'):
            fail(name, 'description absente, vide ou multiple')
        for previous, current in zip(page.headings, page.headings[1:]):
            if int(current[0][1]) > int(previous[0][1]) + 1:
                warnings.append(name + ' : saut de niveau ' + previous[0] + ' → ' + current[0])
        if not page.noindex:
            for key in ('og:title', 'og:description', 'og:type', 'og:image', 'og:image:alt'):
                if not page.one(key):
                    fail(name, key + ' absent, vide ou multiple')
            if page.one('og:url') != canonical:
                fail(name, 'og:url différent de la canonique')
            if not page.schemas:
                fail(name, 'données structurées absentes')
        for image in page.images:
            if 'alt' not in image:
                fail(name, 'image sans attribut alt : ' + image.get('src', ''))
        for link in page.links:
            dest, fragment = target(link, name)
            if dest is None:
                continue
            if dest in pages:
                if dest != name:
                    inbound[dest].add(name)
                if fragment and fragment not in pages[dest].ids:
                    fail(name, 'ancre interne absente : ' + link)
            elif not (root / dest).is_file():
                fail(name, 'lien local absent ou hors /Thot/ : ' + link)
        for url in page.resources + ([page.one('og:image')] if page.one('og:image') else []):
            dest, _ = target(url, name)
            if dest is not None and not (root / dest).is_file():
                fail(name, 'ressource locale absente : ' + url)
        if name.startswith('articles/'):
            slug = Path(name).stem
            record = records.get(slug)
            if not record:
                fail(name, 'article sans notice')
                continue
            data = [x for x in page.schemas if isinstance(x, dict) and x.get('@type') == 'Article']
            if len(data) != 1:
                fail(name, 'un bloc Article attendu')
                continue
            data = data[0]
            if page.noindex:
                fail(name, 'article publié en noindex')
            for actual, expected, field in ((page.titles, [record['seo']['title']], 'title'),
                    (page.one('description'), record['seo']['description'], 'description'),
                    (h1, [' '.join(record['headline'].split())], 'H1'),
                    (data.get('author'), record['author'], 'auteur'),
                    (data.get('headline'), record['headline'], 'headline'),
                    (data.get('datePublished'), record['published'], 'datePublished'),
                    (data.get('dateModified'), record.get('editorial_updated', config['editorial_updated']), 'dateModified')):
                if actual != expected:
                    fail(name, field + ' différent de la notice')
            published = date.fromisoformat(data['datePublished'])
            if date.fromisoformat(data['dateModified']) < published:
                fail(name, 'modification antérieure à la publication')
            entity = data.get('mainEntityOfPage')
            if (entity.get('@id') if isinstance(entity, dict) else entity) != canonical:
                fail(name, 'mainEntityOfPage incorrect')
            image = data.get('image')
            if image not in (base + record['social']['image'], [base + record['social']['image']]):
                fail(name, 'image structurée différente de la notice')
            if not data.get('description') or not data.get('author', {}).get('name'):
                fail(name, 'description structurée ou auteur absent')
            image_path = root / record['social']['image']
            try:
                if not image_path.resolve().is_relative_to(root.resolve()):
                    raise ValueError('Image hors du dépôt')
                with Image.open(image_path) as media:
                    if media.size != (1200, 630):
                        fail(name, 'image de partage attendue en 1200 × 630')
                    media.verify()
            except (OSError, ValueError):
                fail(name, 'image sociale locale illisible')
            text = (root / name).read_text(encoding='utf-8')
            if record['author']['name'] not in text.split('</head>', 1)[-1]:
                fail(name, 'auteur non affiché dans le corps')
            visible_dates = re.findall(r'<time\b[^>]*datetime="([^"]+)"', text.split('</head>', 1)[-1])
            for value in (record['published'], record.get('editorial_updated', config['editorial_updated'])):
                if value not in visible_dates:
                    fail(name, 'date éditoriale absente des éléments time du corps : ' + value)
            refs = {identifier for identifier in page.ids if re.fullmatch(r'ref\d+', identifier)}
            if refs != set(record['sources']):
                fail(name, 'sources différentes de la notice')
        inventory.append({'path': name, 'indexable': not page.noindex, 'title': page.titles,
                          'description': page.one('description'), 'canonical': page.canonical,
                          'h1': h1, 'schema_types': [s.get('@type') for s in page.schemas if isinstance(s, dict)]})
    expected = {row['canonical'][0] for row in inventory if row['indexable'] and len(row['canonical']) == 1}
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    listed = [node.text for node in ET.parse(root / 'sitemap.xml').findall('s:url/s:loc', ns)]
    if set(listed) != expected or len(listed) != len(set(listed)):
        fail('sitemap.xml', 'URL manquante, supplémentaire ou dupliquée')
    for field in ('title', 'description'):
        counts = Counter((tuple(row[field]) if isinstance(row[field], list) else row[field]) for row in inventory if row['indexable'])
        for value, count in counts.items():
            if value and count > 1:
                fail(field, 'valeur dupliquée : ' + str(value))
    for name, sources in inbound.items():
        if not sources and not pages[name].noindex and name != 'index.html':
            fail(name, 'page sans lien entrant interne')
    return {'pages': inventory, 'inbound': {k: sorted(v) for k, v in inbound.items()},
            'errors': errors, 'warnings': warnings}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = audit()
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for message in result['warnings']:
        print('AVERTISSEMENT :', message)
    for message in result['errors']:
        print('ÉCHEC :', message)
    print(f"SEO : {len(result['pages'])} pages, {len(result['errors'])} erreur(s), {len(result['warnings'])} avertissement(s).")
    return bool(result['errors'])


if __name__ == '__main__':
    raise SystemExit(main())
