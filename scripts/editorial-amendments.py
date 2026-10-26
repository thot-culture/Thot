# -*- coding: utf-8 -*-
"""Transformations éditoriales précisément autorisées, sans exclusion de texte.

Le contrôle continue de comparer la totalité du corps et des références.
Chaque ancien fragment doit apparaître une seule fois ; les sources figurent
avec les anciennes et nouvelles formulations dans le manifeste versionné.
"""
import portable_io  # Encodage CLI stable, sans dépendance système.
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
def strip_source_types(html):
 return re.sub(r'<span\b[^>]*class="source-type"[^>]*>[\s\S]*?</span>\s*','',html)
def amended_reference(html,path):
 manifest=json.loads((ROOT/'docs/CORRECTIONS-SCIENTIFIQUES-THOT20.json').read_text(encoding="utf-8"))
 # Les anciennes références de l’audit ne possédaient pas encore leurs étiquettes.
 text=strip_source_types(html)
 for item in manifest['changes']:
  if item['path']!=str(path):continue
  old,new=strip_source_types(item['old']),strip_source_types(item['new'])
  assert text.count(old)==1, f"Ancien fragment absent ou ambigu : {path} / {old[:60]}"
  text=text.replace(old,new,1)
 return text

def amended_quiz_bank(text, path):
 """Seules les dix explications documentées peuvent changer dans les banques."""
 manifest=json.loads((ROOT/'docs/QUIZ-CORRECTIONS-20261026.json').read_text(encoding='utf-8'))
 for item in manifest['changes']:
  if item['path']!=str(path):continue
  old='"why": '+json.dumps(item['old'],ensure_ascii=False)
  new='"why": '+json.dumps(item['new'],ensure_ascii=False)
  assert text.count(old)==1, f'Explication originale absente ou ambiguë : {item["question"]}'
  text=text.replace(old,new,1)
 return text
