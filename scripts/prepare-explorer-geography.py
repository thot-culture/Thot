#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prépare les géométries sourcées. Dépendance de construction : Shapely 2.1.2.

Les deux bases historiques restent distinctes et sous leur propre licence.
Aucune interpolation, province inventée ou limite redessinée à la main.
"""
import portable_io
import argparse
from pathlib import Path
import hashlib
import json
import zipfile
from html import escape
from shapely import make_valid, union_all
from shapely.geometry import shape, box, mapping

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/explorer-v2'
FRAME=box(-15,18,55,60)
DATES=[('bc400','bc400',-400),('bc300','bc300',-300),('bc200','bc200',-200),('bc100','bc100',-100),('bc60','60bc',-60),('bc1','bc1',-1),('ad100','100',100),('ad117','117',117)]
HIST='da7a4b735ecef70aebdc9c73e409d8a2500d50f3'
AWMC='7ecf8bccea2efe1e1e9df2daf6001942de73fb87'
NE='ca96624a56bd078437bca8184e78163e5039ad19'
NAMES={'Roman Republic':'République romaine','Roman Empire':'Empire romain','Rome':'Rome','Carthage':'Carthage','Ptolemaic Kingdom':'Royaume ptolémaïque','Seleucid Empire':'Empire séleucide','Macedonia':'Macédoine','Bosporan Kingdom':'Royaume du Bosphore','Bosporian Kingdom':'Royaume du Bosphore','Judea':'Judée','Odrysian Kingdom':'Royaume odryse'}

def dump(path,value):
    path.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')

def project(x,y): return ((x+15)*1200/70,(60-y)*720/42)

def svgpath(g):
    chunks=[]
    if g.is_empty:return ''
    polys=[g] if g.geom_type=='Polygon' else list(g.geoms) if hasattr(g,'geoms') else []
    for p in polys:
        if p.geom_type!='Polygon':continue
        for ring in [p.exterior,*p.interiors]:
            chunks.append('M'+'L'.join(f'{project(x,y)[0]:.2f},{project(x,y)[1]:.2f}' for x,y,*_ in ring.coords)+'Z')
    return ''.join(chunks)

def prepare(src):
    (OUT/'sources').mkdir(exist_ok=True,parents=True);(OUT/'data').mkdir(exist_ok=True,parents=True)
    groups=[];registry={};hist_features=[];awmc_features=[];epochs=[];inputs=[]
    for eid,name,year in DATES:
        raw=src/(name+'.geojson');data=json.loads(raw.read_text(encoding='utf-8'));is_awmc=eid in ('bc60','ad117')
        source={'title':'Ancient World Mapping Center · '+str(abs(year))+(' av.' if year<0 else ' apr.')+' J.-C.','url':'https://github.com/AWMC/geodata/tree/'+AWMC} if is_awmc else {'title':'Historical Basemaps · A. Ourednik et contributeurs','url':'https://github.com/aourednik/historical-basemaps/tree/'+HIST}
        if is_awmc:
            features=[{'properties':{'NAME':'Roman Republic' if year<0 else 'Roman Empire'},'geometry':mapping(union_all([make_valid(shape(f['geometry'])) for f in data['features']]))}]
        else:features=data['features']
        paths=[]
        for i,f in enumerate(features):
            if not f.get('geometry'):continue
            geom=make_valid(shape(f['geometry'])).intersection(FRAME).simplify(.035,preserve_topology=True)
            d=svgpath(geom)
            if not d:continue
            props=f.get('properties',{});name=props.get('NAME') or 'Ensemble sans nom dans la source';roman=name in ('Roman Republic','Roman Empire','Rome');client=props.get('SUBJECTO') in ('Roman Republic','Roman Empire','Rome') and not roman
            tid=f'{eid}-t{i}';label=NAMES.get(name,name)
            paths.append(f'<path data-territory="{tid}" data-name="{escape(label,quote=True)}" data-roman="{str(roman).lower()}" data-client="{str(client).lower()}" fill-rule="evenodd" d="{d}"/>')
            registry[tid]={'title':label,'name_in_source':name,'text':('Ensemble des territoires romains figurés dans ce modèle. Le polygone ne décrit ni les statuts juridiques des populations, ni toutes les résistances, ni les subdivisions provinciales.' if roman else ('Dépendance de Rome signalée par le champ SUBJECTO de la source ; elle est distinguée des territoires romains directs.' if client else 'Ensemble nommé dans la source à cette date. Son contour est une reconstruction schématique ; sa présence ne décrit pas une frontière moderne ou un contrôle uniforme.')),'source':source,'document_ids':['coin-caesar','coin-augustus','coin-trajan'] if roman else [],'person_ids':['caesar','augustus','trajan'] if roman else ['hannibal'] if name=='Carthage' else [],'epoch_id':eid}
            feature={'type':'Feature','properties':{'id':tid,'epoch':eid,'name':name,'roman':roman,'client':client},'geometry':mapping(geom)}
            (awmc_features if is_awmc else hist_features).append(feature)
        groups.append('<g id="epoch-'+eid+'">'+''.join(paths)+'</g>')
        label=f'Vers {abs(year)} '+('av.' if year<0 else 'apr.')+' J.-C.'
        limits=('Agrégation des fragments AWMC en une emprise romaine, sans les présenter comme des provinces. Les contours restent approximatifs.' if is_awmc else 'Modèle mondial schématique, à lire à l’échelle méditerranéenne. Les dépendances renseignées par la source sont distinctes des territoires directs.')
        if eid=='bc1':limits+=' Cet état correspond à 1 av. J.-C., sous Auguste ; ce n’est pas une carte de 27 av. J.-C.'
        if eid=='ad117':limits+=' L’état AWMC ne détaille pas toutes les conquêtes orientales éphémères de Trajan : aucune affirmation d’emprise exhaustive ou durable en Mésopotamie n’est déduite du contour.'
        limits+=' Les bases diffèrent : une différence de contour entre deux dates ne mesure pas à elle seule une conquête. Aucune comparaison de superficie.'
        epochs.append({'id':eid,'label':label,'short_label':str(abs(year))+(' av.' if year<0 else ' apr.'),'year':year,'source':source,'limits':limits})
        inputs.append({'id':eid,'file':raw.name,'sha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'source':source,'license':'ODbL-1.0' if is_awmc else 'GPL-3.0'})
    land=json.loads((src/'land.data').read_text(encoding='utf-8'));landpaths=[]
    for f in land['features']:
        d=svgpath(make_valid(shape(f['geometry'])).intersection(FRAME).simplify(.035,preserve_topology=True))
        if d:landpaths.append('<path fill-rule="evenodd" d="'+d+'"/>')
    defs='<defs><pattern id="atlas-client-pattern" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#f1d6a0"/><path d="M0 7L7 0" stroke="#987239" stroke-width="2"/></pattern><g id="atlas-land">'+''.join(landpaths)+'</g>'+''.join(groups)+'</defs>'
    (OUT/'data/rome-geography.svg').write_text(defs+'\n',encoding='utf-8')
    dump(OUT/'data/rome-geography.json',{'epochs':epochs,'territories':registry,'projection':{'name':'Équirectangulaire','bounds':[-15,18,55,60],'viewBox':[0,0,1200,720],'simplification_degrees':.035},'inputs':inputs})
    for name,features,license_name in [('historical-basemaps-derived',hist_features,'GPL-3.0'),('awmc-derived',awmc_features,'ODbL-1.0')]:
        dump(OUT/('data/'+name+'.geojson'),{'type':'FeatureCollection','license':license_name,'features':features})
    # Sources préférées/modifiables distribuées séparément, avec licences intégrales.
    bundles=[('historical-basemaps-source.zip',[n+'.geojson' for n in ('bc400','bc300','bc200','bc100','bc1','100')]+['hist-LICENSE.txt','hist-readme.txt']),('awmc-source.zip',['60bc.geojson','117.geojson','awmc-LICENSE.txt','awmc-README.md'])]
    for filename,names in bundles:
        with zipfile.ZipFile(OUT/'sources'/filename,'w',compression=zipfile.ZIP_DEFLATED) as z:
            for name in names:z.write(src/name,name)
            z.write(Path(__file__), 'prepare-explorer-geography.py')
    with zipfile.ZipFile(OUT/'sources/natural-earth-source.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
        for name in ('land.data','rivers.data'):z.write(src/name,name)
        z.writestr('NOTICE.txt','Natural Earth, public domain. Version '+NE+' · https://www.naturalearthdata.com/about/terms-of-use/ · Fond moderne généralisé, pas littoral antique.')
    (OUT/'sources/GPL-3.0.txt').write_bytes((src/'hist-LICENSE.txt').read_bytes())
    (OUT/'sources/ODbL-1.0.txt').write_text('\n'.join(line.rstrip() for line in (src/'awmc-LICENSE.txt').read_text(encoding='utf-8').splitlines()).rstrip()+'\n',encoding='utf-8')
    dump(OUT/'sources/geography-sources.json',{'checked_on':'2026-10-26','historical_basemaps':{'commit':HIST,'license':'GPL-3.0','source_archive':'historical-basemaps-source.zip','limits':'Reconstitutions mondiales de travail ; limites approximatives, sans interpolation.'},'awmc':{'commit':AWMC,'license':'ODbL-1.0','source_archive':'awmc-source.zip','limits':'Union géométrique des fragments, aucune interprétation en provinces.'},'natural_earth':{'commit':NE,'license':'Public domain','source':'https://github.com/nvkelso/natural-earth-vector/tree/'+NE,'land_sha256':hashlib.sha256((src/'land.data').read_bytes()).hexdigest(),'limits':'Repère géographique moderne généralisé, pas un littoral antique reconstitué.'},'processing':'Shapely 2.1.2 : validation, découpage [-15,18,55,60], simplification topologique 0,035°, projection équirectangulaire SVG1200×720. Bases historiques distinctes, licences et sources téléchargeables. Aucun calcul de superficie.'})
    print('Géographie préparée :',len(epochs),'états,',len(registry),'ensembles sourcés ; licences séparées.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);prepare(parser.parse_args().sources)
