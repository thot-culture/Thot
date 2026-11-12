#!/usr/bin/env python3
"""Fidélité éditoriale et intégration de l’article samaritain, sans réseau."""
import portable_io
import hashlib
import json
from pathlib import Path
import re
import runpy
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SLUG = 'bon-samaritain'
HTML = (ROOT / 'articles/bon-samaritain.html').read_text(encoding='utf-8')
Document = runpy.run_path(str(ROOT / 'scripts/test-article-editorial.py'))['Document']
Reading = runpy.run_path(str(ROOT / 'scripts/update-reading-times.py'))['Reading']


def raw(node):
    if isinstance(node, str):
        return node
    if node.has_class('source-num'):
        return ''
    return ''.join(raw(child) for child in node.children)


class Samaritains(unittest.TestCase):
    def test_every_approved_paragraph_and_heading(self):
        source = (ROOT / 'docs/samaritains-texte-valide.txt').read_bytes()
        self.assertEqual(hashlib.sha256(source).hexdigest(),
                         'ea8afcf919cf5cf028f05a7e2efae9c1f087a5233678fc094936fb2fa10730b9')
        expected = [p for p in source.decode().strip().split('\n\n') if not p.startswith('[INSÉRER')]
        document = Document(HTML)
        actual = [raw(document.select('h1')[0]), raw(document.select('p', **{'class': 'accroche'})[0])]
        sections = [node for node in document.select('section') if 'data-validated-section' in node.attrs]
        self.assertEqual(len(sections), 6)
        for section in sections:
            actual.extend(raw(node).strip() for node in section.children
                          if not isinstance(node, str) and node.tag in {'h2', 'p'})
        self.assertEqual(actual, expected, 'Comparer chaque paragraphe, ponctuation et ordre compris')

    def test_games_immediately_follow_parts_one_and_four(self):
        document = Document(HTML)
        article = document.select('article', id='texte-article')[0]
        sections = [node for node in article.children if not isinstance(node, str) and node.tag == 'section']
        self.assertEqual([node.attrs.get('data-samaritains-game') for node in sections],
                         [None, 'identity', None, None, None, 'traditions', None, None, None])
        self.assertEqual([next(node.descendants('h2')).attrs['id'] for node in sections],
                         ['bon-samaritain', 'qui-est-samaritain-title', 'histoire-commune', 'mont-garizim',
                          'pentateuque', 'judaisme-samaritanisme-title', 'religion-vivante', 'conclusion', 'sources'])
        self.assertNotIn('[INSÉRER', HTML)

    def test_one_bibliography_ten_references_and_inline_sources(self):
        document = Document(HTML)
        self.assertEqual(len(document.select('section', **{'class': 'sources'})), 1)
        references = [node for node in document.select('li') if re.fullmatch(r'ref\d+', node.attrs.get('id', ''))]
        self.assertEqual([node.attrs['id'] for node in references], [f'ref{i}' for i in range(1, 11)])
        expected_urls = [
            'https://academic.oup.com/edited-volume/61673/chapter-abstract/548062125',
            'https://academic.oup.com/book/10746', 'https://www.mdpi.com/2077-1444/10/12/661',
            'https://www.mdpi.com/2077-1444/11/2/85', 'https://doi.org/10.30965/21967954-bja10079',
            'https://www.persee.fr/doc/asdi_1662-4653_2012_num_7_1_982', 'https://bible.usccb.org/bible/luke/10',
            'https://www.lemonde.fr/m-le-mag/article/2026/05/17/pres-de-naplouse-les-samaritains-forment-une-microsociete-neutre-au-c-ur-d-une-terre-en-guerre_6690055_4500055.html',
            'https://ejournals.bc.edu/index.php/scjr/article/view/13987', 'https://doi.org/10.15699/jbl.1414.2022.5']
        self.assertEqual([next(node.descendants('a')).attrs['href'] for node in references], expected_urls)
        cited = {node.attrs['href'] for node in document.select('a') if node.has_class('source-num')}
        self.assertEqual(cited, {f'#ref{i}' for i in range(1, 11)})
        deepening = [node for node in document.select('p') if raw(node).startswith('Pour approfondir :')]
        self.assertEqual(len(deepening), 5)
        self.assertEqual([link.attrs['href'] for p in deepening for link in p.descendants('a')],
                         [expected_urls[i-1] for i in [9, 3, 5, 4, 10, 6]])

    def test_reading_time_excludes_both_games_and_bibliography(self):
        parser = Reading()
        parser.feed(HTML)
        self.assertEqual(len(parser.words), 1267)
        records = json.loads((ROOT / 'assets/reading-times.json').read_text(encoding='utf-8'))['articles']
        self.assertEqual(records[SLUG], {'words': 1267, 'minutes': 7})
        extra = ' MOTJEU' * 1000
        altered = HTML.replace('<div data-samaritains-stage hidden>', '<div data-samaritains-stage hidden>'+extra)
        altered = altered.replace('<li id="ref1">', '<li id="ref1">'+extra)
        parser = Reading()
        parser.feed(altered)
        self.assertEqual(len(parser.words), 1267)

    def test_navigation_metadata_media_and_no_collection(self):
        document = Document(HTML)
        ids = {node.attrs['id'] for node in document.elements if 'id' in node.attrs}
        for link in document.select('a'):
            if link.attrs.get('href', '').startswith('#'):
                self.assertIn(link.attrs['href'][1:], ids)
        config = json.loads((ROOT / 'assets/article-editorial.json').read_text(encoding='utf-8'))
        record = next(row for row in config['articles'] if row['slug'] == SLUG)
        self.assertEqual(record['headline'], raw(document.select('h1')[0]))
        self.assertEqual(record['catalogue']['category'], 'histoire')
        self.assertIn(SLUG, config['home_articles'])
        for name in ['index.html', 'bibliotheque.html', 'sitemap.xml']:
            self.assertIn('articles/bon-samaritain.html', (ROOT / name).read_text(encoding='utf-8'))
        media = json.loads((ROOT / 'docs/samaritains-image.json').read_text(encoding='utf-8'))
        self.assertEqual(media['license'], 'CC BY 2.0')
        self.assertIn(media['license_url'], HTML)
        for entry in media['files']:
            with Image.open(ROOT / entry['path']) as visual:
                self.assertEqual(list(visual.size), entry['dimensions'])
        js = (ROOT / 'assets/samaritains.js').read_text(encoding='utf-8')
        self.assertNotRegex(js, r'localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon|document\.cookie')


if __name__ == '__main__':
    unittest.main(verbosity=2)
