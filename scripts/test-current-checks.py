#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mutations en copie temporaire : les recettes actualisées détectent les régressions."""
import portable_io
from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import runpy
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class CurrentChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory(prefix='THOT controles ')
        cls.root = Path(cls.temporary.name)/'site'
        shutil.copytree(ROOT, cls.root, ignore=shutil.ignore_patterns('.git', 'work', '__pycache__'))
        cls.git_dir = subprocess.check_output(['git', 'rev-parse', '--absolute-git-dir'],
                                             cwd=ROOT, text=True, encoding='utf-8').strip()

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def invoke(self, script):
        import os
        env = dict(os.environ, GIT_DIR=self.git_dir, GIT_WORK_TREE=str(self.root))
        return subprocess.run([sys.executable, 'scripts/'+script], cwd=self.root,
                              env=env, capture_output=True, text=True, encoding='utf-8')

    def rejects(self, name, data, script, message):
        target = self.root/name
        original = target.read_bytes()
        try:
            target.write_bytes(data)
            # Les mutations du quiz nécessitent l'ancienne banque, sans copier
            # ni écrire dans .git : GIT_DIR désigne l'historique en lecture seule.
            result = self.invoke(script)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(message, result.stdout+result.stderr)
        finally:
            target.write_bytes(original)

    def test_missing_sitemap_page(self):
        sitemap = ET.fromstring((self.root/'sitemap.xml').read_text(encoding='utf-8'))
        sitemap.remove(list(sitemap)[0])
        self.rejects('sitemap.xml', ET.tostring(sitemap), 'test-stabilisation.py', 'Inventaire du sitemap divergent')

    def test_quiz_snapshot(self):
        data = json.loads((self.root/'assets/quiz-verification.json').read_text(encoding='utf-8'))
        data['records'][0]['answer_snapshot']['why'] = 'Explication altérée'
        self.rejects('assets/quiz-verification.json', json.dumps(data).encode('utf-8'),
                     'test-stabilisation.py', 'Notice du quiz divergente')

    def test_changed_document(self):
        self.rejects('assets/explorer-v2/media/moynaq-original.jpg', b'altered',
                     'test-explorer-reconstruction.py', 'Média Moynaq modifié')

    def test_changed_license(self):
        name = 'assets/explorer-v2/data/awmc-derived.geojson'
        data = json.loads((self.root/name).read_text(encoding='utf-8'))
        data['license'] = 'Licence inventée'
        self.rejects(name, json.dumps(data).encode('utf-8'),
                     'test-explorer-reconstruction.py', 'Licence AWMC divergente')

    def test_fixture_without_system_webp_mime(self):
        recipe = runpy.run_path(str(ROOT/'scripts/test-explorer-reconstruction.py'))
        with patch('mimetypes.guess_type', return_value=(None, None)):
            html = recipe['fixture']('explorer/enquetes/mer-aral.html')
        self.assertIn('data:image/webp;base64,', html)

    def test_editorial_main_text(self):
        name='quiz-autrices.html'
        html=(self.root/name).read_text(encoding='utf-8')
        changed=re.sub(r'(<main\b[\s\S]*?<h1\b[^>]*>)([^<]+)',r'\1Texte éditorial altéré',html,count=1)
        self.assertNotEqual(html,changed)
        self.rejects(name,changed.encode('utf-8'),'check-editorial.py','texte éditorial modifié')

    def test_editorial_structured_data(self):
        name='quiz-autrices.html'
        html=(self.root/name).read_text(encoding='utf-8')
        changed=html.replace('"@type": "WebPage"','"@type": "Article"')
        self.assertNotEqual(html,changed)
        self.rejects(name,changed.encode('utf-8'),'check-editorial.py','données structurées modifiées')

    def test_editorial_main_required(self):
        name='quiz-autrices.html'
        html=re.sub(r'<main\b','<section',(self.root/name).read_text(encoding='utf-8')).replace('</main>','</section>')
        self.rejects(name,html.encode('utf-8'),'check-editorial.py','un seul contenu principal attendu')

    def test_editorial_chrome_is_separate(self):
        name=self.root/'quiz-autrices.html'
        original=name.read_bytes()
        try:
            name.write_text(original.decode('utf-8').replace('</body>','<p>Interface hors main</p></body>'),encoding='utf-8',newline='\n')
            result=self.invoke('check-editorial.py')
            self.assertEqual(result.returncode,0,result.stdout+result.stderr)
        finally:
            name.write_bytes(original)

    def test_production_content(self):
        name='assets/explorer-v2/data/rome-content.json'
        data=json.loads((self.root/name).read_text(encoding='utf-8'))
        data['chapters'][0]['title']='Titre altéré'
        self.rejects(name,json.dumps(data).encode('utf-8'),'production_checks.py','Production modifiée : '+name)

    def test_production_inventory(self):
        extra=self.root/'assets/unexpected-test.txt'
        try:
            extra.write_text('ressource inattendue',encoding='utf-8')
            result=self.invoke('production_checks.py')
            self.assertNotEqual(result.returncode,0)
            self.assertIn('Inventaire de production divergent',result.stderr)
        finally:
            extra.unlink()


if __name__ == '__main__':
    unittest.main(verbosity=2)
