#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contrats de la carte et conservation de la page déjà préparée dans la PR 35."""
import portable_io
import hashlib
import json
from pathlib import Path
import runpy
import unittest

ROOT = Path(__file__).resolve().parents[1]
Document = runpy.run_path(str(ROOT/'scripts/test-article-editorial.py'))['Document']
HTML = (ROOT/'articles/bon-samaritain.html').read_text(encoding='utf-8')


class Gerizim(unittest.TestCase):
    def setUp(self):
        self.doc = Document(HTML)

    def test_precise_placement_and_skip(self):
        module = self.doc.select('section', id='carte-garizim')[0]
        section = module.parent
        self.assertIn('data-validated-section',section.attrs)
        children = [n for n in section.children if not isinstance(n,str)]
        i=children.index(module)
        self.assertEqual(children[i-1].text(),"Selon leur tradition, cette montagne est le véritable centre sacré d'Israël.")
        self.assertEqual(children[i+1].attrs['id'],'garizim-suite')
        self.assertIn('data-reading-exclude',module.attrs)
        self.assertIn('sm-module',module.attrs['class'])
        self.assertTrue(any(a.attrs.get('href')=='#carte-garizim' for a in self.doc.select('a')))

    def test_verified_coordinates(self):
        places=[n for n in self.doc.select('details') if 'data-place' in n.attrs]
        expected=[('garizim',32.2008881,35.2730961),('naplouse',32.2205316,35.2569374),('kiryat-luza',32.2041266,35.2686671)]
        self.assertEqual([(p.attrs['data-place'],float(p.attrs['data-lat']),float(p.attrs['data-lon'])) for p in places],expected)
        registry=json.loads((ROOT/'docs/samaritains-coordonnees.json').read_text(encoding='utf-8'))
        self.assertFalse(registry['sanctuary_marker'])
        self.assertEqual(registry['verified'],'2026-11-14')
        self.assertEqual([p['osm'] for p in registry['places']],['node/3602728613','way/265619988','node/2317268628'])

    def test_progressive_text_alternative_and_licence(self):
        places=[n for n in self.doc.select('details') if 'data-place' in n.attrs]
        for p in places:
            self.assertIn('open',p.attrs)
            self.assertTrue(list(p.descendants('p'))[0].text().strip())
            self.assertTrue(next(p.descendants('a')).attrs['href'].startswith('https://www.openstreetmap.org/'))
        self.assertIn('https://www.openstreetmap.org/copyright',HTML)
        self.assertIn('https://whc.unesco.org/en/tentativelists/5706/',HTML)
        self.assertIn('https://en.parks.org.il/reserve-park/mount-gerizim/',HTML)
        licence=(ROOT/'assets/vendor/leaflet/LICENSE').read_text(encoding='utf-8')
        self.assertIn('BSD 2-Clause License',licence)

    def test_no_duplicate_article_or_tracking(self):
        self.assertFalse((ROOT/'articles/le-bon-samaritain.html').exists())
        records=json.loads((ROOT/'assets/article-editorial.json').read_text(encoding='utf-8'))['articles']
        self.assertEqual(sum('Samaritain' in r.get('headline','') for r in records),1)
        self.assertEqual(len(records),9)
        code=(ROOT/'assets/samaritains-map.js').read_text(encoding='utf-8')
        self.assertNotRegex(code,r'localStorage|sessionStorage|indexedDB|sendBeacon|document\.cookie')
        self.assertNotIn('nominatim',code)

    def test_publication_metadata_and_unique_anchors(self):
        ids=[n.attrs['id'] for n in self.doc.elements if 'id' in n.attrs]
        self.assertEqual(len(ids),len(set(ids)))
        for a in self.doc.select('a'):
            if a.attrs.get('href','').startswith('#'): self.assertIn(a.attrs['href'][1:],ids)
        self.assertIn('"datePublished": "2026-11-12"',HTML)
        self.assertIn('"dateModified": "2026-11-14"',HTML)
        self.assertIn('datetime="2026-11-14"',HTML)


if __name__=='__main__':
    unittest.main(verbosity=2)
