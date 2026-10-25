"""Transformations éditoriales précisément autorisées, sans exclusion de texte.

Le contrôle continue de comparer la totalité du corps et des références.
Chaque ancien fragment doit apparaître une seule fois ; les sources figurent
avec les anciennes et nouvelles formulations dans le manifeste versionné.
"""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
def strip_source_types(html):
 return re.sub(r'<span\b[^>]*class="source-type"[^>]*>[\s\S]*?</span>\s*','',html)
def amended_reference(html,path):
 manifest=json.loads((ROOT/'docs/CORRECTIONS-SCIENTIFIQUES-THOT20.json').read_text())
 # Les anciennes références de l’audit ne possédaient pas encore leurs étiquettes.
 text=strip_source_types(html)
 for item in manifest['changes']:
  if item['path']!=str(path):continue
  old,new=strip_source_types(item['old']),strip_source_types(item['new'])
  assert text.count(old)==1, f"Ancien fragment absent ou ambigu : {path} / {old[:60]}"
  text=text.replace(old,new,1)
 return text
