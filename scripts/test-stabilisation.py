#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Retrait public, corpus du quiz et amendements autorisés, sans réseau."""
import portable_io
from pathlib import Path
import argparse
import ast
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE = '8157d53dbbe6fd9852b84079f87d28da8469d8c5'

def bank(revision=None):
    paths = ['assets/site.js'] + [f'assets/questions-{level}.js' for level in ('facile', 'intermediaire', 'expert')]
    data = {p: subprocess.check_output(['git', 'show', revision+':'+p], cwd=ROOT, text=True, encoding='utf-8') if revision else (ROOT/p).read_text(encoding='utf-8') for p in paths}
    # Les tableaux réels sont évalués sans exécuter le moteur de jeu ni le DOM.
    code = '''const vm=require('node:vm'); const data=JSON.parse(require('node:fs').readFileSync(0,'utf8'));
const c={window:{}};vm.createContext(c);
for(const [name,source] of Object.entries(data))if(name!=='assets/site.js')vm.runInContext(source,c);
const source=data['assets/site.js'];
vm.runInContext(source.slice(0,source.indexOf("document.getElementById('quiz-total')"))+'globalThis.bank=questions;',c);
process.stdout.write(JSON.stringify(c.bank));'''
    return json.loads(subprocess.check_output(['node', '-e', code], input=json.dumps(data, ensure_ascii=False), cwd=ROOT, text=True, encoding='utf-8'))

def static_checks():
    retirement = json.loads((ROOT/'docs/EXPLORER-RETRAIT-TEMPORAIRE-20261026.json').read_text(encoding='utf-8'))
    assert len(retirement['removed_pages']) == 12
    assert all(not (ROOT/name).exists() for name in retirement['removed_pages'])
    assert all((ROOT/name).is_file() for name in retirement['shared_files_kept'])
    htmls = [*ROOT.glob('*.html'), *(ROOT/'articles').glob('*.html')]
    assert len(htmls) == 11
    for p in htmls:
        s = p.read_text(encoding='utf-8')
        assert not re.search(r'<a\b[^>]*href="[^"]*(?:explorer(?:\.html|/)|enquetes/)', s), p
    sitemap=(ROOT/'sitemap.xml').read_text(encoding='utf-8')
    assert sitemap.count('<url>') == 10 and 'explorer' not in sitemap and 'enquetes/' not in sitemap
    assert 'temporairement retirées' in (ROOT/'404.html').read_text(encoding='utf-8')
    old, current = bank(BASE), bank()
    assert len(current) == len(old) == 300
    corrections = json.loads((ROOT/'docs/QUIZ-CORRECTIONS-20261026.json').read_text(encoding='utf-8'))['changes']
    approved = {c['question']: c for c in corrections}
    assert len(approved) == 10
    for before, after in zip(old, current):
        expected = dict(before)
        if before['q'] in approved:
            c = approved[before['q']]
            assert c['old'] == expected['why'] and c['sources']
            expected['why'] = c['new']
        assert after == expected, before['q']
    review = json.loads((ROOT/'assets/quiz-verification.json').read_text(encoding='utf-8'))
    assert len(review['records']) == 300
    assert len({r['id'] for r in review['records']}) == 300
    assert len({r['question'] for r in review['records']}) == 300
    records = {r['question']: r for r in review['records']}
    for q in current:
        r = records[q['q']]
        assert r['answer_snapshot'] == {k:q[k] for k in ('a', 'correct', 'why')}
        if r['status'] == 'verified':
            assert r['verified_on'] == '2026-10-26' and r['justification'] and r['sources']
            assert all(s['url'].startswith('https://') and s['title'] for s in r['sources'])
        else:
            assert r['status'] in ('not_reviewed', 'needs_review') and r['verified_on'] is None
    assert sum(r['status']=='verified' for r in records.values()) == review['verified_count'] == 24
    assert sum(r['status']=='needs_review' for r in records.values()) == 1
    source=(ROOT/'assets/site.js').read_text(encoding='utf-8')
    before=subprocess.check_output(['git','show',BASE+':assets/site.js'],cwd=ROOT,text=True,encoding='utf-8')
    assert source.replace('\n      window.THOT_QUIZ_REFERENCES?.render(feedback,item);','') == before
    for name in ('assets/roubaix-frise.js','assets/autorite-decode.js','assets/quiz-autrices.js','assets/images/roubaix-laines-1917-original.jpg'):
        assert (ROOT/name).read_bytes()==subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT)
    fontdir=ROOT/'tools/fonts/dejavu'
    hashes=json.loads((fontdir/'SHA256.json').read_text(encoding='utf-8'))
    assert all(hashlib.sha256((fontdir/name).read_bytes()).hexdigest()==value for name,value in hashes.items())
    for p in (ROOT/'scripts').glob('*.py'):
        s=p.read_text(encoding='utf-8');assert 'coding: utf-8' in s,p
        for n in ast.walk(ast.parse(s)):
            if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr in ('read_text','write_text'):
                assert any(k.arg=='encoding' for k in n.keywords), (p,n.lineno)
    for cmd in [[sys.executable,'scripts/build-quiz-references.py','--check'],[sys.executable,'scripts/check-editorial.py']]:
        subprocess.run(cmd,cwd=ROOT,check=True)
    print('PASS : douze pages retirées, dépendances conservées, 300 questions identiques sauf dix explications sourcées, 24 vérifiées, scores et sélection inchangés, UTF-8 et polices contrôlés.')

if __name__=='__main__':
    static_checks()
