#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cas de régression : faux succès HTTP, protections et sources chargées en JS."""
import portable_io
import json
from pathlib import Path
import tempfile
import unittest
from documentary_links import inspect_response, inventory


class DocumentaryLinks(unittest.TestCase):
    def response(self, body, url='https://example.org/notice', final=None, status=200):
        return inspect_response(url, status, final or url, 'text/html', body.encode())

    def test_false_http_success(self):
        cases = [('<title>Omeka a rencontré une erreur</title>', 'html-error-page-review-required'),
                 ('<title>Maintenance</title>', 'html-error-page-review-required'),
                 ('<title>Client Challenge</title>', 'browser-check-required'),
                 ('This website requires JS enabled and cookies', 'browser-check-required'),
                 ('<script>location.reload()</script>', 'empty-or-script-only-response')]
        for body, signal in cases:
            with self.subTest(signal=signal, body=body):
                result = self.response(body)
                self.assertIn(signal, result['signals'])
                self.assertEqual(result['assessment'], 'manual-review-required')

    def test_redirect_pdf_to_home(self):
        result = self.response('<title>Accueil</title>', 'https://example.org/archive.pdf',
                               'https://example.org/fr')
        self.assertIn('expected-pdf-received-html', result['signals'])
        self.assertIn('redirect-to-home-review-required', result['signals'])

    def test_http_does_not_certify_document(self):
        for status in (200, 401, 403, 429, 404, 503):
            with self.subTest(status=status):
                result = self.response('<title>Notice scientifique</title>', status=status)
                self.assertNotIn(result['assessment'], ('valid', 'broken', 'repaired'))
                if status in (401, 403, 429):
                    self.assertIn('automated-access-refused', result['signals'])

    def test_legitimate_document_discussing_maintenance(self):
        result = self.response('<title>Artillery Defences</title><p>Maintenance of historic defences.</p>')
        self.assertEqual(result['signals'], [])

    def test_inventory_dynamic_sources_and_http(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root/'assets/explorer-v2/data').mkdir(parents=True)
            (root/'articles').mkdir(); (root/'explorer').mkdir()
            (root/'index.html').write_text('<a href="http://example.org/item?a=1&amp;b=2#view">Notice</a>', encoding='utf-8')
            (root/'assets/explorer-v2/data/aral.json').write_text(json.dumps({'source': {'url': 'https://example.org/report'}}), encoding='utf-8')
            (root/'assets/quiz-reference-data.js').write_text('const data = [{"sources":[{"url":"https://example.org/quiz"}]}];', encoding='utf-8')
            urls = inventory(root)
            self.assertIn('http://example.org/item?a=1&b=2', urls)
            self.assertIn('https://example.org/report', urls)
            self.assertIn('https://example.org/quiz', urls)
            self.assertEqual(len(urls['https://example.org/report']), 1)


if __name__ == '__main__': unittest.main()
