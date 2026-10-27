#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recette des ajouts : conservation, cas documentaires, tactile simulé et captures.

Chromium réel sur fixtures incorporées ; ce test ne prétend pas visiter HTTP.
"""
import portable_io
from pathlib import Path
import argparse
import importlib.util
import json
import subprocess
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assets/explorer-v2'
spec=importlib.util.spec_from_file_location('recipe',ROOT/'scripts/test-explorer-reconstruction.py')
recipe=importlib.util.module_from_spec(spec);spec.loader.exec_module(recipe)

def conservation():
    baseline='d8ac141d78ed6014ad7f1edec1d8fc693640a23c'
    allowed={'scripts/test-explorer-http.py','explorer.html','scripts/audit-explorer-sources.py','scripts/build-explorer-corpus.py','scripts/build-explorer-reconstruction.py','scripts/explorer_aral_view.py','scripts/explorer_atlas_view.py','scripts/test-explorer-reconstruction.py'}
    for name in subprocess.check_output(['git','ls-tree','-r','--name-only',baseline],cwd=ROOT,text=True,encoding='utf-8').splitlines():
        if name in allowed or name.startswith(('assets/explorer-v2/','explorer/')):continue
        assert (ROOT/name).read_bytes()==subprocess.check_output(['git','show',baseline+':'+name],cwd=ROOT),name
    print('PASS : chaque fichier hors Explorer inchangé depuis d8ac141.',flush=True)

def run(out):
    from playwright.sync_api import sync_playwright
    from browser_fixture import chromium
    out.mkdir(parents=True,exist_ok=True);results=[]
    def new(browser,name,width):
        c=browser.new_context(viewport={'width':width,'height':960},has_touch=True,reduced_motion='reduce',offline=True)
        page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append('console: '+m.text) if m.type=='error' else None);page.set_default_timeout(10000)
        page.set_content(recipe.fixture(name),wait_until='load')
        page.add_script_tag(content=(A/('aral.js' if 'aral' in name else 'atlas.js')).read_text(encoding='utf-8'))
        return c,page,errors
    def view(page,name):
        b=page.locator('[data-aral-view='+name+']')
        if b.is_visible():b.tap()
    def capture(page,name,selector):
        page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
        page.wait_for_function('[...document.images].every(i=>i.complete)')
        page.evaluate('Promise.all([...document.images].map(i=>i.decode()))')
        page.locator(selector).screenshot(path=str(out/(name+'.png')))
    def good(page,errors):
        assert not errors,errors
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Débordement'
    with sync_playwright() as p:
        b=chromium(p)
        for width in (320,390,768,1440):
            c,page,errors=new(b,recipe.PAGES[1],width);page.locator('#aral-start').tap()
            for id in ('d02','d03','d04','d06','d08','d10'):
                view(page,'documents');page.locator('[data-add-doc='+id+']').tap()
            view(page,'board')
            assert page.evaluate('THOT_ARAL.getState().boardMode')==('list' if width<=700 else 'map')
            assert page.locator('#aral-evidence-list article').count()==6
            for source,target,kind in [('d02','d03','confirm'),('d04','d06','context'),('d03','d10','contradict'),('d08','d06','inconclusive')]:
                page.locator('#aral-link-from').select_option(source);page.locator('#aral-link-to').select_option(target);page.locator('#aral-link-kind').select_option(kind)
                page.locator('#aral-link-note').fill('Comparer dates, variables et échelles.');page.locator('#aral-link-save').tap()
            before=page.evaluate('THOT_ARAL.getState()');page.locator('[data-board-mode=map]').tap();page.locator('#aral-arrange').tap();after=page.evaluate('THOT_ARAL.getState()')
            assert before['links']==after['links'] and before['roles']==after['roles'] and set(before['cards'])==set(after['cards'])
            assert len({(v['x'],v['y']) for v in after['cards'].values()})==6
            assert page.locator('.aral-threads [data-thread]').count()==4
            assert page.locator('.aral-threads [data-kind=contradict] path').last.get_attribute('stroke-dasharray')=='12 6'
            if width>=1101:
                page.locator('#aral-wide-board').tap();assert page.locator('.is-board-wide').count()==1
            if width<=700:
                page.locator('[data-board-mode=list]').tap()
                page.locator('[data-select-card=d04]').tap();assert page.locator('#aral-selected-card').input_value()=='d04'
                capture(page,'aral-liste-mobile-'+str(width),'#aral-board-panel')
                page.locator('[data-board-mode=map]').tap()
            page.locator('#aral-selected-card').select_option('d04');page.locator('#aral-fit-board').tap()
            positions=page.evaluate('THOT_ARAL.getState().cards');page.locator('[data-board-pan=right]').tap();assert page.evaluate('THOT_ARAL.getState().cards')==positions
            page.locator('#aral-fit-board').tap()
            # At desktop the six-document board is deliberately large and uncropped.
            capture(page,'aral-six-pieces-quatre-relations-'+str(width),'#aral-board-panel')
            page.locator('[data-edit-link]').nth(2).tap();assert page.locator('#aral-link-review-label').is_visible()
            page.locator('#aral-link-review').select_option('scoped');page.locator('#aral-link-note').fill('Nord et Sud, périodes différentes.');page.locator('#aral-link-save').tap()
            assert page.evaluate('THOT_ARAL.getState().links[2].review')=='scoped'
            page.locator('[data-edit-link]').nth(3).tap();page.locator('#aral-link-kind').select_option('context');page.locator('#aral-link-save').tap()
            assert page.evaluate('THOT_ARAL.getState().links[3].kind')=='context'
            page.locator('[data-delete-link]').nth(3).tap();assert len(page.evaluate('THOT_ARAL.getState().links'))==3
            view(page,'argument')
            for id,role in [('d04','support'),('d06','support'),('d08','insufficient'),('d10','counter')]:page.locator('[data-proof-role='+id+']').select_option(role)
            page.locator('[name=aral-hypothesis][value=irrigation]').check();page.locator('#aral-conclusion').fill('Les prélèvements réduisent les apports ; les bassins et les périodes diffèrent.');page.locator('#aral-submit').tap()
            assert page.locator('.aral-criterion').count()==4;capture(page,'aral-bilan-enrichi-'+str(width),'#aral-feedback')
            page.locator('#aral-revise').tap();assert page.locator('#aral-feedback').is_hidden();capture(page,'aral-revision-'+str(width),'#aral-argument')
            # Cases exercise the production evaluator; the free text never changes its verdict.
            cases=page.evaluate('''()=>{
              const state=(roles,hypothesis='irrigation',links=[])=>({cards:Object.fromEntries(Object.keys(roles).map(id=>[id,{x:0,y:0}])),roles,hypothesis,links});
              const ev=THOT_ARAL.evaluate;
              const solid=ev(state({d04:'support',d06:'support',d08:'insufficient',d10:'insufficient'}));
              const missing=ev(state({}));
              const observation=ev(state({d02:'support',d03:'support'}));
              const unresolved=ev(state({d04:'support',d06:'support'},'irrigation',[{from:'d08',to:'d06',kind:'contradict',review:'unresolved'}]));
              const custom=state({d04:'support',d06:'support'},'custom');custom.conclusion='Texte A';const a=ev(custom);custom.conclusion='Texte de sens opposé';const same=JSON.stringify(a)===JSON.stringify(ev(custom));
              const excess=ev(state({d10:'counter'},'disappearance'));
              const climate=ev(state({d08:'support'},'climate'));
              return {solid,missing,observation,unresolved,custom:a,same,excess,climate};
            }''')
            assert cases['solid']['title'].startswith('Un mécanisme étayé')
            assert any('Aucune pièce' in s for s in cases['missing']['issues'])
            assert any('causalité' in s for s in cases['observation']['issues'])
            assert any('restent à examiner' in s for s in cases['unresolved']['issues'])
            assert cases['same'] and any('pas évaluée automatiquement' in s for s in cases['custom']['issues'])
            assert any('trop générale' in s for s in cases['excess']['issues'])
            assert any('ne suffisent pas' in s for s in cases['climate']['issues'])
            good(page,errors);c.close();results.append({'width':width,'aral':'PASS','input':'tactile simulé, formulaires natifs et clavier dans recette principale','scenarios':8})
            c,page,errors=new(b,recipe.PAGES[2],width)
            assert page.locator('#atlas-city-layer [data-place]').count()==11
            assert page.locator('#atlas-event-layer [data-event]').count()==4
            page.locator('[data-atlas-layer=events]').check()
            page.locator('#atlas-event-layer [data-event=actium31]').focus();page.keyboard.press('Enter');assert 'Actium' in page.locator('#atlas-card-title').inner_text();page.locator('[data-atlas-close-card]').tap()
            for id in ('cannae216','carthage146','actium31','rome27'):
                page.locator('#atlas-territory-select').select_option('event:'+id);assert page.locator('#atlas-card-kind').inner_text().startswith('ÉVÉNEMENT');page.locator('[data-atlas-close-card]').tap()
            page.locator('[data-atlas-mode=guided]').tap()
            page.locator('[data-atlas-region=gaul]').tap();page.get_by_role('button',name='Comparer ces deux états disponibles').tap()
            assert page.evaluate('THOT_ATLAS.getState().mode')=='free'
            assert page.evaluate('THOT_ATLAS.getState().before')=='bc60' and page.evaluate('THOT_ATLAS.getState().after')=='bc1'
            assert page.locator('#atlas-badge-before').is_visible();capture(page,'rome-gaule-comparateur-'+str(width),'.atlas-map-column')
            for person,steps in [('hannibal',2),('caesar',3),('augustus',3),('trajan',2)]:
                page.locator('[data-atlas-person='+person+']').tap();page.get_by_role('button',name='Suivre le parcours sur la carte').tap()
                page.wait_for_timeout(80);assert page.evaluate('document.activeElement.id')=='atlas-journey-title'
                assert page.evaluate('THOT_ATLAS.getState().journey')==person
                for n in range(steps):
                    assert 'État cartographique' in page.locator('#atlas-journey-date').inner_text()
                    if page.locator('#atlas-journey-actions button').count():
                        page.locator('#atlas-journey-actions button').tap();assert page.locator('#atlas-modal').is_visible();page.keyboard.press('Escape')
                    if n<steps-1:page.locator('#atlas-journey-next').tap()
                if person=='augustus':
                    capture(page,'rome-parcours-auguste-'+str(width),'.atlas-map-column')
                    page.locator('#atlas-journey-previous').tap();assert page.evaluate('THOT_ATLAS.getState().journeyStep')==1
                page.locator('#atlas-journey-close').tap();assert page.locator('#atlas-journey').is_hidden()
            good(page,errors);c.close();results.append({'width':width,'rome':'PASS','places':11,'events':4,'journeys':4})
        # Probe native browser zoom, preserving the distinction from CSS emulation.
        c,page,errors=new(b,recipe.PAGES[2],1440)
        before=page.evaluate('({width:innerWidth,dpr:devicePixelRatio})')
        for _ in range(4):page.keyboard.press('Control++')
        after=page.evaluate('({width:innerWidth,dpr:devicePixelRatio})')
        zoom={'native_before':before,'native_after':after,'native_200_verified':after['width']<=before['width']/2+1}
        if not zoom['native_200_verified']:
            page.evaluate("document.documentElement.style.zoom='2'")
            good(page,errors);capture(page,'rome-zoom-css-200-emulation','.atlas-map-column')
            zoom['fallback']='CSS zoom 200 %, ne remplace pas un zoom natif de navigateur.'
        results.append({'zoom':zoom});c.close();b.close()
    (out/'finitions-resultats.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS : quatre largeurs, six pièces/quatre relations, liste tactile, huit cas de bilan, onze lieux, quatre événements, quatre parcours. Zoom :',zoom,flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=ROOT.parent/'THOT-EXPLORER-FINITIONS-20261026/captures');args=parser.parse_args();conservation();run(args.out)
