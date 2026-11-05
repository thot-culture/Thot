# -*- coding: utf-8 -*-
import portable_io
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,subprocess,re,sys
import runpy
from production_checks import check_production
ROOT=Path(__file__).resolve().parents[1]
PAGE=ROOT/'articles/evolution-strategies-militaires.html'
class Audit(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.anchors=[];self.modules=[];self.assets=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if 'data-sm-module' in a:self.modules.append(a['data-sm-module'])
  if tag=='a' and a.get('href','').startswith('#'):self.anchors.append(a['href'][1:])
  if tag in ('img','script','link'):
   u=a.get('src',a.get('href',''))
   if u and not u.startswith(('http:','https:','#','data:')):self.assets.append(((ROOT/u.split('?')[0][len('/Thot/'):]) if u.startswith('/Thot/') else (PAGE.parent/u.split('?')[0])).resolve())
parsed=Audit();text=PAGE.read_text(encoding='utf-8-sig');parsed.feed(text)
assert len(set(parsed.ids))==len(parsed.ids)
assert all(a in parsed.ids for a in parsed.anchors)
assert parsed.modules==['frise','forts','transports','document']
assert all(p.is_file() for p in parsed.assets)
assert len(re.findall('class="sm-chapter"',text))==6
assert 'noindex' not in text and 'nofollow' not in text
assert '"datePublished": "2026-10-27"' in text
assert '"creativeWorkStatus": "Draft"' not in text
for p in ['sitemap.xml','bibliotheque.html']:
 assert 'evolution-strategies-militaires' in (ROOT/p).read_text(encoding='utf-8-sig')
# Le contenu éditorial validé est conservé intégralement lors de la publication.
original=(ROOT/'docs/strategies-validated-article.html.txt').read_text(encoding='utf-8')
body=lambda html: re.search(r'<article id="texte-article"[\s\S]*?</article>',html)[0]
normalize=lambda value: re.sub(r' (width|height)="[0-9]+"','',value)
amended_structure=runpy.run_path(str(ROOT/'scripts/editorial-amendments.py'))['amended_structure']
assert normalize(body(amended_structure(text,'articles/evolution-strategies-militaires.html')))==normalize(body(amended_structure(original,'articles/evolution-strategies-militaires.html'))), 'Le texte ou les activités ont changé depuis la validation locale'
registry=json.loads((ROOT/'assets/article-editorial.json').read_text(encoding='utf-8'))
record=next(row for row in registry['articles'] if row['slug']=='evolution-strategies-militaires')
assert record['published']=='2026-10-27' and len(record['sources'])==22
images=json.loads((ROOT/'docs/strategies-images.json').read_text(encoding='utf-8'))
for image in images:
 p=ROOT/'assets/strategies-media'/f"{image['id']}.webp"
 assert hashlib.sha256(p.read_bytes()).hexdigest()==image['webpSHA256']
# La publication depuis 5231c61 est terminée. Son périmètre global incluait
# l'outillage : comparer désormais tous les fichiers servis au socle courant,
# en conservant au-dessus le texte validé et les empreintes documentaires.
if '--content-only' not in sys.argv:
 print(f'PASS : {check_production()} fichiers de production conservés depuis HEAD.')
print('PASS : six chapitres, quatre activités, ancres, médias, quatre empreintes SHA-256, métadonnées publiques, bibliothèque et sitemap.'+(' Mode contenu seul explicite.' if '--content-only' in sys.argv else ''))
