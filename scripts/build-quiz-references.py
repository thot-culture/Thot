#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère uniquement les références vérifiées utilisées après les réponses."""
import portable_io  # Encodage CLI stable, sans dépendance système.
from pathlib import Path
import argparse
import json

ROOT = Path(__file__).resolve().parents[1]

def output():
    data = json.loads((ROOT / 'assets/quiz-verification.json').read_text(encoding='utf-8'))
    records = [r for r in data['records'] if r['status'] == 'verified']
    assert len(records) == data['verified_count']
    assert all(r['sources'] and r['verified_on'] and r['justification'] for r in records)
    return '/* Généré par scripts/build-quiz-references.py ; aucune évaluation distante. */\nwindow.THOT_QUIZ_REFERENCE_DATA = ' + json.dumps(records, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';\n'

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--check', action='store_true')
    args = ap.parse_args()
    path = ROOT / 'assets/quiz-reference-data.js'
    text = output()
    if args.check:
        assert path.read_text(encoding='utf-8') == text, 'Références à régénérer'
        print('PASS : références vérifiées cohérentes avec le registre.')
    else:
        path.write_text(text, encoding='utf-8')
        print('Références générées ; aucune publication effectuée.')
