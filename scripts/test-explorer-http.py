#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contrôle HTTP local sous /Thot/ ; aucun contrôle de publication implicite."""
import portable_io
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,urldefrag
from urllib.request import urlopen
from urllib.error import HTTPError
from pathlib import Path
import argparse
import json
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):super().__init__();self.urls=[]
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ('href','src') and v:self.urls.append(v)
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--origin',default='http://127.0.0.1:8767');args=p.parse_args()
    assert urlsplit(args.origin).hostname in ('127.0.0.1','localhost'),'Ce test vise uniquement un aperçu local.'
    base=args.origin.rstrip('/')+'/Thot/';urls=set()
    pages=[*ROOT.glob('*.html'),*(ROOT/'articles').glob('*.html'),*(ROOT/'explorer').rglob('*.html')]
    for file in pages:
        url=urljoin(base,file.relative_to(ROOT).as_posix());urls.add(url);parser=Links();parser.feed(file.read_text(encoding='utf-8'))
        for href in parser.urls:
            target=urldefrag(urljoin(url,href))[0]
            if urlsplit(target).netloc==urlsplit(base).netloc and urlsplit(target).path.startswith('/Thot/'):urls.add(target)
    for url in sorted(urls):
        with urlopen(url,timeout=10) as response:
            assert response.status==200,(url,response.status)
            if url.endswith('.js'):assert 'javascript' in response.headers.get('Content-Type',''),url
    retired=json.loads((ROOT/'docs/EXPLORER-RETRAIT-TEMPORAIRE-20261026.json').read_text(encoding='utf-8'))['removed_pages']
    for name in retired:
        if name=='explorer.html':continue
        try:urlopen(urljoin(base,name),timeout=10)
        except HTTPError as err:assert err.code==404,(name,err.code)
        else:raise AssertionError('Ancienne page restaurée : '+name)
    print('PASS HTTP local :',len(pages),'pages et',len(urls),'URL/ressources accessibles sous /Thot/ ; onze anciennes pages retournent 404. Aucune vérification publique.')
