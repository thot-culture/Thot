#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recette Explorer : conservation stricte puis vrais DOM/CSS/JS dans Chromium.

Le navigateur utilise des fixtures locales à médias incorporés. Il ne visite ni
GitHub Pages ni un serveur HTTP. La reprise avec stockage est explicitement
simulée ; le refus natif du stockage en origine opaque est testé séparément.
"""
import portable_io
from pathlib import Path
from html.parser import HTMLParser
import argparse
import base64
import hashlib
import json
import mimetypes
import re
import subprocess
import sys
import zipfile
ROOT=Path(__file__).resolve().parents[1];ASSET=ROOT/'assets/explorer-v2';BASE='0aa6d452be6e5b1add58aa5cc54ee3d88fb307fa'
PAGES=['explorer.html','explorer/enquetes/mer-aral.html','explorer/atlas/rome-expansion.html'];WIDTHS=(320,390,768,1440)

def read(path):return json.loads(path.read_text(encoding='utf-8'))
def static_checks():
    # Tout fichier préexistant est conservé octet pour octet, sauf trois
    # intégrations explicites et l'actualisation ciblée du test de retrait.
    tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT,text=True,encoding='utf-8').splitlines()
    for name in tracked:
        if name=='scripts/test-stabilisation.py':continue
        before=subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT)
        path=ROOT/name;assert path.is_file(),name
        current=path.read_bytes()
        if name in ('index.html','bibliotheque.html'):current=current.replace(b'<a href="explorer.html">Explorer</a>',b'')
        if name=='sitemap.xml':
            for page in PAGES:current=current.replace(('  <url><loc>https://thot-culture.github.io/Thot/'+page+'</loc></url>\n').encode('utf-8'),b'')
        assert current==before,'Modification non autorisée du socle : '+name
    aral=read(ASSET/'data/aral.json');rome=read(ASSET/'data/rome-content.json');geo=read(ASSET/'data/rome-geography.json')
    assert len(aral['documents'])==11 and len(rome['chapters'])==6 and len(rome['people'])==4 and len(rome['documents'])==4
    assert [e['year'] for e in geo['epochs']]==[-400,-300,-200,-100,-60,-1,100,117]
    assert len({d['id'] for d in aral['documents']})==11
    for doc in aral['documents']:
        for k in ('id','title','nature','date','author','source','description','shows','limits','credit','license','tags'):assert doc[k],(doc['id'],k)
    assert hashlib.sha1((ASSET/'media/moynaq-original.jpg').read_bytes()).hexdigest()=='e1d1f651519c503a9688df5badd35b3249526d3e'
    for m in read(ASSET/'sources/rome-media.json'):
        assert hashlib.sha256((ROOT/m['display_path']).read_bytes()).hexdigest()==m['display_sha256']
        assert m['display_bytes']<200000
    for m in read(ASSET/'sources/aral-sources.json')['records']:
        if m.get('media'):assert hashlib.sha256((ROOT/m['media']).read_bytes()).hexdigest()==m['media_sha256']
    for name in ('historical-basemaps-source.zip','awmc-source.zip'):
        with zipfile.ZipFile(ASSET/'sources'/name) as z:assert z.testzip() is None and any('LICENSE' in n for n in z.namelist())
    assert read(ASSET/'data/historical-basemaps-derived.geojson')['license']=='GPL-3.0'
    assert read(ASSET/'data/awmc-derived.geojson')['license']=='ODbL-1.0'
    assert all(set(c['steps'])<={e['id'] for e in geo['epochs']} for c in rome['chapters'])
    subprocess.run([sys.executable,'scripts/build-explorer-reconstruction.py','--check'],cwd=ROOT,check=True)
    print('PASS : conservation exacte du socle, trois pages neuves, données, images et licences contrôlées.')

_CACHE={}
def fixture(name):
    if name in _CACHE:return _CACHE[name]
    html=(ROOT/name).read_text(encoding='utf-8')
    html=re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>',lambda m:'<style>'+(ROOT/m[1].removeprefix('/Thot/')).read_text(encoding='utf-8')+'</style>',html)
    html=re.sub(r'<script\b[^>]*src="[^"]+"[^>]*>\s*</script>','',html)
    for f in (ASSET/'media').iterdir():
        if f.suffix in ('.jpg','.webp','.png'):
            html=html.replace('/Thot/'+f.relative_to(ROOT).as_posix(),'data:'+mimetypes.guess_type(f)[0]+';base64,'+base64.b64encode(f.read_bytes()).decode())
    _CACHE[name]=html;return html

def browser_checks(out):
    from playwright.sync_api import sync_playwright
    from browser_fixture import chromium
    out.mkdir(parents=True,exist_ok=True);results=[]
    def page_for(browser,name,width,storage=None,javascript=True,broken=False):
        context=browser.new_context(viewport={'width':width,'height':960},offline=True,java_script_enabled=javascript,reduced_motion='reduce')
        page=context.new_page();errors=[];console=[];page.on('pageerror',lambda error:errors.append(str(error)));page.on('console',lambda m:console.append(m.text) if m.type=='error' else None)
        html=fixture(name)
        if broken:html=html.replace('data:image/jpeg;base64,','data:image/jpeg;base64,BROKEN',1)
        page.set_content(html,wait_until='load')
        if storage is not None:
            page.evaluate('''seed=>{const values={...seed};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(values,k)?values[k]:null,setItem:(k,v)=>{values[k]=String(v)},removeItem:k=>{delete values[k]}}});window.__testSaved=values;}''',storage)
        if javascript and name!=PAGES[0]:page.add_script_tag(content=(ASSET/('aral.js' if name==PAGES[1] else 'atlas.js')).read_text(encoding='utf-8'))
        return context,page,errors,console
    def good(page,errors,console):
        assert not errors,errors
        assert not console,console
        assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Débordement horizontal'
        assert page.evaluate('''()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length===new Set(ids).size;}'''),'Identifiant DOM dupliqué'
    def capture(page,name,element=None):
        page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
        page.wait_for_function("[...document.images].every(i=>i.complete)")
        page.evaluate("Promise.all([...document.images].map(i=>i.decode()))")
        assert page.evaluate("[...document.images].every(i=>i.naturalWidth>0)"),'Image non chargée'
        target=page.locator(element) if element else page
        target.screenshot(path=str(out/(name+'.png')),**({} if element else {'full_page':True}))
    def view(page,name):
        button=page.locator('[data-aral-view='+name+']')
        if button.is_visible():button.click()
    def submit(page,hypothesis,text):
        view(page,'argument');page.locator('[name=aral-hypothesis][value='+hypothesis+']').check();page.locator('#aral-conclusion').fill(text);page.locator('#aral-submit').click();assert page.locator('#aral-feedback').is_visible()
    with sync_playwright() as p:
        browser=chromium(p)
        for width in WIDTHS:
            print('Chromium : parcours à',width,'px',flush=True)
            c,page,errors,console=page_for(browser,PAGES[0],width)
            assert page.locator('a.xp-button').count()==2;good(page,errors,console);capture(page,'accueil-'+str(width));c.close();results.append({'page':'accueil','width':width,'result':'PASS'})
            c,page,errors,console=page_for(browser,PAGES[1],width)
            capture(page,'aral-ouverture-'+str(width));page.locator('#aral-start').focus();page.keyboard.press('Enter')
            assert page.locator('#aral-dossier').is_visible();assert page.locator('#aral-help').is_hidden()
            assert 'indisponible' in page.locator('#aral-storage').inner_text() # Refus natif, origine opaque.
            for n in range(1,12):
                id='d'+str(n).zfill(2);view(page,'documents');page.locator('[data-open-doc='+id+']').click();assert page.locator('#aral-document').is_visible();assert page.locator('#aral-document-title').inner_text()
                assert 'Ce qu’elle ne permet pas' in page.locator('#aral-document-body').inner_text()
                if n==1:
                    page.locator('#aral-doc-zoom').focus();page.keyboard.press('End');assert page.locator('.aral-image-controls output').inner_text()=='300 %'
                    page.get_by_role('button',name='Vue entière',exact=True).click();assert page.locator('.aral-image-controls output').inner_text()=='100 %'
                page.locator('#aral-doc-add').click();assert page.locator('[data-board-card='+id+']').count()==1
            assert len(page.evaluate('THOT_ARAL.getState().seen'))==11
            view(page,'board');page.locator('[data-board-mode=map]').click()
            before=page.evaluate('THOT_ARAL.getState().cards.d01.x');handle=page.locator('[data-move-card=d01]');handle.focus();page.keyboard.press('ArrowRight');assert page.evaluate('THOT_ARAL.getState().cards.d01.x')==before+25
            page.locator('#aral-selected-card').select_option('d01');page.locator('[data-board-move=down]').click();assert page.evaluate('THOT_ARAL.getState().cards.d01.y')==75
            # Glisser réel d'une poignée, en plus de l'alternative clavier.
            handle.scroll_into_view_if_needed();bounds=handle.bounding_box();before=page.evaluate('THOT_ARAL.getState().cards.d01.x');page.mouse.move(bounds['x']+20,bounds['y']+15);page.mouse.down();page.mouse.move(bounds['x']+60,bounds['y']+35,steps=5);page.mouse.up();assert page.evaluate('THOT_ARAL.getState().cards.d01.x')>before
            page.locator('#aral-arrange').click();page.locator('#aral-link-from').select_option('d04');page.locator('#aral-link-to').select_option('d06');page.locator('#aral-link-kind').select_option('context');page.locator('#aral-link-note').fill('Les prélèvements réduisent les apports au lac.');page.locator('#aral-link-save').click();assert len(page.evaluate('THOT_ARAL.getState().links'))==1
            page.locator('[data-edit-link]').click();page.locator('#aral-link-kind').select_option('confirm');page.locator('#aral-link-save').click();assert page.evaluate('THOT_ARAL.getState().links[0].kind')=='confirm'
            page.locator('#aral-hint').click();assert page.locator('#aral-help').is_visible();assert page.evaluate('THOT_ARAL.getState().hintIndex')==1
            view(page,'argument')
            for id in ('d04','d06','d07'):page.locator('[data-proof-role='+id+']').select_option('support')
            page.locator('[data-proof-role=d08]').select_option('insufficient');page.locator('[data-proof-role=d10]').select_option('counter')
            view(page,'board');page.locator('#aral-board-zoom').evaluate('(e)=>{e.value=60;e.dispatchEvent(new Event("input",{bubbles:true}))}');capture(page,'aral-tableau-'+str(width),'.aral-workspace')
            submit(page,'irrigation','Les prélèvements pour irriguer diminuent les apports des fleuves ; le Nord et le Sud ont des trajectoires différentes. Les années sèches aggravent certaines phases.')
            assert 'Des appuis documentaires' in page.locator('#aral-feedback-title').inner_text();assert 'D06' in page.locator('#aral-feedback-body').inner_text();assert 'ne réfute pas' in page.locator('#aral-feedback-body').inner_text();capture(page,'aral-bilan-'+str(width),'#aral-feedback')
            page.locator('#aral-revise').click();assert page.locator('#aral-feedback').is_hidden();assert len(page.evaluate('THOT_ARAL.getState().links'))==1
            submit(page,'disappearance','Toute la mer a définitivement disparu.');assert 'trop générale' in page.locator('#aral-feedback-body').inner_text()
            page.locator('#aral-revise').click();submit(page,'climate','Seul le climat explique toute la transformation.');assert 'ne suffisent pas' in page.locator('#aral-feedback-body').inner_text()
            page.locator('#aral-revise').click();submit(page,'uncertain','Il manque encore des éléments pour préciser chaque variation.');assert 'Suspendre' in page.locator('#aral-feedback-body').inner_text();page.locator('#aral-revise').click()
            for id in ['d'+str(n).zfill(2) for n in range(1,12)]:page.locator('[data-proof-role='+id+']').select_option('none')
            submit(page,'irrigation','Je n’ai pas encore retenu de preuve.');assert 'Aucune pièce n’est retenue' in page.locator('#aral-feedback-body').inner_text();page.locator('#aral-revise').click()
            view(page,'board');page.locator('[data-delete-link]').click();assert len(page.evaluate('THOT_ARAL.getState().links'))==0
            page.locator('#aral-selected-card').select_option('d01');page.locator('#aral-remove-selected').click();assert 'd01' not in page.evaluate('THOT_ARAL.getState().cards')
            page.locator('#aral-reset').click();page.locator('#aral-reset-cancel').click();assert len(page.evaluate('THOT_ARAL.getState().seen'))==11
            page.locator('#aral-reset').click();page.locator('#aral-reset-confirm').click();state=page.evaluate('THOT_ARAL.getState()');assert state['cards']=={} and state['seen']==[] and state['links']==[] and not state['hypothesis'];good(page,errors,console);c.close();results.append({'page':'aral','width':width,'result':'PASS','storage':'Refus natif : fonctionnement maintenu'})
            c,page,errors,console=page_for(browser,PAGES[2],width)
            assert page.locator('#atlas-primary [data-territory]').count()>0;capture(page,'rome-carte-'+str(width))
            assert page.locator('.atlas-library-image img').evaluate_all('(els)=>els.every(e=>e.getBoundingClientRect().height<=e.parentNode.getBoundingClientRect().height+1 && e.getBoundingClientRect().width<=e.parentNode.getBoundingClientRect().width+1)'), 'Image dépassant son cadre documentaire'
            for eid in ['bc400','bc300','bc200','bc100','bc60','bc1','ad100','ad117']:
                page.locator('#atlas-period').select_option(eid);assert page.evaluate('THOT_ATLAS.getState().epoch')==eid;assert page.locator('#atlas-primary [data-territory]').count()>0
            before=page.locator('#atlas-map').get_attribute('viewBox');page.locator('[data-atlas-zoom=in]').click();assert page.locator('#atlas-map').get_attribute('viewBox')!=before
            before=page.locator('#atlas-map').get_attribute('viewBox');page.locator('[data-atlas-pan=left]').click();assert page.locator('#atlas-map').get_attribute('viewBox')!=before
            page.locator('#atlas-map').focus();page.keyboard.press('ArrowRight');page.keyboard.press('Home');assert page.evaluate('THOT_ATLAS.getState().zoom')==1
            page.locator('#atlas-territory-select').select_option('place:roma');assert page.locator('#atlas-card').is_visible();assert 'Roma' in page.locator('#atlas-card-title').inner_text();capture(page,'rome-fiche-'+str(width),'.atlas-map-shell')
            page.locator('[data-atlas-close-card]').click();assert page.locator('#atlas-card').is_hidden();assert page.evaluate('document.activeElement.id')=='atlas-territory-select'
            page.locator('#atlas-city-layer [data-place=roma] circle').first.click();assert page.locator('#atlas-card').is_visible();page.locator('[data-atlas-close-card]').click()
            territory=page.locator('#atlas-primary [data-roman=true]').first;territory.focus();page.keyboard.press('Enter');assert page.locator('#atlas-card').is_visible();page.locator('[data-atlas-close-card]').click()
            for layer in ('cities','territories','borders','neighbors'):
                box=page.locator('[data-atlas-layer='+layer+']')
                if not box.is_visible():
                    assert layer=='neighbors' and box.is_disabled();continue
                before=box.is_checked();box.set_checked(not before);assert page.locator('#rome-atlas').get_attribute('data-show-'+layer)==str(not before).lower();box.set_checked(before)
            page.locator('#atlas-period').select_option('bc1');page.locator('[data-atlas-layer=neighbors]').check();assert page.locator('#atlas-primary [data-client=true]').first.is_visible();page.locator('[data-atlas-layer=neighbors]').uncheck();assert page.locator('#atlas-primary [data-client=true]').first.is_hidden();page.locator('#atlas-period').select_option('ad117')
            page.locator('#atlas-compare-toggle').check();assert page.locator('#atlas-secondary').get_attribute('hidden') is None
            page.locator('#atlas-before').select_option('bc300');page.locator('#atlas-after').select_option('ad117');page.locator('#atlas-reveal').focus();page.keyboard.press('ArrowRight');assert page.evaluate('THOT_ATLAS.getState().reveal')==51
            assert page.locator('#atlas-primary').get_attribute('clip-path')=='url(#atlas-right-clip)'
            for pct in (0,50,100):
                page.locator('#atlas-reveal').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',pct)
                assert float(page.locator('#atlas-clip-rect').get_attribute('width'))==1200*pct/100
                assert abs(float(page.locator('#atlas-right-rect').get_attribute('width'))-1200*(100-pct)/100)<.001
            page.locator('#atlas-reveal').evaluate('(e)=>{e.value=50;e.dispatchEvent(new Event("input",{bubbles:true}))}');capture(page,'rome-comparateur-'+str(width),'.atlas-map-column')
            page.locator('[data-atlas-mode=guided]').click();assert page.locator('#atlas-story').is_visible()
            for chapter in read(ASSET/'data/rome-content.json')['chapters']:
                page.locator('[data-atlas-chapter='+chapter['id']+']').click();assert chapter['title'] in page.locator('[data-story-title]').inner_text();assert page.evaluate('THOT_ATLAS.getState().epoch')==chapter['steps'][0]
            page.locator('[data-atlas-chapter=italy]').click();page.locator('[data-atlas-step=next]').click();assert page.evaluate('THOT_ATLAS.getState().epoch')=='bc300';page.locator('[data-atlas-step=previous]').click();assert page.evaluate('THOT_ATLAS.getState().epoch')=='bc400'
            capture(page,'rome-guide-'+str(width),'.atlas-workspace');page.locator('#atlas-period').select_option('ad117');assert page.evaluate('THOT_ATLAS.getState().mode')=='free';page.locator('[data-atlas-mode=free]').first.click();assert page.locator('#atlas-story').is_hidden()
            for kind,items in [('person',read(ASSET/'data/rome-content.json')['people']),('document',read(ASSET/'data/rome-content.json')['documents'])]:
                for item in items:
                    button=page.locator('[data-atlas-'+kind+'='+item['id']+']');button.click();assert page.locator('#atlas-modal').is_visible();assert item.get('name',item.get('title')) in page.locator('#atlas-modal-title').inner_text();page.keyboard.press('Escape');assert page.locator('#atlas-modal').is_hidden();assert button.evaluate('(e)=>e===document.activeElement')
            good(page,errors,console);c.close();results.append({'page':'rome','width':width,'result':'PASS'})
        # Reprise simulée, dans deux pages neuves, avec le vrai code de lecture/écriture.
        c,page,errors,console=page_for(browser,PAGES[1],390,storage={'quiz-sentinel':'préservé'})
        page.locator('#aral-start').click();page.locator('[data-add-doc=d04]').click();view(page,'documents');page.locator('[data-add-doc=d06]').click()
        view(page,'board');page.locator('#aral-selected-card').select_option('d04');page.locator('[data-board-move=right]').click()
        page.locator('#aral-link-from').select_option('d04');page.locator('#aral-link-to').select_option('d06');page.locator('#aral-link-kind').select_option('context');page.locator('#aral-link-note').fill('Mécanisme hydrologique');page.locator('#aral-link-save').click();page.locator('#aral-hint').click()
        view(page,'argument');page.locator('[data-proof-role=d04]').select_option('support');page.locator('[data-proof-role=d06]').select_option('support')
        submit(page,'irrigation','Un argument conservé avec ses preuves et ses relations.');page.wait_for_timeout(350)
        saved=page.evaluate('({...window.__testSaved})');state=page.evaluate('THOT_ARAL.getState()');assert json.loads(saved['thot.explorer.aral.v1'])==state;assert saved['quiz-sentinel']=='préservé';good(page,errors,console);c.close()
        c,page,errors,console=page_for(browser,PAGES[1],390,storage=saved);restored=page.evaluate('THOT_ARAL.getState()')
        for value in (state,restored):
            for relation in value['links']:relation.pop('id',None)
        assert restored==state;assert page.locator('#aral-resume').is_visible();assert page.locator('#aral-feedback').is_visible();page.locator('#aral-revise').click()
        page.evaluate("Object.defineProperty(window,'localStorage',{value:{setItem(){throw new Error('quota')},getItem(){return null}},configurable:true})")
        page.locator('#aral-conclusion').fill('La sauvegarde échoue mais le dossier reste utilisable.');page.wait_for_timeout(350);assert 'indisponible' in page.locator('#aral-storage').inner_text();good(page,errors,console);c.close()
        c,page,errors,console=page_for(browser,PAGES[1],390,storage={'thot.explorer.aral.v1':'{corrompu'})
        assert 'indisponible' not in page.locator('#aral-storage').inner_text();page.locator('#aral-start').click();assert page.evaluate('THOT_ARAL.getState().cards')=={}
        page.locator('[data-add-doc=d04]').click();page.wait_for_timeout(350);assert 'thot.explorer.aral.v1' in page.evaluate('({...window.__testSaved})')
        page.evaluate("window.__testSaved['quiz-sentinel']='intact'");page.locator('#aral-reset').click();page.locator('#aral-reset-confirm').click()
        assert page.evaluate("window.__testSaved['thot.explorer.aral.v1']") is None
        assert page.evaluate("window.__testSaved['quiz-sentinel']")=='intact';good(page,errors,console);c.close()
        results.append({'test':'stockage simulé : positions, relations, rôles, hypothèse, indice, texte et bilan restaurés ; clé quiz intacte ; erreur quota et JSON corrompu','result':'PASS','limit':'Ne remplace pas un rechargement HTTP avec stockage natif.'})
        # Sans JavaScript : 10 pièces, récits et notices demeurent consultables.
        for name in PAGES:
            c,page,errors,console=page_for(browser,name,390,javascript=False)
            if name==PAGES[1]:assert page.locator('.aral-static-doc').count()==11;assert page.locator('#aral-start').is_hidden();page.locator('.aral-static-doc').first.locator('summary').click();assert page.locator('.aral-static-doc').first.get_attribute('open') is not None
            if name==PAGES[2]:assert page.locator('.atlas-readable-chapters section').count()==6;assert page.locator('.atlas-epoch-sources li').count()==8;assert page.locator('[data-atlas-mode=free]').first.is_hidden()
            good(page,errors,console);c.close()
        # Échec d'image dynamique réel : le texte et la source du document restent disponibles.
        c,page,errors,console=page_for(browser,PAGES[1],390);page.locator('#aral-start').click();page.evaluate("JSON.parse(document.querySelector('#aral-data').textContent)")
        view(page,'documents');page.locator('[data-open-doc=d01]').click();page.locator('.aral-image-viewport img').evaluate("e=>e.src='data:image/jpeg;base64,AAAA'");page.wait_for_function("!document.querySelector('.aral-image-failure').hidden");assert page.locator('#aral-document-body a').count()>=1;assert not errors;page.locator('.aral-document-scroll').screenshot(path=str(out/'aral-image-indisponible.png'));c.close()
        c,page,errors,console=page_for(browser,PAGES[2],390);page.locator('[data-atlas-person=caesar]').click();page.locator('#atlas-modal img').evaluate("e=>e.src='data:image/jpeg;base64,AAAA'");page.wait_for_function("!document.querySelector('.atlas-image-error').hidden");assert page.locator('#atlas-modal .atlas-source a').count()>=1;assert not errors;c.close()
        browser.close()
    report={'environment':'Chromium réel, fixtures locales (HTML/CSS/JS de production, médias incorporés), pas navigation HTTP/publique','results':results,'javascript_errors':0,'overflow':0,'tested_widths':WIDTHS,'reduced_motion':True,'no_js':True,'limits':['Safari/iOS, Firefox, appareil physique et lecteur d’écran non testés.','Reprise avec stockage simulé ; refus natif de stockage testé. Rechargement HTTP avec stockage natif à confirmer dans un navigateur autorisé.']}
    (out/'resultats.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('PASS : parcours complets aux quatre largeurs, clavier, réduction des animations, sans JS, image absente, refus de stockage et reprise simulée. Captures :',out)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser',action='store_true');parser.add_argument('--out',type=Path,default=ROOT.parent/'THOT-EXPLORER-RECONSTRUCTION-20261026/captures');args=parser.parse_args();static_checks()
    if args.browser:browser_checks(args.out)
