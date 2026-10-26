#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recette de stockage natif sur HTTP local, jamais remplacé par un mock.

Exige un serveur preview.py et un navigateur autorisé. Code 2 : indisponible,
code 1 : échec d'assertion, code 0 : cycle natif entièrement vérifié.
"""
import portable_io
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json
from playwright.sync_api import sync_playwright
from browser_fixture import chromium


def exercise(browser,origin):
    context=browser.new_context(viewport={'width':390,'height':900})
    page=context.new_page();page.set_default_timeout(10000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    url=origin.rstrip('/')+'/Thot/explorer/enquetes/mer-aral.html'
    page.goto(url,wait_until='domcontentloaded',timeout=10000)
    page.wait_for_function('!!window.THOT_ARAL')
    # Isolated context: never reads or clears a visitor's real quiz progression.
    page.evaluate("localStorage.setItem('thot.test.quiz.sentinel','intact')")
    page.locator('#aral-start').click()
    for id in ('d04','d06','d08'):
        page.locator('[data-aral-view=documents]').click();page.locator('[data-add-doc='+id+']').click()
    page.locator('#aral-link-from').select_option('d04');page.locator('#aral-link-to').select_option('d06');page.locator('#aral-link-kind').select_option('context');page.locator('#aral-link-save').click()
    page.locator('[data-aral-view=argument]').click();page.locator('[data-proof-role=d04]').select_option('support');page.locator('[data-proof-role=d06]').select_option('support')
    page.locator('[name=aral-hypothesis][value=irrigation]').check();page.locator('#aral-conclusion').fill('Les prélèvements et les apports sont liés par un mécanisme hydrologique.')
    page.locator('#aral-submit').click();page.wait_for_function("localStorage.getItem(THOT_ARAL.storageKey) && JSON.parse(localStorage.getItem(THOT_ARAL.storageKey)).lastFeedback")
    state=page.evaluate('THOT_ARAL.getState()')
    def compare(current):
        for value in (state,current):
            for link in value['links']:link.pop('id',None)
        assert current==state,'Progression différente après reprise'
    page.reload(wait_until='domcontentloaded');page.wait_for_function('!!window.THOT_ARAL');compare(page.evaluate('THOT_ARAL.getState()'))
    page.close();page=context.new_page();page.goto(url,wait_until='domcontentloaded');page.wait_for_function('!!window.THOT_ARAL');compare(page.evaluate('THOT_ARAL.getState()'))
    page.locator('#aral-reset').click();page.locator('#aral-reset-confirm').click()
    assert page.evaluate('localStorage.getItem(THOT_ARAL.storageKey)') is None
    assert page.evaluate("localStorage.getItem('thot.test.quiz.sentinel')")=='intact'
    assert not errors,errors
    context.close()


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--origin',default='http://localhost:31460');p.add_argument('--browser',choices=['chromium','firefox','webkit'],default='chromium');p.add_argument('--out',type=Path);args=p.parse_args()
    assert urlsplit(args.origin).hostname in ('127.0.0.1','localhost'),'Serveur local requis'
    result={'browser':args.browser,'origin':args.origin,'mode':'HTTP et localStorage natifs, sans fixture'};code=2
    with sync_playwright() as pw:
        browser=None
        try:
            browser=chromium(pw) if args.browser=='chromium' else getattr(pw,args.browser).launch(headless=True,timeout=10000)
            exercise(browser,args.origin);result['status']='PASS';code=0
        except AssertionError as error:result.update(status='FAIL',error=str(error));code=1
        except Exception as error:result.update(status='NON VÉRIFIÉ',error=type(error).__name__+': '+str(error)[:2200])
        finally:
            if browser:browser.close()
    payload=json.dumps(result,ensure_ascii=False,indent=2)+'\n';print(payload)
    if args.out:args.out.write_text(payload,encoding='utf-8')
    raise SystemExit(code)
