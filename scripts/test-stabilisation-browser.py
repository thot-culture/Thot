#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recette Chromium du retrait et des références après réponse ; fixtures locales."""
import portable_io
from pathlib import Path
import argparse
import json
from browser_fixture import ROOT, chromium, page_for, no_overflow
from playwright.sync_api import sync_playwright

def checks(output):
    output.mkdir(parents=True, exist_ok=True)
    results=[]
    with sync_playwright() as pw:
        browser=chromium(pw)
        for width in (320,390,768,1440):
            context,page,errors=page_for(browser,'quiz.html',width)
            page.locator('#start-button').click()
            page.evaluate('''round=[questions.find(q=>q.q===window.THOT_QUIZ_REFERENCE_DATA[0].question)];
index=0;score=0;attempts=[];roundFinished=false;renderQuestion();''')
            assert page.locator('.quiz-references').count()==0
            correct=page.evaluate('correctIndexes(round[0])[0]')
            page.locator('#answer-list button[data-idx="'+str(correct)+'"]').click()
            link=page.locator('#feedback .quiz-references a').first
            assert link.is_visible() and link.get_attribute('href')=='https://science.nasa.gov/earth/facts/'
            link.focus();assert link.evaluate('(el)=>document.activeElement===el')
            assert page.evaluate('score')==1
            no_overflow(page);assert not errors,errors
            page.screenshot(path=str(output/f'quiz-references-{width}.png'))
            # Une réponse/explication modifiée ou une question non vérifiée ne reçoit pas une validation périmée.
            assert page.evaluate('''()=>{const box=document.createElement('div');
const item={...round[0],why:'Explication modifiée'};
window.THOT_QUIZ_REFERENCES.render(box,item);return box.children.length;}''')==0
            assert page.evaluate('''()=>{const box=document.createElement('div');
window.THOT_QUIZ_REFERENCES.render(box,questions.find(q=>q.q.includes('étymologie populaire')));
return box.children.length;}''')==0
            page.evaluate('''delete window.THOT_QUIZ_REFERENCES; score=0;index=0;attempts=[];renderQuestion();''')
            page.locator('#answer-list button[data-idx="'+str(correct)+'"]').click()
            assert page.evaluate('score')==1 and not errors
            assert page.locator('.quiz-references').count()==0
            context.close()
            # Défi quotidien réel jusqu’au bilan, sans changer sa sélection ni ses règles.
            context,page,errors=page_for(browser,'quiz.html',width)
            page.locator('#daily-start-button').click()
            for i in range(5):
                expected=page.evaluate('correctIndexes(round[index])')
                for index in expected:page.locator('#answer-list button[data-idx="'+str(index)+'"]').click()
                if page.locator('#validate-button').is_visible():page.locator('#validate-button').click()
                assert page.locator('#feedback').is_visible()
                page.locator('#next-button').click()
            assert page.locator('#screen-result').is_visible()
            assert page.evaluate('score')==5
            no_overflow(page);assert not errors,errors
            page.screenshot(path=str(output/f'defi-quotidien-{width}.png'));context.close()
            context,page,errors=page_for(browser,'articles/pieuvres-couleur.html',width)
            for id in ('chromatophore','sac','muscles','iridophores','leucophores','lumiere','nerfs'):
                button=page.locator('[data-structure="'+id+'"]');button.focus();page.keyboard.press('Enter')
                assert page.locator('[data-structure-panel="'+id+'"]').is_visible()
            layer=page.locator('[data-skin-toggle=iridophores]');layer.uncheck()
            assert not page.locator('[data-skin-layer=iridophores]').is_visible();layer.check()
            assert page.locator('[data-skin-layer=iridophores]').is_visible()
            assert page.locator('.structure-limit a').get_attribute('href')=='#chromato-modele'
            no_overflow(page);assert not errors,errors
            page.locator('.cephalo-atlas').screenshot(path=str(output/f'pieuvres-structures-{width}.png'));context.close()
            context,page,errors=page_for(browser,'articles/puissance-etats-unis.html',width)
            page.locator('[data-etape=baghram]').click()
            assert '2 juillet 2021' in page.locator('#chronologie-detail-baghram').inner_text()
            assert page.locator('[data-etape=baghram] .chronologie-date').inner_text()=='2 juil. 2021'
            page.locator('#comparateur-direct').click()
            assert 'Acteurs en présence' in page.locator('.comparateur-table').inner_text()
            assert 'Pour la coalition et ses partenaires' in page.locator('.comparateur-table').inner_text()
            no_overflow(page);assert not errors,errors
            page.locator('.comparateur-puissance').screenshot(path=str(output/f'comparateur-{width}.png'));context.close()
            context,page,errors=page_for(browser,'404.html',width,False)
            assert 'temporairement retirées' in page.locator('main').inner_text()
            assert page.locator('meta[name=robots]').get_attribute('content')=='noindex'
            no_overflow(page);context.close()
            results.append({'width':width,'quiz_references':True,'stale_reference_hidden':True,'missing_references_nonblocking':True,'daily_complete':True,'skin_shared_dependencies':True,'bagram_comparator':True,'404_without_js':True,'pageerrors':[]})
        browser.close()
    (output/'browser.json').write_text(json.dumps({'ok':True,'results':results,'method':'Chromium réel sur fixtures locales, pas de navigation publique ni téléphone physique.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PASS : références après réponse, garde périmée, repli, défi quotidien complet, schéma partagé, Bagram, comparateur et retrait à quatre largeurs.')

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--output',type=Path,default=ROOT.parent/'THOT-STABILISATION-20261026'/'tests'/'stabilisation')
    checks(ap.parse_args().output)
