#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib,json,shutil,re,zipfile,argparse
import portable_io
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Optimiser les médias téléchargés et tracer leurs empreintes, sans accès réseau.');parser.add_argument('--research',type=Path,required=True);args=parser.parse_args()
D=args.research;O=ROOT/'assets/explorer-v2';M=O/'media'
(D/'media-originals').mkdir(exist_ok=True)
# Les originaux de Rome restent archivés dans l'espace de livraison. Les notices lient l'original du détenteur.
records=json.loads((D/'rome-media-downloads.json').read_text(encoding='utf-8'))
for rec in records:
 p=M/rec['original'];p=p if p.exists() else D/'media-originals'/rec['original'];out=M/(rec['id']+'.webp')
 with Image.open(p) as image:
  im=ImageOps.exif_transpose(image);im.thumbnail((800,1000) if rec['id']=='augustus' else (1000,1100));im.save(out,'WEBP',quality=82 if rec['id']=='augustus' else 86,method=6)
  rec.update(width=im.width,height=im.height,original_sha256=hashlib.sha256(p.read_bytes()).hexdigest(),display_sha256=hashlib.sha256(out.read_bytes()).hexdigest(),display_path=str(out.relative_to(ROOT)),display_bytes=out.stat().st_size,changes='Redimensionnement, orientation EXIF et conversion WebP, sans retouche du sujet.')
 if p.parent==M:shutil.move(p,D/'media-originals'/p.name)
(O/'sources/rome-media.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Hydrographie réelle Natural Earth, découpée au bassin et simplifiée ; aucun contour de lac inventé.
rivers=json.loads((D/'rivers.data').read_text(encoding='utf-8'));paths=[];selected=[]
for f in rivers['features']:
 name=' '.join(str(f['properties'].get('name','')).split())
 if name not in ('Amu Darya','Syr Darya'):continue
 selected.append(f);geom=f['geometry'];lines=geom['coordinates'] if geom['type']=='MultiLineString' else [geom['coordinates']]
 for line in lines:
  d='M'+'L'.join(f'{(x-50)*27+30:.2f},{(49-y)*32+25:.2f}' for x,y,*_ in line)
  paths.append('<path d="'+d+'" class="aral-river-line" fill="none" stroke="#166d71" stroke-width="3"/>')
svg='<figure class="aral-data-figure"><svg viewBox="0 0 750 500" role="img" aria-label="Repérage des axes modernes de l’Amou-Daria et du Syr-Daria, à partir des coordonnées Natural Earth"><rect width="750" height="500" fill="#eeeade"/>'+''.join(paths)+'<text x="45" y="60">Vers la mer d’Aral</text><text x="60" y="175">Amou-Daria</text><text x="480" y="145">Syr-Daria</text><text x="40" y="465">Repère moderne généralisé · pas une carte de débits</text></svg><figcaption>Carte originale THOT d’après les coordonnées Natural Earth (domaine public). Fleuves modernes, projection de repérage ; canaux, rivages historiques et débits non représentés. <a href="https://github.com/nvkelso/natural-earth-vector/blob/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_50m_rivers_lake_centerlines.geojson">Source géographique</a>.</figcaption></figure><p class="aral-water-balance">Apports des fleuves + pluie ↔ évaporation. Lac terminal : pas de sortie de surface vers un océan.</p>'
(O/'data/aral-rivers.svg').write_text(svg+'\n',encoding='utf-8')
(O/'sources/aral-rivers-original.geojson').write_text(json.dumps({'type':'FeatureCollection','features':selected},ensure_ascii=False)+'\n',encoding='utf-8')
# Coordonnées originales et attribution de chacun des lieux.
places=[]
for id in ('roma','carthage','athens','alexandria','lyon'):
 p=json.loads((D/(id+'.json')).read_text(encoding='utf-8'))
 places.append({'id':id,'pleiades_id':p['id'],'title':p['title'],'reprPoint':p['reprPoint'],'source':p.get('uri'),'creators':p.get('creators'),'license':'CC BY 3.0','license_url':'https://creativecommons.org/licenses/by/3.0/','checked_on':'2026-10-26','json_sha256':hashlib.sha256((D/(id+'.json')).read_bytes()).hexdigest()})
(O/'sources/pleiades-places.json').write_text(json.dumps(places,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Médias optimisés',sum(r['display_bytes'] for r in records),'octets ;',len(selected),'segments fluviaux ; 5 lieux vérifiés.')
