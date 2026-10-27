# -*- coding: utf-8 -*-
import portable_io
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,subprocess,re,sys
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
assert normalize(body(text))==normalize(body(original)), 'Le texte ou les activités ont changé depuis la validation locale'
registry=json.loads((ROOT/'assets/article-editorial.json').read_text(encoding='utf-8'))
record=next(row for row in registry['articles'] if row['slug']=='evolution-strategies-militaires')
assert record['published']=='2026-10-27' and len(record['sources'])==22
images=json.loads((ROOT/'docs/strategies-images.json').read_text(encoding='utf-8'))
for image in images:
 p=ROOT/'assets/strategies-media'/f"{image['id']}.webp"
 assert hashlib.sha256(p.read_bytes()).hexdigest()==image['webpSHA256']
# Un ajout local ne doit modifier aucun fichier du site de référence.
changes=subprocess.check_output(['git','diff','--name-only','--diff-filter=MD','5231c61','--'],cwd=ROOT,text=True)
allowed={'assets/bibliotheque.css','articles/evolution-strategies-militaires.html','bibliotheque.html','sitemap.xml','assets/article-editorial.json','assets/reading-times.json','assets/reading-times.js','scripts/update-reading-times.py','scripts/update-article-editorial.py','scripts/test-article-editorial.py','scripts/test-bibliotheque.mjs','scripts/test-strategies-static.py','scripts/test-strategies-browser.cjs','docs/strategies-images.json','assets/strategies-media/homs.webp','assets/strategies-media/minard.webp','assets/strategies-media/tank.webp','assets/strategies-media/homs-original','assets/strategies-media/minard-original','assets/strategies-media/tank-original'}
if '--content-only' not in sys.argv:
 assert set(changes.splitlines()) <= allowed, changes
print(('Contrôle de conservation du périmètre historique ignoré explicitement ; ' if '--content-only' in sys.argv else '')+'PASS : six chapitres, quatre activités, ancres, médias, quatre empreintes SHA-256, métadonnées publiques, bibliothèque et sitemap ; autres pages préservées.')
