#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recette des corrections Work : collisions réelles, titres, flux et conservation.

Chromium : fixtures CSS/HTML/JS locales ; WebKit : HTTP réel, selon --mode.
Les gestes tactiles sont simulés. Aucun score d'accessibilité n'est déduit.
"""
import portable_io
from pathlib import Path
from html.parser import HTMLParser
import argparse
import importlib.util
import json
import subprocess
ROOT=Path(__file__).resolve().parents[1];ASSET=ROOT/'assets/explorer-v2'
spec=importlib.util.spec_from_file_location('explorer_recipe',ROOT/'scripts/test-explorer-reconstruction.py');recipe=importlib.util.module_from_spec(spec);spec.loader.exec_module(recipe)
WIDTHS=(320,390,768,1440)
CONTROL_SELECTOR='[data-atlas-zoom],[data-atlas-pan],#atlas-zoom-value,#atlas-badge-before,#atlas-badge-after,#atlas-before,#atlas-after,#atlas-reveal,#atlas-current-date,.atlas-compare-switch'


def assert_disjoint_controls(page):
    conflicts=page.evaluate('''selector=>{
      const nodes=[...document.querySelectorAll(selector)].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden');
      const conflicts=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i].getBoundingClientRect(),b=nodes[j].getBoundingClientRect();
        if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)conflicts.push([nodes[i].id||nodes[i].outerHTML.slice(0,100),nodes[j].id||nodes[j].outerHTML.slice(0,100)]);
      }return conflicts;
    }''',CONTROL_SELECTOR)
    assert not conflicts,('Commandes superposées',conflicts)


def assert_map_labels(page):
    conflicts=page.evaluate('''()=>{
      const svg=document.querySelector('#atlas-map'),bounds=svg.getBoundingClientRect();
      const visible=e=>{for(let node=e;node;node=node.parentElement)if(getComputedStyle(node).display==='none')return false;const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden]')&&b.right>bounds.left&&b.left<bounds.right&&b.bottom>bounds.top&&b.top<bounds.bottom;};
      const labels=[...svg.querySelectorAll('#atlas-city-layer text,#atlas-event-layer text')].filter(visible);
      const markers=[...svg.querySelectorAll('#atlas-city-layer circle:not(.atlas-city-hit),#atlas-event-layer rect')].filter(visible);
      const collide=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>.5&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>.5;
      const errors=[];
      for(let i=0;i<labels.length;i++){
        const a=labels[i],r=a.getBoundingClientRect();
        if(r.left<bounds.left-.5||r.right>bounds.right+.5||r.top<bounds.top-.5||r.bottom>bounds.bottom+.5)errors.push('Nom coupé : '+a.textContent);
        for(const b of labels.slice(i+1))if(collide(r,b.getBoundingClientRect()))errors.push('Noms : '+a.textContent+' / '+b.textContent);
        for(const b of markers)if(collide(r,b.getBoundingClientRect()))errors.push('Nom et repère : '+a.textContent);
      }
      for(let i=0;i<markers.length;i++)for(const b of markers.slice(i+1))if(collide(markers[i].getBoundingClientRect(),b.getBoundingClientRect()))errors.push('Repères superposés');
      return errors;
    }''')
    assert not conflicts,conflicts


def conservation():
    baseline='25371839f1f109688e7dd79da672f6d7769d5f0a'
    allowed={'explorer.html','scripts/build-explorer-reconstruction.py','scripts/test-explorer-http.py','assets/explorer-v2/aral.css','assets/explorer-v2/aral.js','assets/explorer-v2/atlas.css','assets/explorer-v2/atlas.js','scripts/explorer_aral_view.py','scripts/explorer_atlas_view.py','explorer/enquetes/mer-aral.html','explorer/atlas/rome-expansion.html','scripts/test-explorer-stockage-http.py','scripts/test-explorer-reconstruction.py','scripts/test-explorer-finitions.py'}
    for name in subprocess.check_output(['git','ls-tree','-r','--name-only',baseline],cwd=ROOT,text=True,encoding='utf-8').splitlines():
        if name not in allowed:assert (ROOT/name).read_bytes()==subprocess.check_output(['git','show',baseline+':'+name],cwd=ROOT),'Régression hors périmètre : '+name
    class UniqueAttributes(HTMLParser):
        def handle_starttag(self,tag,attrs):
            keys=[name for name,value in attrs];assert len(keys)==len(set(keys)),('Attribut dupliqué',tag,keys)
    for name in recipe.PAGES:UniqueAttributes().feed((ROOT/name).read_text(encoding='utf-8'))
    print('PASS : tous les fichiers hors périmètre, corpus, sources, cartes et médias inchangés depuis 25371839 ; attributs HTML uniques.',flush=True)


def capture(page,out,name,selector=None):
    page.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
    page.wait_for_function('[...document.images].every(i=>i.complete)')
    page.evaluate('Promise.all([...document.images].map(i=>i.decode()))')
    target=page.locator(selector) if selector else page
    target.screenshot(path=str(out/(name+'.png')),**({} if selector else {'full_page':True}))


def run(args):
    from playwright.sync_api import sync_playwright
    from browser_fixture import chromium
    args.out.mkdir(parents=True,exist_ok=True);results=[]
    with sync_playwright() as pw:
        browser=chromium(pw) if args.browser=='chromium' else getattr(pw,args.browser).launch(headless=True,timeout=15000)
        def open_page(name,width):
            context=browser.new_context(viewport={'width':width,'height':960},has_touch=True,reduced_motion='reduce',offline=args.mode=='fixture')
            page=context.new_page();page.set_default_timeout(12000);errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append('console: '+m.text) if m.type=='error' else None)
            if args.mode=='http':page.goto(args.origin.rstrip('/')+'/Thot/'+name,wait_until='load')
            else:
                page.set_content(recipe.fixture(name),wait_until='load')
                if name!=recipe.PAGES[0]:page.add_script_tag(content=(ASSET/('aral.js' if 'aral' in name else 'atlas.js')).read_text(encoding='utf-8'))
            return context,page,errors
        def good(page,errors):
            assert not errors,errors
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Débordement horizontal'
        for width in WIDTHS:
            print(args.browser,args.mode,width,flush=True)
            context,page,errors=open_page(recipe.PAGES[0],width);capture(page,args.out,args.browser+'-accueil-'+str(width));good(page,errors);context.close()
            context,page,errors=open_page(recipe.PAGES[1],width);capture(page,args.out,args.browser+'-aral-ouverture-'+str(width));page.locator('#aral-start').focus();page.keyboard.press('Enter')
            for n in range(1,12):
                id='d'+str(n).zfill(2)
                if n>1:page.locator('#aral-more-documents').click()
                page.locator('[data-open-doc='+id+']').click();page.locator('#aral-doc-add').click()
            if width<=700:
                assert page.locator('.aral-board-controls').is_hidden();assert page.locator('.aral-move-buttons').is_hidden();assert page.locator('#aral-selected-card').is_hidden()
                page.locator('[data-select-card=d09]').focus();page.keyboard.press('Enter')
                capture(page,args.out,args.browser+'-aral-liste-'+str(width),'#aral-board-panel')
            else:page.locator('#aral-selected-card').select_option('d09')
            page.locator('#aral-connect-selected').click();page.locator('#aral-link-to').select_option('d06')
            assert page.locator('#aral-link-from-title').inner_text().endswith('poussières')
            for selector in ['#aral-active-description','#aral-link-from-title','#aral-link-to-title']:
                assert page.locator(selector).evaluate('(e)=>e.scrollHeight<=e.clientHeight+1 && getComputedStyle(e).textOverflow!=="ellipsis"'),selector
            page.locator('#aral-link-kind').select_option('context');page.locator('#aral-link-note').fill('Une conséquence ne suffit pas à établir la cause.');page.locator('#aral-link-save').click()
            page.locator('[data-board-mode=map]').click()
            assert page.locator('.aral-paper-open').evaluate_all('(nodes)=>nodes.every(e=>e.scrollHeight<=e.clientHeight+1)'), 'Titre de carte tronqué'
            page.locator('#aral-arrange').click();assert len(page.evaluate('THOT_ARAL.getState().links'))==1
            page.locator('#aral-prepare-conclusion').click()
            for id,role in [('d04','support'),('d06','support'),('d08','insufficient'),('d10','counter')]:page.locator('[data-proof-role='+id+']').select_option(role)
            page.locator('[name=aral-hypothesis][value=irrigation]').check();page.locator('#aral-conclusion').fill('Les prélèvements diminuent les apports ; le climat peut aggraver certains épisodes. Le Nord diffère du Sud.')
            page.locator('#aral-submit').click();assert 'ne valide pas le sens' in page.locator('.aral-bilan-scope').inner_text()
            capture(page,args.out,args.browser+'-aral-bilan-'+str(width),'#aral-feedback')
            page.locator('#aral-revise').click();assert page.locator('#aral-conclusion').evaluate('e=>e===document.activeElement')
            assert page.locator('.aral-mobile-tabs').evaluate('e=>!["sticky","fixed"].includes(getComputedStyle(e).position)')
            assert page.locator('#aral-conclusion').evaluate('e=>{const r=e.getBoundingClientRect(),p=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return p===e;}'), 'Champ masqué'
            capture(page,args.out,args.browser+'-aral-revision-'+str(width),'#aral-argument');good(page,errors);context.close()
            context,page,errors=open_page(recipe.PAGES[2],width)
            for period in ('bc400','bc300','bc200','bc100','bc60','bc1','ad100','ad117'):
                page.locator('#atlas-period').select_option(period);assert_map_labels(page);assert_disjoint_controls(page)
            page.locator('[data-atlas-layer=events]').check();assert_map_labels(page)
            for id in ('cannae216','carthage146','actium31','rome27'):
                page.locator('#atlas-territory-select').select_option('event:'+id);assert_map_labels(page);page.locator('[data-atlas-close-card]').click()
            page.locator('[data-atlas-layer=events]').uncheck();page.locator('#atlas-compare-toggle').check()
            for reveal in (0,35,50,100):
                page.locator('#atlas-reveal').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',reveal);assert_map_labels(page);assert_disjoint_controls(page)
            page.locator('#atlas-reveal').focus();page.keyboard.press('Home');page.keyboard.press('ArrowRight');assert page.evaluate('THOT_ATLAS.getState().reveal')==1
            page.locator('#atlas-reveal').evaluate('(e)=>{e.value=50;e.dispatchEvent(new Event("input",{bubbles:true}))}');capture(page,args.out,args.browser+'-rome-comparateur-'+str(width),'.atlas-map-column')
            for _ in range(3):page.locator('[data-atlas-zoom=in]').click();assert_map_labels(page);assert_disjoint_controls(page)
            page.locator('[data-atlas-pan=right]').click();assert_map_labels(page);page.locator('[data-atlas-zoom=reset]').click()
            page.locator('#atlas-compare-toggle').uncheck();page.locator('#atlas-territory-select').select_option('place:roma');capture(page,args.out,args.browser+'-rome-fiche-'+str(width),'.atlas-map-shell');page.locator('[data-atlas-close-card]').click()
            page.locator('[data-atlas-mode=guided]').click()
            for id in ('italy','punic','mediterranean','caesar','augustus','trajan'):page.locator('[data-atlas-chapter='+id+']').click();assert_map_labels(page)
            capture(page,args.out,args.browser+'-rome-guide-'+str(width),'.atlas-workspace')
            for person,steps in [('hannibal',2),('caesar',3),('augustus',3),('trajan',2)]:
                page.locator('[data-atlas-person='+person+']').click();page.get_by_role('button',name='Suivre le parcours sur la carte').click();page.wait_for_timeout(50)
                assert page.evaluate('document.activeElement.id')=='atlas-journey-title'
                for n in range(steps):
                    assert_map_labels(page)
                    if n<steps-1:page.locator('#atlas-journey-next').click()
                page.locator('#atlas-journey-close').click()
            good(page,errors);context.close();results.append({'width':width,'result':'PASS','nominal_pages':3,'states':8,'events':4,'journeys':4,'label_collisions':0,'control_collisions':0,'title_clipping':0,'js_errors':0})
        browser.close()
    result={'browser':args.browser,'mode':args.mode,'touch':'simulé Playwright','results':results}
    (args.out/(args.browser+'-recette-finale.json')).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('PASS : contrôles disjoints, noms et repères sans collision, titres complets, navigation non masquante, parcours et clavier aux quatre largeurs.',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--browser',choices=['chromium','webkit','firefox'],default='chromium');parser.add_argument('--mode',choices=['http','fixture'],default='fixture');parser.add_argument('--origin',default='http://127.0.0.1:31460');parser.add_argument('--out',type=Path,default=ROOT.parent/'THOT-EXPLORER-CORRECTIONS-20261027/captures');args=parser.parse_args();conservation();run(args)
