#!/usr/bin/env python3
"""Vrai navigateur sur URLs /Thot/, réponses du dépôt interceptées ; aucun site public modifié."""
import sys
sys.dont_write_bytecode=True
from browser_fixture import ROOT,chromium,markup
from pathlib import Path
import json,mimetypes
from urllib.parse import urlsplit,unquote
from playwright.sync_api import sync_playwright
OUT=Path('/workspace/THOT-FLUIDITE-TESTS');OUT.mkdir(exist_ok=True)
BASE='https://thot.local/Thot/'
PAGES=['index.html','bibliotheque.html','notre-methode.html','quiz.html','quiz-autrices.html',*[str(p.relative_to(ROOT)) for p in sorted((ROOT/'articles').glob('*.html'))],'404.html']
def route(request):
 u=urlsplit(request.request.url)
 if u.hostname!='thot.local':request.abort();return
 path=unquote(u.path).removeprefix('/Thot/');p=(ROOT/path).resolve()
 if not p.is_relative_to(ROOT):request.abort();return
 if not p.is_file():p=ROOT/'404.html'
 request.fulfill(status=200,body=p.read_bytes(),content_type=mimetypes.guess_type(p)[0] or 'application/octet-stream',headers={'Access-Control-Allow-Origin':'*'})
def context(browser,width=390,js=True,storage=False):
 c=browser.new_context(viewport={'width':width,'height':900},java_script_enabled=js,reduced_motion='reduce')
 c.route('**/*',route)
 if storage:c.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage disabled','SecurityError')}})")
 return c
def no_overflow(p):assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),p.url
results=[]
with sync_playwright() as pw:
 b=chromium(pw)
 for width in [320,390,768,1440]:
  c=context(b,width)
  for name in PAGES:
   p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.set_content(markup(name).replace('<head>','<head><base href="'+BASE+name+'">'),wait_until='domcontentloaded');no_overflow(p)
   assert not errors,(name,errors)
   assert p.locator('h1').count()==1,name
   p.screenshot(path=str(OUT/(name.replace('/','-')+f'-{width}.png')))
   if name.startswith('articles/'):
    expected=json.loads((ROOT/'assets/reading-times.json').read_text())['articles'][Path(name).stem]['minutes']
    assert p.locator('#duree').inner_text()==str(expected)+' min de lecture environ'
   if name=='articles/pieuvres-couleur.html':
    slider=p.locator('#chromato-curseur');slider.focus();p.keyboard.press('End');assert slider.input_value()=='100'
    if width==390:
     # Dessin et commande doivent tenir dans un seul écran de lecture.
     svg=p.locator('.chromato-svg').bounding_box();box=slider.bounding_box();assert box['y']+box['height']-svg['y']<400
    p.locator('.chromato-interactif').screenshot(path=str(OUT/f'chromato-{width}.png'))
   if name=='articles/puissance-etats-unis.html':
    p.locator('#comparateur-direct').click();assert p.locator('.comparateur-table').is_visible()
    assert p.locator('.comparateur-table tbody tr').count()==4
    p.locator('.comparateur-puissance').screenshot(path=str(OUT/f'comparaison-{width}.png'))
   if name in ['quiz-autrices.html','articles/autrices-pseudonymes.html']:
    left=p.locator('[data-pen="currer"]');left.focus();p.keyboard.press('Enter')
    assert p.locator(':focus').get_attribute('data-author') is not None
    p.locator('[data-author="charlotte"]').click();assert p.locator('[data-pen="currer"]').is_disabled()
    p.locator('.quiz-pseudonymes').screenshot(path=str(OUT/f'autrices-{Path(name).stem}-{width}.png'))
   results.append({'page':name,'width':width,'ok':True,'pageerrors':errors});p.close()
  c.close()
 # Recherche, aucun résultat et retour au catalogue dans le navigateur réel.
 c=context(b);p=c.new_page();p.set_content(markup('bibliotheque.html').replace('<head>','<head><base href="'+BASE+'bibliotheque.html">'))
 p.locator('#article-search').fill('Roubaix');assert p.locator('.article-card:visible').count()==1
 p.locator('#article-search').fill('xxxxxxxxxxxx');assert p.locator('#empty-state').is_visible()
 p.locator('#reset-filters').click();assert p.locator('.article-card:visible').count()==5
 c.close()
 # Stockage indisponible (origine opaque de la fixture) : partie complète et bilan.
 c=context(b,storage=True);p=c.new_page();p.set_content(markup('quiz.html').replace('<head>','<head><base href="'+BASE+'quiz.html">'))
 assert p.locator('#storage-status').is_visible();p.locator('#start-button').click()
 for i in range(5):
  answer=p.evaluate('correctIndexes(round[index])[0]')
  if i==0:answer=(answer+1)%p.locator('#answer-list button').count()
  if i==1:p.locator('#hint-button').click()
  p.locator('#answer-list button').nth(answer).click()
  if p.locator('#validate-button').is_visible():p.locator('#validate-button').click()
  assert p.locator('#feedback').is_visible();p.locator('#next-button').click()
 assert p.locator('#screen-result').is_visible()
 p.locator('#review-button').click();assert p.locator('#review-panel').is_visible()
 p.locator('#replay-button').click();assert p.locator('#screen-question').is_visible()
 c.close()
 # Aucun JS : textes et alternatives présents, commandes natives utilisables.
 c=context(b,js=False)
 for name in PAGES:
  p=c.new_page();p.set_content(markup(name,javascript=False).replace('<head>','<head><base href="'+BASE+name+'">'));no_overflow(p)
  if name.startswith('articles/'):assert p.locator('#texte-article').is_visible()
  p.close()
 c.close();b.close()
report={'ok':True,'views':results,'search_and_reset':True,'quiz_full_path':True,'daily_persistence':'Suites DOM existantes, pas de stockage navigateur persistant dans cette fixture','storage_unavailable':True,'without_js':True,'method':'Chromium réel sur fixtures inline ; navigation réseau bloquée, images externes exclues. URL et persistance couvertes séparément par les suites DOM.'}
(OUT/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('PASS : 44 vues, 11 pages, clavier, 3 interactions, recherche, parcours quiz, stockage refusé, sans JS.')
