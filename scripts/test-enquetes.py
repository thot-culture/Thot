#!/usr/bin/env python3
"""Recette de trois enquêtes dans Chromium réel, sur fixtures des fichiers locaux."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse,json,hashlib,subprocess,re
from browser_fixture import ROOT,chromium,markup

def static_checks():
 data=json.loads((ROOT/'assets/enquetes/dossiers.json').read_text())
 assert [d['slug'] for d in data]==['lumo','hausse','image']
 meta=json.loads((ROOT/'docs/ENQUETES-PHOTO-SOURCE.json').read_text())
 assert hashlib.sha256((ROOT/'assets/enquetes/apollo08-earthrise-original.jpg').read_bytes()).hexdigest()==meta['sha256']
 assert meta['sha256']=='1e48784b764f26c5e0755875d86efe088cb5cf9d183b7814956131652cb770c7'
 assert 9/10*100==90 and 10/1000*100==1 and 1000-10==990
 assert 10-8==2 and (10-8)/8*100==25
 js=(ROOT/'assets/enquetes/enquetes.js').read_text()
 assert not re.search(r'localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|innerHTML',js)
 # Les articles et le moteur/banques/dates ne sont même pas modifiés.
 for name in ['assets/site.js','assets/illustrations.json',*[str(p.relative_to(ROOT)) for p in (ROOT/'assets').glob('questions-*.js')]]:
  assert (ROOT/name).read_bytes()==subprocess.check_output(['git','show','52bb04c:'+name],cwd=ROOT),name
 subprocess.run(['python3','scripts/build-enquetes.py','--check'],cwd=ROOT,check=True)
 subprocess.run(['python3','scripts/check-editorial.py'],cwd=ROOT,check=True)
 print('PASS : 90 %, 1 %, 990 absents, +2 €, +25 %, image intacte, absence de stockage/réseau, quiz/sources protégés ; articles comparés avec les amendements autorisés.')

def browser_checks(out):
 from playwright.sync_api import sync_playwright
 out.mkdir(parents=True,exist_ok=True);records=[]
 data=json.loads((ROOT/'assets/enquetes/dossiers.json').read_text())
 def load(browser,name,width,js=True,broken=False):
  ctx=browser.new_context(viewport={'width':width,'height':900},java_script_enabled=js,offline=True,reduced_motion='reduce')
  page=ctx.new_page();errors=[];console=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:console.append(m.text) if m.type=='error' else None)
  source=markup('enquetes/'+name+'.html',javascript=js)
  if broken:source=re.sub(r'(<img id="photo-original" src=")[^"]+',r'\1data:image/jpeg;base64,bm90LWFuLWltYWdl',source)
  page.set_content(source,wait_until='domcontentloaded')
  return ctx,page,errors,console
 def no_overflow(page):assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
 def choose(page,ids):
  for box in page.locator('[data-proof]').all():box.set_checked(box.get_attribute('value') in ids)
 def conclude(page,value,reason):
  page.locator('#avis').select_option(value);page.locator('#raison').fill(reason)
  page.locator('button[type=submit]').click();assert page.locator('.resolution').is_visible()
  assert page.evaluate('document.activeElement.classList.contains("resolution")')
 with sync_playwright() as p:
  browser=chromium(p)
  for width in (320,390,768,1440):
   c,page,errors,console=load(browser,'index',width)
   assert page.locator('.investigation-card').count()==3
   assert page.locator('.brand').evaluate('(n)=>getComputedStyle(n).color')=='rgb(242, 220, 175)'
   no_overflow(page);page.screenshot(path=str(out/f'accueil-{width}.png'),full_page=True)
   assert not errors and not console,(errors,console);c.close()
   for dossier in data:
    slug=dossier['slug'];c,page,errors,console=load(browser,slug,width)
    assert page.locator('[data-ready="true"]').count()==1
    page.screenshot(path=str(out/f'{slug}-entree-{width}.png'))
    assert page.locator('[data-notebook]').inner_text()=='Aucune preuve retenue.'
    # Pièces et indices ouverts au clavier, indépendamment des preuves retenues.
    first=page.locator('.piece summary').first;first.focus();page.keyboard.press('Enter')
    assert page.locator('.piece').first.get_attribute('open') is not None
    assert page.locator('[data-proof]:checked').count()==0
    for hint in page.locator('.hint summary').all():hint.click()
    assert page.locator('.hint[open]').count()==3
    if slug=='hausse':
     fixed=page.locator('#graph-zero').inner_html()
     slider=page.locator('#depart');slider.focus();page.keyboard.press('End');assert slider.input_value()=='7'
     assert page.locator('#graph-reglable [data-bottom]').text_content().startswith('Départ : 7 €')
     assert page.locator('#graph-zero').inner_html()==fixed
     heights=[float(x.get_attribute('height')) for x in page.locator('#graph-reglable rect').all()]
     assert abs(heights[1]/heights[0]-3)<.0001
     assert [v.text_content() for v in page.locator('#graph-reglable [data-value]').all()]==['8 €','10 €']
     page.locator('.atelier').screenshot(path=str(out/f'hausse-graphiques-{width}.png'))
     page.locator('[data-zero]').click();assert slider.input_value()=='0'
     heights=[float(x.get_attribute('height')) for x in page.locator('#graph-reglable rect').all()];assert abs(heights[1]/heights[0]-1.25)<.0001
     page.keyboard.press('Tab')
    if slug=='image':
     page.wait_for_function('document.querySelector("#photo-original").naturalWidth===1041')
     assert page.locator('#photo-cadre').evaluate('(n)=>n.classList.contains("is-cropped")')
     page.locator('.atelier').screenshot(path=str(out/f'image-cadrage-{width}.png'))
     page.locator('[data-photo="full"]').focus();page.keyboard.press('Enter')
     assert not page.locator('#photo-cadre').evaluate('(n)=>n.classList.contains("is-cropped")')
     page.locator('.atelier').screenshot(path=str(out/f'image-entiere-{width}.png'))
    submit=page.locator('button[type=submit]');submit.hover()
    assert submit.evaluate('(n)=>getComputedStyle(n).backgroundColor')=='rgb(41, 67, 88)'
    # Aucun appui : ne pas confondre carnet insuffisant et dossier sans réponse.
    conclude(page,dossier['expected'],'Je propose cet avis, mais je n’ai encore retenu aucune pièce.')
    assert 'Votre carnet est vide' in page.locator('[data-result]').inner_text()
    assert 'Cela ne signifie pas que les pièces du dossier sont insuffisantes' in page.locator('[data-result]').inner_text()
    page.locator('[data-revise]').click();assert page.locator('#avis').evaluate('(n)=>n===document.activeElement')
    # Avis excessif avec une seule pièce : retour spécifique, texte utilisateur sûr.
    choose(page,[dossier['pieces'][0]['id']])
    wrong='etayee' if slug!='hausse' else 'contredite'
    conclude(page,wrong,'<img src=x onerror=alert(1)> Je veux tester cette interprétation.')
    assert page.locator('[data-result] img').count()==0
    assert dossier['pieces'][0]['feedback'] in page.locator('[data-result]').inner_text()
    assert page.locator('.review-note').count()>0
    # Conclusion proportionnée mais carnet partiel : le chiffre et la présentation
    # ne doivent pas être confondus, ni une bonne formule prise pour une preuve.
    conclude(page,dossier['expected'],'Je n’ai retenu pour le moment que la première observation.')
    partial=page.locator('[data-result]').inner_text()
    if slug=='hausse':assert 'Votre carnet ne traite pas encore la présentation' in partial
    else:assert 'La bonne formule seule ne remplace pas sa justification' in partial
    # Réserve provisoire : les pièces autorisent parfois une réponse précise.
    conclude(page,'insuffisante','Je préfère vérifier les pièces avant de trancher.')
    assert 'permettent pourtant d’aller plus loin' in page.locator('[data-result]').inner_text()
    # Conclusion proportionnée, preuves et retour sur chacune des pièces retenues.
    ids=dossier['required'];choose(page,ids)
    conclude(page,dossier['expected'],'Je relie ma conclusion aux informations retenues dans mon carnet.')
    text=page.locator('[data-result]').inner_text()
    assert 'Votre conclusion et les preuves retenues vont ensemble' in text
    for piece in dossier['pieces']:
     if piece['id'] in ids:assert piece['feedback'] in text
    assert dossier['limits'] in text and dossier['next'] in text and dossier['reflex'] in text
    assert [link.get_attribute('href') for link in page.locator('[data-result] a').all()]==['#piece-'+p['id'] for p in dossier['pieces'] if p['id'] in ids]
    page.locator('.resolution').screenshot(path=str(out/f'{slug}-denouement-{width}.png'))
    if slug in ('hausse','image'):
     alternate=['valeurs','echelle'] if slug=='hausse' else ['provenance']
     choose(page,alternate);conclude(page,dossier['expected'],'Je peux expliquer ces appuis sans recopier la solution.')
     assert 'Votre conclusion et les preuves retenues vont ensemble' in page.locator('[data-result]').inner_text()
     choose(page,ids);conclude(page,dossier['expected'],'Je relie ma conclusion aux informations retenues dans mon carnet.')
    # Révision : conserver phrase/preuves ; ne pas laisser une ancienne correction active.
    page.locator('[data-revise]').click();assert page.locator('[data-proof]:checked').count()==len(ids)
    page.locator('#raison').fill('Nouvelle justification : je dois encore vérifier certains éléments.')
    assert not page.locator('.resolution').is_visible()
    page.locator('[data-reset]').click();assert page.locator('[data-proof]:checked').count()==0
    assert page.locator('#avis').input_value()=='' and page.locator('#raison').input_value()==''
    assert page.locator('.hint[open]').count()==0
    no_overflow(page);assert not errors and not console,(slug,errors,console)
    records.append({'slug':slug,'width':width,'ok':True,'pageerrors':errors,'console_errors':console});c.close()
  # Sans JavaScript : toutes les pièces et explications restent lisibles, aucune commande inerte.
  for width in (320,390,768,1440):
   for slug in ('index','lumo','hausse','image'):
    c,page,errors,console=load(browser,slug,width,js=False)
    if slug!='index':
     assert not page.locator('form').is_visible()
     assert page.locator('[data-proof]:visible').count()==0
     for summary in page.locator('.piece summary').all():summary.click()
     page.locator('.text-solution summary').click();assert page.locator('.text-solution p').first.is_visible()
     if slug=='image':assert not page.locator('#photo-cadre').evaluate('(n)=>n.classList.contains("is-cropped")')
    no_overflow(page);assert not errors and not console,(slug,errors,console);c.close()
  # Fichier image cassé : expliquer, proposer un nouvel essai et laisser les sources lisibles.
  c,page,errors,console=load(browser,'image',390,broken=True)
  assert page.locator('#photo-erreur').is_visible()
  page.locator('[data-retry]').click();assert 'Nouvelle tentative' in page.locator('[data-status]').inner_text()
  choose(page,['provenance','contexte']);conclude(page,'contredite','La notice décrit le contexte orbital.')
  assert 'L’image n’a pas chargé' in page.locator('[data-result]').inner_text()
  assert page.locator('.provenance a').count()==3
  assert not errors,errors;c.close()
  browser.close()
 report={'ok':True,'cases':records,'hub_four_widths':True,'without_js_all_widths':True,'image_failure':True,'storage':'Non utilisé ; aucune API de stockage appelée.','method':'Chromium réel sur fixtures locales des HTML/CSS/JS/image, réseau désactivé. Aucun test du site public.','limits':['Pas de lecteur d’écran audio, de téléphone physique ou de Safari/Firefox.','Durée de 3 à 5 minutes visée, non mesurée auprès de lecteurs.']}
 (out/'browser.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('PASS : trois dossiers de bout en bout à 320/390/768/1440 px, carnet, conclusions, indices, révision, clavier, graphes, photo, panne image et sans JS.')

if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--browser',action='store_true');ap.add_argument('--output',type=Path,default=Path('/workspace/THOT-ENQUETES-TESTS'));args=ap.parse_args()
 static_checks()
 if args.browser:browser_checks(args.output)
