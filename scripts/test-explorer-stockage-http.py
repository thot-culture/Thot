#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sauvegarde native HTTP, profil persistant, vrai arrêt puis redémarrage du navigateur.

Aucun mock, fixture, changement d'origine ou effacement global du stockage.
Code 2 : environnement indisponible ; code 1 : régression ; code 0 : cycle vérifié.
"""
import portable_io
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import json
import shutil
import tempfile
from playwright.sync_api import sync_playwright


def exercise(engine, origin, profile, captures=None):
    options={'headless':True,'viewport':{'width':390,'height':900},'timeout':15000}
    if engine.name=='chromium':
        options.update(executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-crashpad-for-testing','--disable-dev-shm-usage'])
    context=None;errors=[];steps=[]
    def launch():return engine.launch_persistent_context(str(profile),**options)
    def open_page(context,path):
        page=context.pages[0] if context.pages else context.new_page();page.set_default_timeout(12000)
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(origin.rstrip('/')+'/Thot/'+path,wait_until='load',timeout=12000)
        return page
    def normalized(state):
        copy=json.loads(json.dumps(state))
        for link in copy['links']:link.pop('id',None)
        return copy
    def snapshot(page):return page.evaluate('Object.fromEntries(Object.entries(localStorage).filter(([k])=>k!=="thot.explorer.aral.v1"))')
    def screenshot(page,name):
        if captures:
            captures.mkdir(parents=True,exist_ok=True)
            page.screenshot(path=str(captures/(engine.name+'-'+name+'.png')),full_page=True)
    try:
        context=launch();page=open_page(context,'quiz.html')
        # Une vraie partie produit une sauvegarde de quiz au format du site.
        page.locator('#start-button').click()
        for _ in range(5):
            page.locator('#answer-list button').first.click()
            if page.locator('#validate-button').is_visible():page.locator('#validate-button').click()
            page.locator('#next-button').click()
        assert page.locator('#screen-result').is_visible()
        assert page.evaluate("localStorage.getItem('thot_v2_stats')"),'Sauvegarde réelle du quiz absente'
        page.evaluate("localStorage.setItem('thot.audit.preserve','intact')")
        quiz_before=snapshot(page);steps.append('Partie de quiz réelle terminée, sauvegarde native présente.')
        page=open_page(context,'explorer/enquetes/mer-aral.html');page.wait_for_function('!!window.THOT_ARAL')
        page.locator('#aral-start').click()
        for id in ('d04','d06','d08','d10'):
            page.locator('[data-aral-view=documents]').click();page.locator('[data-open-doc='+id+']').click();page.locator('#aral-doc-add').click()
        page.locator('#aral-link-from').select_option('d04');page.locator('#aral-link-to').select_option('d06');page.locator('#aral-link-kind').select_option('context');page.locator('#aral-link-note').fill('Prélèvements et apports : expliciter le mécanisme.');page.locator('#aral-link-save').click()
        page.locator('#aral-hint').click();page.locator('#aral-prepare-conclusion').click()
        for id,role in [('d04','support'),('d06','support'),('d08','insufficient'),('d10','counter')]:page.locator('[data-proof-role='+id+']').select_option(role)
        page.locator('[name=aral-hypothesis][value=irrigation]').check();page.locator('#aral-conclusion').fill('Les prélèvements réduisent les apports ; les années sèches aggravent certaines périodes. Le Nord et le Sud diffèrent.')
        page.locator('#aral-submit').click();page.wait_for_function("localStorage.getItem(THOT_ARAL.storageKey) && JSON.parse(localStorage.getItem(THOT_ARAL.storageKey)).lastFeedback")
        saved=normalized(page.evaluate('THOT_ARAL.getState()'));assert snapshot(page)==quiz_before
        page.reload(wait_until='load');page.wait_for_function('!!window.THOT_ARAL');assert normalized(page.evaluate('THOT_ARAL.getState()'))==saved
        assert page.locator('#aral-feedback').is_visible();screenshot(page,'rechargement-http');steps.append('Rechargement HTTP réel : état complet identique, bilan visible, quiz inchangé.')
        context.close();context=None;steps.append('Navigateur persistant entièrement arrêté.')
        context=launch();page=open_page(context,'explorer/enquetes/mer-aral.html');page.wait_for_function('!!window.THOT_ARAL')
        assert normalized(page.evaluate('THOT_ARAL.getState()'))==saved;assert snapshot(page)==quiz_before
        screenshot(page,'reouverture-navigateur');steps.append('Nouveau processus avec le même profil : pièces, relations, rôles, hypothèse, texte, indice et bilan restaurés.')
        page.locator('#aral-reset').click();page.locator('#aral-reset-confirm').click()
        assert page.evaluate('localStorage.getItem(THOT_ARAL.storageKey)') is None
        assert snapshot(page)==quiz_before;assert page.evaluate('THOT_ARAL.getState().cards')=={}
        page.reload(wait_until='load');page.wait_for_function('!!window.THOT_ARAL');assert page.evaluate('THOT_ARAL.getState().cards')=={}
        assert snapshot(page)==quiz_before;steps.append('Réinitialisation puis rechargement : seule la progression Aral supprimée ; sauvegarde réelle du quiz et clé témoin strictement identiques.')
        screenshot(page,'reinitialisation');assert not errors,errors
        return {'steps':steps,'javascript_errors':errors,'storage':'localStorage natif','browser_restart':True,'quiz':'Partie et sauvegarde réellement produites ; contenu inchangé octet pour octet.'}
    finally:
        if context:context.close()


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--origin',default='http://127.0.0.1:31460');parser.add_argument('--browser',choices=['chromium','firefox','webkit'],default='chromium');parser.add_argument('--out',type=Path);parser.add_argument('--captures',type=Path);args=parser.parse_args()
    assert urlsplit(args.origin).hostname in ('127.0.0.1','localhost'),'Serveur local requis'
    result={'browser':args.browser,'origin':args.origin,'mode':'HTTP et profil persistant natifs, sans fixture'};code=2
    with sync_playwright() as pw,tempfile.TemporaryDirectory(prefix='thot-storage-native-') as profile:
        try:result.update(exercise(getattr(pw,args.browser),args.origin,Path(profile),args.captures));result['status']='PASS';code=0
        except AssertionError as error:result.update(status='FAIL',error=str(error));code=1
        except Exception as error:result.update(status='NON VÉRIFIÉ',error=type(error).__name__+': '+str(error)[:3500])
    payload=json.dumps(result,ensure_ascii=False,indent=2)+'\n';print(payload)
    if args.out:args.out.write_text(payload,encoding='utf-8')
    raise SystemExit(code)
