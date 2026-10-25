#!/usr/bin/env python3
"""Recette indépendante du catalogue Explorer, des composants et des données."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
from datetime import date
import argparse,json,re,subprocess,hashlib
from PIL import Image
from browser_fixture import ROOT,markup,chromium
CAT=json.loads((ROOT/'assets/explorer/catalogue.json').read_text())['resources']

def static_checks():
 assert len(CAT)==10 and len({x['id'] for x in CAT})==10
 assert {x['collection'] for x in CAT}=={'atlas','chronologies','archives','defis'}
 for item in CAT:
  for field in ['title','description','discipline','category','url','references','date_published']:assert item[field],(item['id'],field)
  assert (ROOT/item['url']).is_file() and (ROOT/item['thumbnail']).is_file()
  assert date.fromisoformat(item['date_published']).isoformat()==item['date_published']
  with Image.open(ROOT/item['share_image']) as image:assert image.size==(1200,630)
  assert item['available']
 events=json.loads((ROOT/'assets/explorer/roubaix-evenements.json').read_text())
 original=json.loads(re.search(r'const events = (\[[\s\S]*?\n\]);',(ROOT/'assets/roubaix-frise.js').read_text())[1])
 assert events==original and len(events)==8
 assert hashlib.sha1((ROOT/'assets/images/roubaix-laines-1917-original.jpg').read_bytes()).hexdigest()=='7abb531df5971f90dffb4a47eef23f295beaafb1'
 bank=json.loads((ROOT/'assets/explorer/anagrammes.json').read_text());assert len(bank)==8 and len({w['discipline'] for w in bank})==5
 assert all(w['explanation'] and w['source'].startswith('https://') for w in bank)
 for path in ['assets/site.js','assets/questions-facile.js','assets/questions-intermediaire.js','assets/questions-expert.js','assets/illustrations.json','assets/roubaix-frise.js']:
  assert (ROOT/path).read_bytes()==subprocess.check_output(['git','show','52bb04c:'+path],cwd=ROOT),path
 amendments=json.loads((ROOT/'docs/CORRECTIONS-SCIENTIFIQUES-THOT20.json').read_text())
 assert len(amendments['changes'])==8 and all(x['sources'] and x['old']!=x['new'] for x in amendments['changes'])
 for script in ['scripts/build-explorer.py','scripts/build-enquetes.py','scripts/update-reading-times.py','scripts/update-article-editorial.py']:
  subprocess.run(['python3',script,'--check'],cwd=ROOT,check=True)
 subprocess.run(['python3','scripts/check-editorial.py'],cwd=ROOT,check=True)
 print('PASS : dix ressources, huit événements identiques, original intact, huit mots sourcés/cinq disciplines, quiz inchangé et amendements explicites.')

def browser_checks(out):
 from playwright.sync_api import sync_playwright
 out.mkdir(parents=True,exist_ok=True);results=[]
 pages=['explorer.html']+[x['url'] for x in CAT]
 words=json.loads((ROOT/'assets/explorer/anagrammes.json').read_text())
 def normalized(s):
  import unicodedata
  return ''.join(c for c in unicodedata.normalize('NFD',s.upper()) if c.isalpha())
 def load(browser,path,width,javascript=True):
  c=browser.new_context(viewport={'width':width,'height':900},offline=True,java_script_enabled=javascript,reduced_motion='reduce')
  p=c.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
  p.set_content(markup(path,javascript),wait_until='domcontentloaded')
  return c,p,errors
 def fits(p):assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),p.url
 with sync_playwright() as pw:
  b=chromium(pw)
  for width in [320,390,768,1440]:
   for path in pages:
    c,p,errors=load(b,path,width)
    assert p.locator('h1').count()==1,path
    p.screenshot(path=str(out/(path.replace('/','-')+f'-{width}.png')))
    if path=='explorer.html':
     assert p.locator('[data-resource]:visible').count()==10
     p.locator('#explorer-query').fill('laine');assert p.locator('[data-resource]:visible').count()==1
     p.locator('#explorer-query').fill('inexistantzz');assert p.locator('.explorer-empty').is_visible()
     p.locator('[data-reset-explorer]').click();assert p.locator('[data-resource]:visible').count()==10
     p.locator('#explorer-collection').select_option('atlas');assert p.locator('[data-resource]:visible').count()==1
     assert 'sans carte' in p.locator('[data-resource]:visible').inner_text().lower()
     p.locator('button[type=reset]').click();p.locator('#explorer-query').fill('Lumo');assert p.locator('[data-resource]:visible').count()==1
    elif '/archives/' in path:
     assert p.locator('#laine-commandes').is_visible()
     assert p.locator('#laine-image').get_attribute('src') != p.locator('#laine-image').get_attribute('data-full-src') # original chargé seulement à la demande
     p.locator('[data-document-action=open]').click()
     p.wait_for_function('document.querySelector("#laine-statut").textContent.includes("Grossissement")')
     p.locator('[data-document-action=reset]').click();assert 'Vue entière' in p.locator('#laine-statut').inner_text()
     p.locator('#transcription-laine summary').click();assert '5, rue de Courtrai' in p.locator('#transcription-laine').inner_text()
    elif '/chronologies/' in path:
     buttons=p.locator('[data-timeline-index]');assert buttons.count()==8
     for index,button in enumerate(buttons.all()):
      button.click();assert button.get_attribute('aria-pressed')=='true'
      assert p.locator('[data-event-source]').get_attribute('href')=='#'+original_event_ref(index)
     buttons.first.focus();p.keyboard.press('End');assert buttons.last.evaluate('(n)=>n===document.activeElement')
     assert p.locator('.timeline-continuous li').count()==8
    elif '/atlas/' in path:
     for name in ['grand-chemin','courtrai','batiments']:
      p.locator('[data-place="'+name+'"]').click();assert p.locator('[data-place-panel="'+name+'"]').is_visible()
     assert 'pas de coordonnées' in p.locator('[data-place-status]').inner_text()
    elif '/defis/anagrammes' in path:
     def current():
      letters=sorted(normalized(p.locator('[data-mixed]').inner_text()))
      return next(w for w in words if sorted(normalized(w['word']))==letters)
     old=current();p.locator('#anagram-answer').fill('XYZXYZ');p.locator('[data-word-form] button').click();assert 'pas le mot attendu' in p.locator('[data-word-feedback]').inner_text()
     p.locator('[data-hint-word]').click();assert p.locator('#anagram-hint').is_visible()
     p.locator('#anagram-answer').fill(normalized(old['word']));p.locator('[data-word-form] button').click();assert old['explanation'] in p.locator('[data-word-feedback]').inner_text()
     assert p.locator('[data-word-feedback] a').get_attribute('href')==old['source']
     p.locator('[data-new-word]').click();assert current()['word']!=old['word']
     p.locator('#anagram-subject').select_option('Histoire');assert p.locator('[data-new-word]').is_disabled()
     p.locator('#anagram-answer').fill('dynastie123');p.locator('[data-word-form] button').click();assert 'pas le mot attendu' in p.locator('[data-word-feedback]').inner_text()
     p.locator('#anagram-answer').fill('dynastie');p.locator('#anagram-answer').press('Enter');assert 'Mot retrouvé' in p.locator('[data-word-feedback]').inner_text()
     p.locator('.anagram-widget').screenshot(path=str(out/f'anagrammes-{width}.png'))
    elif path.endswith('couleurs-cephalopodes.html'):
     assert p.locator('.structure-controls').is_visible()
     for name in ['chromatophore','sac','muscles','iridophores','leucophores','lumiere','nerfs']:
      button=p.locator('[data-structure="'+name+'"]');button.focus();p.keyboard.press('Enter');assert p.locator('[data-structure-panel="'+name+'"]').is_visible()
     toggle=p.locator('[data-skin-toggle=iridophores]');toggle.uncheck();assert p.locator('[data-skin-layer=iridophores]').get_attribute('aria-hidden')=='true';assert not p.locator('[data-skin-layer=iridophores]').is_visible();toggle.check();assert p.locator('[data-skin-layer=iridophores]').is_visible()
     p.locator('.cephalo-atlas').screenshot(path=str(out/f'peau-{width}.png'))
    elif path.endswith('chromatophore.html'):
     slider=p.locator('#chromato-curseur');slider.focus();p.keyboard.press('End');assert slider.input_value()=='100'
    elif '/geopolitique/' in path:
     assert p.locator('[data-cas=iran]').count()==0
     p.locator('#comparateur-direct').click();assert p.locator('.comparateur-table tbody tr').count()==4
     p.locator('#comparateur-reference').click();p.locator('#comparateur-reference').click();p.locator('[data-cas=afghanistan]').click()
     assert p.locator('#comparaison-reference').inner_text().startswith('Référence · Daech')
    fits(p);assert not errors,(path,errors);results.append({'path':path,'width':width,'ok':True});c.close()
  for width in [320,390,768,1440]:
   for path in pages:
    c,p,errors=load(b,path,width,False)
    if path=='explorer.html':assert p.locator('[data-resource]:visible').count()==10 and not p.locator('.explorer-search').is_visible()
    if '/chronologies/' in path:assert p.locator('.timeline-continuous li').count()==8
    if '/archives/' in path:p.locator('#transcription-laine summary').click();assert p.locator('#transcription-laine blockquote').is_visible()
    if '/anagrammes.html' in path:assert not p.locator('.anagram-play').is_visible();p.locator('.wordbank summary').click();assert p.locator('.wordbank li').count()==8
    if path.endswith('couleurs-cephalopodes.html'):assert p.locator('[data-structure-panel]:visible').count()==7
    fits(p);assert not errors,(path,errors);c.close()
  # L’article garde le complément et le lecteur historiques fonctionnels.
  c,p,errors=load(b,'articles/pieuvres-couleur.html',390);assert p.locator('.cephalo-atlas .structure-controls').is_visible();assert p.locator('#chromato-curseur').is_enabled();fits(p);assert not errors;c.close()
  b.close()
 (out/'browser.json').write_text(json.dumps({'ok':True,'views':results,'without_js_four_widths':True,'native_keyboard':True,'method':'Chromium réel sur fixtures locales ; navigation publique non testée.'},ensure_ascii=False,indent=2)+'\n')
 print('PASS : onze pages Explorer à quatre largeurs, composants, recherche, indices, corrections, clavier et sans JS.')
def original_event_ref(index):return json.loads((ROOT/'assets/explorer/roubaix-evenements.json').read_text())[index]['ref']
if __name__=='__main__':
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--browser',action='store_true');ap.add_argument('--output',type=Path,default=Path('/workspace/THOT20/tests'));args=ap.parse_args();static_checks()
 if args.browser:browser_checks(args.output)
