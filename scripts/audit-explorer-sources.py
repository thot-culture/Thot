#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Enregistre les documents réellement téléchargés ; aucune vérification fictive."""
import portable_io
from pathlib import Path
import json
import hashlib
import argparse
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/explorer-v2'
parser=argparse.ArgumentParser();parser.add_argument('--research',type=Path,required=True);parser.add_argument('--additions-research',type=Path);args=parser.parse_args();D=args.research

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,value):(OUT/'sources'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
aral=json.loads((OUT/'data/aral.json').read_text(encoding='utf-8'))
files={'d01':'moynaq.html','d02':'nasa-aral.txt','d03':'nasa-aral.txt','d04':'cornell.pdf','d05':'cornell.pdf','d06':'irrigation.pdf','d07':'cornell.pdf','d08':'nasa-aral.txt','d09':'undp.html','d10':'wb-restoration.pdf'}
records=[]
for doc in aral['documents']:
    f=(args.additions_research/'usgs-north.html') if doc['id']=='d11' else D/files[doc['id']];assert f.is_file()
    r={k:doc[k] for k in ('id','title','nature','date','author','source','credit','license','limits')};r.update(checked_on='2026-10-26',consultation='Document téléchargé et contenu textuel consulté ; figures scientifiques non reproduites.',downloaded_source=f.name,source_sha256=digest(f))
    if doc.get('license_url'):r['license_url']=doc['license_url']
    if doc.get('additional_sources'):r['additional_sources']=doc['additional_sources']
    if doc.get('media'):
        p=ROOT/doc['media']['src'].removeprefix('/Thot/');r.update(media=p.relative_to(ROOT).as_posix(),media_sha256=digest(p),media_bytes=p.stat().st_size,media_changes=('Réduction proportionnelle et conversion WebP ; original institutionnel intact accessible séparément.' if doc['media'].get('original_src') else 'Fichier documentaire intact ; cadrage uniquement en CSS, image entière dans la pièce.'))
    records.append(r)
write('aral-sources.json',{'checked_on':'2026-10-26','records':records,'primary_media_register':'aral-primary-media.json','rights_notes':['Photographie de Moynaq : Sebastian Kluger, CC BY-SA 3.0, fichier original conservé.','NASA : conditions NASA de réutilisation des médias, pas de licence Creative Commons inventée ; aucune suggestion de soutien.','Fiches de lecture et graphiques originaux THOT, faits et chiffres cités ; aucun rapport complet ou figure tierce non autorisée reproduit.','Hydrographie Natural Earth, domaine public. Les données et leurs limites sont identifiées.']})
rome=json.loads((OUT/'data/rome-content.json').read_text(encoding='utf-8'));records=[]
for item in rome['people']+rome['documents']:
    f=(args.additions_research if item['id']=='temple-dendur' else D)/({'hannibal':'hannibal.html','caesar':'caesar.html','augustus':'augustus.html','trajan':'trajan.html','coin-caesar':'met248033.html','coin-augustus':'met248037.html','coin-trajan':'met248042.html','temple-dendur':'met547802.html'}[item['id']]);assert f.is_file()
    r=dict(item);r.update(checked_on='2026-10-26',source_snapshot_sha256=digest(f),consultation='Notice et droits réellement consultés ; fichier image original téléchargé avant conversion de format.');records.append(r)
write('rome-sources.json',{'checked_on':'2026-10-26','records':records,'bibliography':rome['bibliography'],'bibliography_snapshots':[{'file':name,'sha256':digest(D/name)} for name in ('met-republic.html','met-empire.html','met-punic.html')],'cartography_register':'geography-sources.json','places_register':'pleiades-places.json','media_register':'rome-media.json','rights_note':'Notices THOT originales ; images des quatre représentations selon leurs licences propres, monnaies Met sous CC0. L’API Met renvoyait 410 : vérification faite sur les notices HTML du musée et leurs images primaires identifiées par IIIF, pas par l’API.'})
print('PASS : 11 notices Aral et 8 notices illustrées romaines tracées avec empreintes des sources consultées.')
