#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vrai zoom Chromium à 200 %, déclenché par les touches du navigateur sous X11.

Aucun CSS zoom ni facteur de pixels imposé. Les pages sont des fixtures incorporées,
car la navigation HTTP Chromium peut être bloquée par la politique de l'environnement.
"""
import portable_io
from pathlib import Path
import argparse
import base64
import importlib.util
import json
import os
import subprocess
import time
from playwright.sync_api import sync_playwright


ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('final_recipe',ROOT/'scripts/test-explorer-recette-finale.py');recipe=importlib.util.module_from_spec(spec);spec.loader.exec_module(recipe)


def run(args):
    args.out.mkdir(parents=True,exist_ok=True)
    environment=dict(os.environ);environment['DISPLAY']=args.display
    if args.library_path:environment['LD_LIBRARY_PATH']=str(args.library_path)
    process=None;log=None;result={'mode':'Chromium avec interface, X11, touches Ctrl + +, fixtures locales','native':False}
    try:
        if args.xvfb:
            log=(args.out/'zoom-xvfb.log').open('w',encoding='utf-8')
            process=subprocess.Popen([str(args.xvfb),args.display,'-screen','0','3200x2400x24','-nolisten','tcp'],env=environment,stdout=log,stderr=subprocess.STDOUT)
            time.sleep(.5)
            assert process.poll() is None,'Xvfb ne démarre pas'
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path=args.chromium,headless=False,env=environment,args=['--no-sandbox','--disable-crashpad-for-testing','--disable-dev-shm-usage','--window-size=1440,1100'])
            context=browser.new_context(no_viewport=True,reduced_motion='reduce');page=context.new_page();page.set_default_timeout(12000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.set_content(recipe.recipe.fixture(recipe.recipe.PAGES[0]),wait_until='load')
            page.evaluate("document.title='THOT RECETTE ZOOM'")
            windows=subprocess.check_output([str(args.xdotool),'search','--onlyvisible','--class','chromium'],env=environment,text=True,encoding='utf-8').splitlines()
            subprocess.run([str(args.xdotool),'windowfocus','--sync',windows[-1]],env=environment,check=True)
            subprocess.run([str(args.xdotool),'key','ctrl+0'],env=environment,check=True);time.sleep(.15)
            before=page.evaluate('({width:innerWidth,dpr:devicePixelRatio,outer:outerWidth})')
            levels=[]
            for _ in range(5):
                subprocess.run([str(args.xdotool),'key','ctrl+plus'],env=environment,check=True);time.sleep(.15);levels.append(page.evaluate('devicePixelRatio'))
            page.wait_for_function('Math.abs(devicePixelRatio-2)<.01')
            after=page.evaluate('({width:innerWidth,dpr:devicePixelRatio,outer:outerWidth})')
            assert before['dpr']==1 and after['dpr']==2 and abs(after['width']-before['width']/2)<=1
            result.update(native=True,before=before,after=after,zoom_steps=levels)
            cdp=context.new_cdp_session(page)
            def native_capture(name,selector=None):
                if selector:page.locator(selector).evaluate("e=>e.scrollIntoView({block:'start',behavior:'auto'})")
                page.wait_for_timeout(100)
                shot=cdp.send('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False,'fromSurface':True})
                (args.out/(name+'.png')).write_bytes(base64.b64decode(shot['data']))
            native_capture('zoom-natif-200-accueil')
            page.set_content(recipe.recipe.fixture(recipe.recipe.PAGES[1]),wait_until='load');page.add_script_tag(content=(recipe.ASSET/'aral.js').read_text(encoding='utf-8'));page.locator('#aral-start').click()
            for id in ('d02','d04','d06','d08','d09','d10'):
                page.locator('[data-aral-view=documents]').click();page.locator('[data-add-doc='+id+']').click()
            page.locator('[data-board-mode=list]').click();page.locator('[data-select-card=d09]').click();page.locator('#aral-connect-selected').click();page.locator('#aral-link-to').select_option('d06')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            native_capture('zoom-natif-200-aral-liste','#aral-active-description')
            page.locator('#aral-prepare-conclusion').click();page.locator('#aral-conclusion').focus()
            assert page.locator('.aral-mobile-tabs').evaluate('e=>!["fixed","sticky"].includes(getComputedStyle(e).position)')
            native_capture('zoom-natif-200-aral-explication','#aral-conclusion')
            page.set_content(recipe.recipe.fixture(recipe.recipe.PAGES[2]),wait_until='load');page.add_script_tag(content=(recipe.ASSET/'atlas.js').read_text(encoding='utf-8'))
            page.locator('#atlas-compare-toggle').check();recipe.assert_disjoint_controls(page);recipe.assert_map_labels(page)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
            native_capture('zoom-natif-200-atlas-comparateur','.atlas-map-column')
            native_capture('zoom-natif-200-atlas-carte','.atlas-map-stage')
            native_capture('zoom-natif-200-atlas-curseur','#atlas-reveal-control')
            assert not errors,errors;result.update(status='PASS',errors=errors);browser.close()
    finally:
        if process:process.terminate();process.wait(timeout=5)
        if log:log.close()
    (args.out/'zoom-natif-200.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--xvfb',type=Path);parser.add_argument('--xdotool',type=Path,default=Path('/usr/bin/xdotool'));parser.add_argument('--library-path',type=Path);parser.add_argument('--chromium',default='/usr/bin/chromium');parser.add_argument('--display',default=':93');parser.add_argument('--out',type=Path,default=ROOT.parent/'THOT-EXPLORER-CORRECTIONS-20261027/captures');run(parser.parse_args())
