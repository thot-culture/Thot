#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Crée un dossier avec l'ancien code, puis ouvre le même profil avec la version courante.

Les deux versions se succèdent sur le même serveur HTTP local, jamais sur le site public.
"""
import portable_io
from pathlib import Path
import argparse
import json
import os
from datetime import datetime, timezone
import subprocess
import sys
import tempfile
import time
import urllib.request
import zipfile
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]


def run(args):
    origin='http://127.0.0.1:'+str(args.port);url=origin+'/Thot/explorer/enquetes/mer-aral.html';server=None;context=None
    def start(root):
        process=subprocess.Popen([sys.executable,'scripts/preview.py','--port',str(args.port)],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        for _ in range(80):
            try:
                with urllib.request.urlopen(url,timeout=1) as response:assert response.status==200
                return process
            except OSError:time.sleep(.1)
        process.terminate();raise RuntimeError('Serveur de migration indisponible')
    def normalized(state):
        copy=json.loads(json.dumps(state))
        for relation in copy['links']:relation.pop('id',None)
        return copy
    with tempfile.TemporaryDirectory(prefix='thot-migration-') as tmp,sync_playwright() as pw:
        temp=Path(tmp)
        with zipfile.ZipFile(args.baseline) as z:
            assert z.testzip() is None;z.extractall(temp/'old')
            # Une extraction ne doit pas faire passer l'ancien site pour plus récent que le nouveau.
            for info in z.infolist():
                if not info.is_dir():
                    stamp=datetime(*info.date_time,tzinfo=timezone.utc).timestamp();os.utime(temp/'old'/info.filename,(stamp,stamp))
        old=temp/'old/Thot';profile=temp/'browser-profile';engine=getattr(pw,args.browser)
        try:
            server=start(old);context=engine.launch_persistent_context(str(profile),headless=True,viewport={'width':390,'height':900});page=context.pages[0]
            page.goto(url,wait_until='load');page.locator('#aral-start').click()
            for id in ('d04','d06'):
                page.locator('[data-aral-view=documents]').click();page.locator('[data-open-doc='+id+']').click();page.locator('#aral-doc-add').click()
            page.locator('[data-board-mode=map]').click();page.locator('[data-move-card=d04]').focus()
            for _ in range(50):page.keyboard.press('ArrowDown')
            page.locator('#aral-link-from').select_option('d04');page.locator('#aral-link-to').select_option('d06');page.locator('#aral-link-kind').select_option('contradict');page.locator('#aral-link-review').select_option('open');page.locator('#aral-link-note').fill('Un désaccord à reprendre, sans réécriture automatique.');page.locator('#aral-link-save').click()
            page.locator('#aral-hint').click();page.locator('[data-aral-view=argument]').click()
            for id in ('d04','d06'):page.locator('[data-proof-role='+id+']').select_option('support')
            page.locator('[name=aral-hypothesis][value=custom]').check();page.locator('#aral-custom-hypothesis').fill('Mon hypothèse personnelle est conservée.');page.locator('#aral-conclusion').fill('Mon texte original ne doit pas être réécrit par la nouvelle version.');page.locator('#aral-submit').click()
            page.wait_for_function('JSON.parse(localStorage.getItem(THOT_ARAL.storageKey)).lastFeedback')
            saved=normalized(page.evaluate('THOT_ARAL.getState()'));assert saved['cards']['d04']['y']==1064
            context.close();context=None;server.terminate();server.wait(timeout=5);server=None
            server=start(ROOT);context=engine.launch_persistent_context(str(profile),headless=True,viewport={'width':390,'height':900});page=context.pages[0]
            page.goto(url,wait_until='load');page.reload(wait_until='load');page.wait_for_function('!!window.THOT_ARAL');restored=normalized(page.evaluate('THOT_ARAL.getState()'))
            assert restored==saved,{'saved':saved,'restored':restored};assert page.locator('#aral-feedback').is_visible()
            assert page.locator('#aral-prepare-conclusion').count()==1,'La nouvelle vue HTML doit être réellement chargée'
            assert page.locator('[data-aral]').get_attribute('data-board-presentation')=='map','Le nouveau JavaScript doit être réellement exécuté'
            assert page.locator('.aral-mobile-tabs').evaluate('e=>getComputedStyle(e).position')=='static','La nouvelle feuille de style doit être réellement appliquée'
            result={'status':'PASS','browser':args.browser,'mode':'Deux versions réellement servies en HTTP à la même origine ; dates originales du ZIP conservées ; profil persistant fermé puis rouvert et rechargement normal de la version courante.','baseline':'25371839f1f109688e7dd79da672f6d7769d5f0a','preserved':list(saved),'old_bottom_position_preserved':restored['cards']['d04']['y'],'custom_hypothesis':restored['customHypothesis'],'conclusion':restored['conclusion']}
            args.out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(json.dumps(result,ensure_ascii=False,indent=2))
        finally:
            if context:context.close()
            if server:server.terminate();server.wait(timeout=5)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--baseline',type=Path,required=True);parser.add_argument('--browser',default='webkit');parser.add_argument('--port',type=int,default=31462);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args()
    try:run(args)
    except Exception as error:
        args.out.write_text(json.dumps({'status':'FAIL','browser':args.browser,'error':type(error).__name__+': '+str(error)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');raise
