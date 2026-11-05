#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Conservation intégrale de l'Atlas malgré sa représentation de transport compacte."""
import portable_io
import copy
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unittest
from explorer_atlas_view import compact_data
import site_chrome

ROOT = Path(__file__).resolve().parents[1]
BASE = '893d6dd97c6dc17eafa54601c1af8669f3338943'
PAGE = 'explorer/atlas/rome-expansion.html'

def old(name):
    return subprocess.check_output(['git', 'show', BASE+':'+name], cwd=ROOT).decode('utf-8')

def payload(html):
    return re.search(r'<script id="atlas-data" type="application/json">(.*?)</script>', html, re.S)[1]

class AtlasPerformance(unittest.TestCase):
    def test_lossless_javascript_roundtrip_and_legacy_format(self):
        original = json.loads(payload(old(PAGE)))
        original_copy = copy.deepcopy(original)
        compact = compact_data(original)
        self.assertEqual(original, original_copy, 'La factorisation ne doit pas muter le corpus')
        self.assertEqual(len(original['territories']), 372)
        self.assertLess(len(json.dumps(compact)), len(json.dumps(original)) * .5)
        self.assertEqual(json.loads(payload((ROOT/PAGE).read_text(encoding='utf-8'))), compact)
        # Tester le vrai lecteur JavaScript, sans copier son algorithme dans le test.
        source = (ROOT/'assets/explorer-v2/atlas.js').read_text(encoding='utf-8')
        prefix = source.split('  if (!data.epochs?.length')[0]
        script = prefix+'''
const {territory_details, ...rest} = data;
globalThis.result = {...rest, territories: Object.fromEntries(Object.keys(data.territories).map(id => [id, territoryById(id)]))};
})();'''
        edge = {'territories': {'a': {'text': '', 'source': None, 'document_ids': [], 'person_ids': []},
                                'b': {'name': 'Sans notice'}, 'c': {'name': 'Autre', 'text': ''}}}
        invalid = copy.deepcopy(compact)
        invalid_id = next(iter(invalid['territories']))
        invalid['territories'][invalid_id]['detail_index'] = -1
        expected_valid = copy.deepcopy(original)
        del expected_valid['territories'][invalid_id]
        cases = [{'wire': compact, 'expected': original}, {'wire': original, 'expected': original},
                 {'wire': compact_data(edge), 'expected': edge}, {'wire': invalid, 'expected': expected_valid}]
        harness = r'''
const vm=require('node:vm'),assert=require('node:assert/strict');
const input=JSON.parse(require('node:fs').readFileSync(0,'utf8'));
for(const test of input.cases){
 const context={document:{getElementById(id){return id==='rome-atlas'?{}:{textContent:JSON.stringify(test.wire)}}}};
 vm.runInNewContext(input.script,context);
 assert.deepEqual(JSON.parse(JSON.stringify(context.result)),test.expected);
}
'''
        subprocess.run(['node', '-e', harness], input=json.dumps({'script': script, 'cases': cases}),
                       text=True, encoding='utf-8', check=True, cwd=ROOT)

    def test_complete_markup_and_styles_preserved(self):
        before = old(PAGE)
        after = (ROOT/PAGE).read_text(encoding='utf-8')
        styles = re.findall(r'<link rel="stylesheet" href="/Thot/([^?]+)\?v=[a-f0-9]+">', before)
        self.assertEqual(len(styles), 4)
        for name in styles:
            self.assertEqual((ROOT/name).read_text(encoding='utf-8'), old(name), name)
        # Annuler seulement la sérialisation et l'empreinte du lecteur modifié.
        after = after.replace(payload(after), payload(before))
        after = re.sub(r'(atlas\.js\?v=)[a-f0-9]+',
                       lambda m: m[1]+hashlib.sha256(old('assets/explorer-v2/atlas.js').encode()).hexdigest()[:12], after)
        self.assertEqual(after, before, 'Textes, sources, licences, SVG et HTML de repli doivent rester identiques')

    def test_generation_is_idempotent(self):
        html = (ROOT/PAGE).read_text(encoding='utf-8')
        self.assertEqual(site_chrome.normalize(PAGE, html), html)

if __name__ == '__main__':
    unittest.main()
