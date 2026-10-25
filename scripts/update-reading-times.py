#!/usr/bin/env python3
"""Durées reproductibles à 210 mots/min, hors sources, documents et activités facultatives."""
import argparse,json,re,sys
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
class Reading(HTMLParser):
 def __init__(self):
  super().__init__();self.stack=[];self.words=[];self.active=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id')=='texte-article':self.active=True
  blocked=bool(self.stack and self.stack[-1][1]) or tag in {'script','style','noscript','figure','svg'} or bool(set(a.get('class','').split()) & {'sources','related-reading','science-reperes','quiz-pseudonymes','authorite-game','thot-visual-guide','comparateur-puissance','chronologie-afghanistan','roubaix-frise','cephalo-atlas'}) or a.get('id') in {'explorer-roubaix','transcription-laine','roubaix-reperes-texte','activites-autorite-aide'}
  if tag not in {'img','br','hr','input','meta','link','source','wbr'}:self.stack.append((tag,blocked))
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
  if tag=='article' and not any(entry[0]=='article' for entry in self.stack):self.active=False
 def handle_data(self,data):
  if self.active and not (self.stack and self.stack[-1][1]):self.words.extend(re.findall(r"\b[\wÀ-ÿ]+(?:[’'-][\wÀ-ÿ]+)*\b",data))
def outputs():
 records={}
 for p in sorted((ROOT/'articles').glob('*.html')):
  parser=Reading();parser.feed(p.read_text());words=len(parser.words)
  records[p.stem]={'words':words,'minutes':max(1,(words+209)//210)}
 config={'method':'210 mots/min ; texte principal, hors sources, figures et activités facultatives. Estimation, pauses documentaires en supplément.','articles':records}
 result={ROOT/'assets/reading-times.json':json.dumps(config,ensure_ascii=False,indent=2)+'\n'}
 result[ROOT/'assets/reading-times.js']='/* Généré par scripts/update-reading-times.py, sans accès réseau. */\n(() => { const times = '+json.dumps(records,ensure_ascii=False)+'; const slug = (new URL(document.querySelector("link[rel=canonical]")?.href || location.href)).pathname.split("/").pop().replace(/\\.html$/, ""); const target = document.getElementById("duree"); if (target && times[slug]) target.textContent = times[slug].minutes + " min de lecture environ"; })();\n'
 for p in list(ROOT.glob('*.html'))+list((ROOT/'articles').glob('*.html')):
  s=p.read_text()
  if p.stem in records:s=re.sub(r'(<span id="duree">)[^<]+',lambda m:m[1]+str(records[p.stem]['minutes'])+' min de lecture environ',s)
  # Cartes et recommandations : le lien de l’article identifie la durée, jamais sa position.
  pattern=r'<(?:article|section)\b[^>]*class="[^"]*(?:discovery-card|latest-story|related-reading)[^"]*"[\s\S]*?</(?:article|section)>'
  def card(m):
   block=m[0];target=re.search(r'href="(?:\.\./)?(?:articles/)?([a-z-]+)\.html"',block)
   if target and target[1] in records:block=re.sub(r'\d+ min de lecture',str(records[target[1]]['minutes'])+' min de lecture',block)
   return block
  s=re.sub(pattern,card,s)
  result[p]=s
 return result
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--check',action='store_true');args=ap.parse_args();bad=[]
 for p,text in outputs().items():
  if args.check:
   if not p.exists() or p.read_text()!=text:bad.append(str(p.relative_to(ROOT)))
  else:p.write_text(text)
 if bad:sys.exit('Durées à régénérer : '+', '.join(bad))
 print('PASS : durées communes et rendus statiques cohérents' if args.check else 'Durées générées, contenu scientifique inchangé.')
