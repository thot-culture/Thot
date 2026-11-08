#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Intégrité du texte validé et calcul réel de lecture, hors jeux et sources."""
import portable_io
import hashlib
import json
from pathlib import Path
import re
import runpy
import unittest

ROOT = Path(__file__).resolve().parents[1]
SLUG = 'les-sophistes-verite-justice'
HTML = (ROOT / 'articles' / (SLUG+'.html')).read_text(encoding='utf-8')
Document = runpy.run_path(str(ROOT / 'scripts/test-article-editorial.py'))['Document']
Reading = runpy.run_path(str(ROOT / 'scripts/update-reading-times.py'))['Reading']


class Sophistes(unittest.TestCase):
    def test_approved_narrative(self):
        document = Document(HTML)
        article = document.select('article', id='texte-article')[0]
        def raw(node):
            if isinstance(node, str):
                return node
            if node.has_class('source-num'):
                return ''
            return ''.join(raw(child) for child in node.children)
        title = raw(document.select('h1')[0])
        intro = raw(document.select('p', **{'class': 'accroche'})[0])
        sections = [node for node in article.children if not isinstance(node, str)
                    and node.tag == 'section' and not node.has_class('sm-module') and not node.has_class('sources')]
        self.assertEqual(len(sections), 8)
        narrative = ' '.join([title, intro] + [raw(node) for node in sections])
        digest = hashlib.sha256(' '.join(narrative.split()).encode('utf-8')).hexdigest()
        # Empreinte indépendante du texte approuvé reçu le 8 novembre 2026,
        # avant conversion Markdown/HTML (titre, chapeau et huit sections).
        self.assertEqual(digest, 'be09460951b1ebd8e72fce3f6d808dd04cf497f57c5ac427279dc59f430847ed')

    def test_reading_time(self):
        parser = Reading()
        parser.feed(HTML)
        self.assertEqual(len(parser.words), 1392)
        record = json.loads((ROOT / 'assets/reading-times.json').read_text(encoding='utf-8'))['articles'][SLUG]
        self.assertEqual(record, {'words': 1392, 'minutes': 7})
        self.assertIn('id="duree">7 min de lecture environ', HTML)

    def test_games_and_sources_never_add_reading_words(self):
        extra = ' MOTJEU' * 1000
        modified = HTML.replace('<div data-sophistes-stage hidden>', '<div data-sophistes-stage hidden>'+extra)
        modified = modified.replace('<li id="ref1">', '<li id="ref1">'+extra)
        parser = Reading()
        parser.feed(modified)
        self.assertEqual(len(parser.words), 1392)
        self.assertNotIn('MOTJEU', parser.words)

    def test_order_and_sources(self):
        document = Document(HTML)
        article = document.select('article', id='texte-article')[0]
        headings = [node.attrs['id'] for node in article.descendants('h2') if 'id' in node.attrs]
        self.assertEqual(headings, ['parole-pouvoir', 'protagoras', 'gorgias', 'defi-gorgias-title', 'antiphon-hippias', 'thrasymaque', 'qui-a-raison-title', 'prodicos', 'transmission', 'conclusion', 'sources'])
        self.assertEqual([node.attrs['id'] for node in document.select('li') if re.fullmatch(r'ref\d+', node.attrs.get('id', ''))], ['ref'+str(n) for n in range(1, 16)])
        self.assertEqual(sum('data-sophistes-stage' in node.attrs for node in document.select('div')), 2)
        self.assertNotIn('Bonne réponse', HTML)
        self.assertNotIn('Mise en perspective', HTML)


if __name__ == '__main__':
    unittest.main(verbosity=2)
