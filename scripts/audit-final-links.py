#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Audit HTTP en lecture seule, sources dynamiques et faux succès HTTP 200 compris."""
import portable_io
import argparse
from collections import Counter
import json
import os
from pathlib import Path
from documentary_links import run


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path,
                        default=Path(os.environ.get('THOT_OUTPUT_DIR', str(root/'work/links'))))
    parser.add_argument('--inventory-only', action='store_true', help='Aucun accès réseau')
    args = parser.parse_args()
    results = run(root, args.output, args.inventory_only)
    print('HTTP_LINKS_SUMMARY ' + json.dumps(dict(Counter(str(r['status']) for r in results))))
    print('HTTP_LINKS_REVIEW_REQUIRED ' + str(sum(r['assessment'] == 'manual-review-required' for r in results)))
    print('HTTP_LINKS_RESULT_JSON ' + json.dumps(results, ensure_ascii=True))
