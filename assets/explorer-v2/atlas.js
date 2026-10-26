/* THOT Explorer — états cartographiques sourcés, sans interpolation ni service distant. */
(() => {
  'use strict';
  const root = document.getElementById('rome-atlas');
  if (!root) return;
  let data; try { data = JSON.parse(document.getElementById('atlas-data').textContent); } catch { return; }
  if (!data.epochs?.length || !data.chapters?.length) return;
  const $ = id => document.getElementById(id);
  const svg = $('atlas-map');
  const epochs = new Map(data.epochs.map(e => [e.id, e]));
  const places = new Map(data.places.map(p => [p.id, p]));
  const people = new Map(data.people.map(p => [p.id, p]));
  const documents = new Map(data.documents.map(d => [d.id, d]));
  const events = new Map((data.events || []).map(e=>[e.id,e]));
  const regions = new Map((data.regions || []).map(e=>[e.id,e]));
  const journeys = new Map((data.journeys || []).map(e=>[e.id,e]));
  let journey=null, journeyStep=0;
  const state = {epoch: 'ad117', before: 'bc300', after: 'ad117', compare: false, reveal: 50, mode: 'free', chapter: 0, step: 0, zoom: 1, x: 0, y: 0};
  let cardOpener, modalOpener, lastPointerTarget, lastDrag = false, skipModalRestore = false;
  const make = (tag, text, cls) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; };
  const btn = (text, action) => { const b = make('button', text); b.type = 'button'; b.addEventListener('click', action); return b; };
  const announce = text => { $('atlas-status').textContent = text; };
  function source(value) {
    const p = make('p', undefined, 'atlas-source');
    for (const s of Array.isArray(value) ? value : [value]) {
      if (!s) continue;
      if (p.childNodes.length) p.append(' · ');
      const item = typeof s === 'string' ? {title: 'Consulter la source', url: s} : s;
      const a = make('a', item.title || item.label || 'Consulter la source');
      if (/^https?:\/\//.test(item.url)) a.href = item.url; else a.textContent = item.title || item.url || '';
      p.append(a);
    }
    return p;
  }
  function paragraphs(target, value) {
    for (const s of Array.isArray(value) ? value : String(value || '').split('\n')) if (s) target.append(make('p', s));
  }
  function cloneLayer(id, target) {
    const original = $(id); target.replaceChildren(); if (!original) return;
    for (const child of original.children) { const node = child.cloneNode(true); node.removeAttribute('id'); node.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); target.append(node); }
    target.querySelectorAll('[data-territory],[data-place],[data-event]').forEach(node => { node.setAttribute('role','button'); node.setAttribute('tabindex','0'); node.setAttribute('aria-label', node.dataset.name || places.get(node.dataset.place)?.name || events.get(node.dataset.event)?.title || 'Ouvrir la fiche'); });
  }
  function mapView() {
    const w = 1200/state.zoom, h = 720/state.zoom;
    state.x = Math.max(-100, Math.min(1300-w, state.x)); state.y = Math.max(-60, Math.min(780-h, state.y));
    svg.setAttribute('viewBox', `${state.x} ${state.y} ${w} ${h}`);
    const split = state.x+w*state.reveal/100;
    const rect = $('atlas-clip-rect'); rect.setAttribute('x', state.x); rect.setAttribute('y', state.y); rect.setAttribute('width', w*state.reveal/100); rect.setAttribute('height', h);
    const right=$('atlas-right-rect');right.setAttribute('x',split);right.setAttribute('y',state.y);right.setAttribute('width',w*(100-state.reveal)/100);right.setAttribute('height',h);
    const divider = $('atlas-divider'); divider.querySelector('line').setAttribute('x1',split); divider.querySelector('line').setAttribute('x2',split);
    divider.querySelector('circle').setAttribute('cx',split); divider.querySelector('circle').setAttribute('cy',state.y+h/2);
    divider.querySelector('path').setAttribute('transform',`translate(${split-600} ${state.y+h/2-360})`);
    const scale=Math.min(svg.clientWidth/w,svg.clientHeight/h) || 1;
    svg.querySelectorAll('#atlas-city-layer text').forEach(t=>t.style.fontSize=(13/scale)+'px');
    const hits=[...svg.querySelectorAll('#atlas-city-layer .atlas-city-hit')];
    svg.querySelectorAll('#atlas-city-layer circle').forEach(c=>{
      let radius=5/scale;
      if(c.classList.contains('atlas-city-hit')){
        const nearest=Math.min(...hits.filter(other=>other!==c).map(other=>Math.hypot(other.cx.baseVal.value-c.cx.baseVal.value,other.cy.baseVal.value-c.cy.baseVal.value)));
        // Avoid overlapping invisible targets; the native list offers full touch targets.
        radius=Math.max(1,Math.min(22/scale,nearest/2-1));
      }
      c.setAttribute('r',String(radius));c.style.strokeWidth=String(2/scale);
    });
    svg.querySelectorAll('#atlas-event-layer rect').forEach(r=>{for(const [key,value] of Object.entries({x:-8,y:-8,width:16,height:16}))r.setAttribute(key,String(value/scale));});
    svg.querySelectorAll('#atlas-event-layer circle').forEach(c=>c.setAttribute('r',String(22/scale)));
    // Declutter labels only: all eleven sites remain available through the list.
    const boxes=[];svg.querySelectorAll('#atlas-city-layer text').forEach(t=>{t.style.visibility='visible';const b=t.getBoundingClientRect();if(boxes.some(a=>!(b.right<a.left||b.left>a.right||b.bottom<a.top||b.top>a.bottom)))t.style.visibility='hidden';else boxes.push(b);});
    $('atlas-zoom-value').textContent = Math.round(state.zoom*100)+' %';
    $('atlas-reveal-value').textContent = 'A : '+state.reveal+' % · B : '+(100-state.reveal)+' %';
    $('atlas-reveal').setAttribute('aria-valuetext',state.reveal+' % de la vue pour A ; '+(100-state.reveal)+' % pour B');
    root.querySelector('[data-atlas-zoom=in]').disabled = state.zoom >= 5;
    root.querySelector('[data-atlas-zoom=out]').disabled = state.zoom <= 1;
  }
  function zoomTo(next) {
    const cx = state.x+600/state.zoom, cy = state.y+360/state.zoom;
    state.zoom = Math.max(1, Math.min(5,next)); state.x = cx-600/state.zoom; state.y = cy-360/state.zoom; mapView();
  }
  function fillSelection() {
    const select = $('atlas-territory-select'); select.replaceChildren(); const empty = make('option','Choisir un territoire ou un lieu…'); empty.value=''; select.append(empty);
    const ids = [...new Set([...(state.compare ? [state.before,state.after] : [state.epoch])])];
    for (const eid of ids) {
      const group = make('optgroup'); group.label = epochs.get(eid).label;
      const nodes = $('epoch-'+eid).querySelectorAll('[data-territory]');
      nodes.forEach(node => { if (root.dataset.showTerritories==='false' || (node.dataset.roman==='false' && root.dataset.showNeighbors==='false')) return; const option = make('option',node.dataset.name+(node.dataset.client==='true'?' · dépendance signalée':'')); option.value='territory:'+node.dataset.territory; group.append(option); });
      if (group.childNodes.length) select.append(group);
    }
    if(root.dataset.showEvents==='true'){const g=make('optgroup');g.label='Événements datés · index toutes périodes';for(const item of events.values()){const o=make('option',item.date+' · '+item.title);o.value='event:'+item.id;g.append(o);}select.append(g);}
    if (root.dataset.showCities !== 'false') {
      const group=make('optgroup'); group.label='Lieux de repérage · index transchronologique';
      for (const p of data.places) { const o=make('option',p.name);o.value='place:'+p.id;group.append(o); } select.append(group);
    }
  }
  function renderMap() {
    $('atlas-compare-badges').hidden=!state.compare;
    $('atlas-badge-before').textContent='A · '+epochs.get(state.before).label;
    $('atlas-badge-after').textContent='B · '+epochs.get(state.after).label;
    cloneLayer('epoch-'+(state.compare?state.after:state.epoch),$('atlas-primary'));
    if (state.compare) cloneLayer('epoch-'+state.before,$('atlas-secondary'));
    if(state.compare)$('atlas-primary').setAttribute('clip-path','url(#atlas-right-clip)');else $('atlas-primary').removeAttribute('clip-path');
    $('atlas-secondary').toggleAttribute('hidden', !state.compare); $('atlas-divider').toggleAttribute('hidden', !state.compare);
    $('atlas-compare-controls').hidden = !state.compare; $('atlas-reveal-control').hidden = !state.compare;
    $('atlas-current-date').textContent=state.compare?epochs.get(state.before).label+' / '+epochs.get(state.after).label:epochs.get(state.epoch).label;
    const shown=state.compare?[epochs.get(state.before),epochs.get(state.after)]:[epochs.get(state.epoch)];
    const shared='Les bases diffèrent : une différence de contour entre deux dates ne mesure pas à elle seule une conquête. Aucune comparaison de superficie.';
    $('atlas-map-limits').textContent=shown.map(e=>e.label+' : '+e.limits.replace(shared,'').trim()).join(' ')+' '+shared;
    const sources=source(shown.map(e=>e.source));$('atlas-state-source').replaceChildren(...sources.childNodes);
    $('atlas-period').value=state.epoch; $('atlas-before').value=state.before; $('atlas-after').value=state.after;
    root.querySelectorAll('[data-atlas-period]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasPeriod===state.epoch)));
    const ids=state.compare?[state.before,state.after]:[state.epoch];
    const hasNeighbors=ids.some(id=>$('epoch-'+id).querySelector('[data-roman=false]'));
    const hasClients=ids.some(id=>$('epoch-'+id).querySelector('[data-client=true]'));
    const neighbors=root.querySelector('[data-atlas-layer=neighbors]');neighbors.disabled=!hasNeighbors;neighbors.parentElement.hidden=!hasNeighbors;
    root.querySelector('.atlas-legend-other').parentElement.hidden=!hasNeighbors;
    root.querySelector('.atlas-legend-client').parentElement.hidden=!hasClients;
    fillSelection(); mapView();
  }
  function setEpoch(id, speak=true) { if (!epochs.has(id)) return; state.epoch=id; if (state.compare) state.after=id; closeCard(false);renderMap(); if (speak) announce(epochs.get(id).label+' affiché. Aucun état intermédiaire n’est interpolé.'); }
  function linked(target,item) {
    const links=make('div',undefined,'atlas-card-linked');
    if ((item.document_ids || []).length || (item.person_ids || []).length) target.append(make('h4','Documents et personnages associés · dates dans les notices'));
    for (const id of item.document_ids || []) if (documents.has(id)) links.append(btn(documents.get(id).title,()=>openModal('document',id,document.activeElement)));
    for (const id of item.person_ids || []) if (people.has(id)) links.append(btn(people.get(id).name,()=>openModal('person',id,document.activeElement)));
    target.append(links);
  }
  function closeCard(restore=true) { $('atlas-card').hidden=true; if (restore && cardOpener?.isConnected) cardOpener.focus(); }
  function openCard(kind,id,opener=document.activeElement) {
    const item=kind==='place'?places.get(id):kind==='event'?events.get(id):kind==='region'?regions.get(id):data.territories[id]; if (!item) return;
    cardOpener=opener;$('atlas-card-kind').textContent=kind==='place'?'LIEU DE REPÉRAGE · TOUTES PÉRIODES':kind==='event'?'ÉVÉNEMENT · '+item.date+' · CARTE : '+epochs.get(state.epoch).label:kind==='region'?'CADRAGE DE LECTURE · FRONTIÈRES INCHANGÉES':'TERRITOIRE · '+epochs.get(item.epoch_id).label;
    $('atlas-card-title').textContent=item.title || item.name;
    const box=$('atlas-card-content'); box.replaceChildren();paragraphs(box,item.text);paragraphs(box,item.limits);box.append(source(item.source));
    if (item.name_in_source) box.append(make('p','Nom dans la base : '+item.name_in_source,'atlas-credit'));
    if (kind==='place') box.append(make('p','Coordonnées représentatives : '+Number(item.lat).toFixed(3)+'° N, '+Number(item.lon).toFixed(3)+'° E · Pleiades, CC BY 3.0.','atlas-credit'));
    if(kind==='region'&&item.periods){box.append(btn('Comparer ces deux états disponibles',()=>{if(state.mode==='guided')mode('free');endJourney();state.before=item.periods[0];state.after=item.periods[1];state.compare=true;$('atlas-compare-toggle').checked=true;closeCard(false);renderMap();announce('Comparaison de deux états documentés, sans interpolation.');}));}
    linked(box,item);$('atlas-card').hidden=false;$('atlas-card-title').focus();announce('Fiche ouverte : '+(item.title || item.name));
  }
  function openModal(kind,id,opener=document.activeElement) {
    const item=(kind==='person'?people:documents).get(id); if (!item)return;modalOpener=opener;
    const box=$('atlas-modal-content');box.replaceChildren();const h=make('h2',item.name || item.title);h.id='atlas-modal-title';box.append(h,make('p',item.dates || item.date,'atlas-kicker'));
    const imageSrc=typeof item.media==='object'?item.media.src:item.image || item.media;
    if (imageSrc) {
      const fig=make('figure');fig.tabIndex=0;fig.setAttribute('role','region');fig.setAttribute('aria-label','Image agrandissable, déplaçable avec les flèches du clavier');
      const img=make('img');img.src=imageSrc;img.alt=item.alt || item.title || item.name;fig.append(img);
      const error=make('p','L’image n’a pas pu être chargée. La notice et sa source restent lisibles.','atlas-image-error');error.hidden=true;
      img.addEventListener('error',()=>{img.hidden=true;error.hidden=false;});fig.append(error);box.append(fig);
      const label=make('label','Agrandir l’image','atlas-modal-image-control');const range=make('input');range.type='range';range.min=100;range.max=300;range.step=25;range.value=100;
      const output=make('output','100 %');range.addEventListener('input',()=>{img.style.width=range.value+'%';img.style.maxWidth='none';img.style.maxHeight='none';output.textContent=range.value+' %';});label.append(range,output);box.append(label);
      fig.addEventListener('keydown',e=>{const a={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]};if(e.target===fig&&a[e.key]){e.preventDefault();fig.scrollBy(...a[e.key]);}});
    }
    paragraphs(box,item.role);paragraphs(box,item.text || item.description);paragraphs(box,item.limits);box.append(source([item.source,...item.additional_sources || []]));
    box.append(make('p',item.credit,'atlas-credit'));if(id==='temple-dendur')box.append(source({title:'Photographie originale du musée, sans conversion',url:'https://images.metmuseum.org/CRDImages/eg/original/DP240337.jpg'}));const a=make('a',item.license || 'Conditions de réutilisation');a.href=item.license_url;box.append(a);
    if(kind==='person'&&journeys.has(id))box.append(btn('Suivre le parcours sur la carte',()=>{skipModalRestore=true;$('atlas-modal').close();startJourney(id);}));
    $('atlas-modal').showModal();
  }
  function focusArea(item) {
    if(!item)return;
    const center=item.center || [item.lon,item.lat];state.zoom=item.zoom || 2.6;
    state.x=(center[0]+15)*1200/70-600/state.zoom;state.y=(60-center[1])*720/42-360/state.zoom;mapView();
  }
  function endJourney(speak=false) {journey=null;$('atlas-journey').hidden=true;if(speak)announce('Parcours fermé. La carte reste dans son dernier état.');}
  function startJourney(id,index=0) {
    journey=journeys.get(id);if(!journey)return;journeyStep=Math.max(0,Math.min(journey.steps.length-1,index));
    state.mode='free';root.dataset.mode='free';$('atlas-story').hidden=true;root.querySelectorAll('[data-atlas-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasMode==='free')));
    state.compare=false;$('atlas-compare-toggle').checked=false;
    const step=journey.steps[journeyStep];setEpoch(step.epoch,false);focusArea(step.region_id?regions.get(step.region_id):places.get(step.place_id));
    $('atlas-journey').hidden=false;$('atlas-journey-progress').textContent=journey.title+' · '+(journeyStep+1)+' / '+journey.steps.length;
    $('atlas-journey-title').textContent=step.title;$('atlas-journey-date').textContent=step.date+' · État cartographique : '+epochs.get(step.epoch).label;
    const box=$('atlas-journey-body');box.replaceChildren();paragraphs(box,step.text);box.append(source(step.source));
    const actions=$('atlas-journey-actions');actions.replaceChildren();if(step.document_id)actions.append(btn('Examiner le document associé',()=>openModal('document',step.document_id,document.activeElement)));
    $('atlas-journey-previous').disabled=journeyStep===0;$('atlas-journey-next').disabled=journeyStep===journey.steps.length-1;
    $('atlas-journey-title').focus();announce('Parcours : '+step.title+'. '+$('atlas-journey-date').textContent);
  }
  function chapter(index,step=0) {
    endJourney();
    state.chapter=Math.max(0,Math.min(data.chapters.length-1,index));const c=data.chapters[state.chapter];state.step=Math.max(0,Math.min(c.steps.length-1,step));
    root.querySelector('[data-story-number]').textContent='CHAPITRE '+(state.chapter+1)+' / 6';root.querySelector('[data-story-title]').textContent=c.title;
    const body=root.querySelector('[data-story-body]');body.replaceChildren();paragraphs(body,c.description);paragraphs(body,c.body);
    const dates=root.querySelector('[data-story-dates]');dates.replaceChildren();c.steps.forEach((id,i)=>{const b=btn(epochs.get(id).label,()=>chapter(state.chapter,i));b.setAttribute('aria-pressed',String(i===state.step));dates.append(b);});
    const sources=source(c.source);root.querySelector('[data-story-source]').replaceChildren(...sources.childNodes);
    root.querySelectorAll('[data-atlas-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasChapter===c.id)));
    root.querySelector('[data-atlas-step=previous]').disabled=state.chapter===0&&state.step===0;
    root.querySelector('[data-atlas-step=next]').disabled=state.chapter===data.chapters.length-1&&state.step===c.steps.length-1;
    state.compare=false;$('atlas-compare-toggle').checked=false;setEpoch(c.steps[state.step],false);announce('Chapitre '+(state.chapter+1)+' : '+c.title+'. '+epochs.get(state.epoch).label);
  }
  function mode(value) {
    endJourney();state.mode=value;root.dataset.mode=value;$('atlas-story').hidden=value!=='guided';root.querySelectorAll('[data-atlas-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.atlasMode===value)));
    if(value==='guided')chapter(state.chapter,state.step);else announce('Exploration libre. Toutes les périodes et notices restent accessibles.');
  }
  root.querySelectorAll('.atlas-interactive').forEach(el=>{el.hidden=false;});$('atlas-text-fallback').open=false;
  cloneLayer('atlas-cities',$('atlas-city-layer'));cloneLayer('atlas-events',$('atlas-event-layer'));renderMap();
  $('atlas-journey-previous').addEventListener('click',()=>startJourney(journey.id,journeyStep-1));
  $('atlas-journey-next').addEventListener('click',()=>startJourney(journey.id,journeyStep+1));
  $('atlas-journey-close').addEventListener('click',()=>{endJourney(true);svg.focus();});
  root.querySelectorAll('[data-atlas-region]').forEach(b=>b.addEventListener('click',()=>{endJourney();focusArea(regions.get(b.dataset.atlasRegion));openCard('region',b.dataset.atlasRegion,b);}));
  window.addEventListener('resize',mapView);
  root.querySelectorAll('[data-atlas-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.atlasMode)));
  root.querySelectorAll('[data-atlas-chapter]').forEach(b=>b.addEventListener('click',()=>chapter(data.chapters.findIndex(c=>c.id===b.dataset.atlasChapter))));
  root.querySelectorAll('[data-atlas-step]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.atlasStep==='next'?1:-1;let step=state.step+d,index=state.chapter;if(step<0){index--;step=data.chapters[index].steps.length-1;}else if(step>=data.chapters[index].steps.length){index++;step=0;}chapter(index,step);}));
  function chooseEpoch(id){
    endJourney();
    if(state.mode==='guided'){
      const index=data.chapters[state.chapter].steps.indexOf(id);
      if(index>=0){chapter(state.chapter,index);return;}
      mode('free');
    }
    setEpoch(id);
  }
  $('atlas-period').addEventListener('change',e=>chooseEpoch(e.target.value));root.querySelectorAll('[data-atlas-period]').forEach(b=>b.addEventListener('click',()=>chooseEpoch(b.dataset.atlasPeriod)));
  $('atlas-compare-toggle').addEventListener('change',e=>{endJourney();state.compare=e.target.checked;if(state.compare&&state.mode==='guided')mode('free');closeCard(false);renderMap();announce(state.compare?'Comparaison activée. Les deux dates sont alignées ; déplacez le curseur pour les révéler.':'Comparaison désactivée.');});
  for(const id of ['before','after'])$('atlas-'+id).addEventListener('change',e=>{state[id]=e.target.value;closeCard(false);renderMap();announce('Comparaison : '+epochs.get(state.before).label+' et '+epochs.get(state.after).label);});
  $('atlas-reveal').addEventListener('input',e=>{state.reveal=Number(e.target.value);mapView();});
  root.querySelectorAll('[data-atlas-zoom]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.atlasZoom==='reset'){state.zoom=1;state.x=0;state.y=0;mapView();}else zoomTo(state.zoom*(b.dataset.atlasZoom==='in'?1.4:1/1.4));announce('Grossissement : '+Math.round(state.zoom*100)+' %.');}));
  const pans={left:[-100,0],right:[100,0],up:[0,-70],down:[0,70]};
  root.querySelectorAll('[data-atlas-pan]').forEach(b=>b.addEventListener('click',()=>{const a=pans[b.dataset.atlasPan];state.x+=a[0]/state.zoom;state.y+=a[1]/state.zoom;mapView();announce('Vue déplacée.');}));
  root.querySelectorAll('[data-atlas-layer]').forEach(c=>c.addEventListener('change',()=>{root.dataset['show'+c.dataset.atlasLayer[0].toUpperCase()+c.dataset.atlasLayer.slice(1)]=String(c.checked);fillSelection();announce('Couche '+c.parentNode.textContent.trim()+(c.checked?' affichée.':' masquée.'));}));
  $('atlas-territory-select').addEventListener('change',e=>{const [kind,id]=e.target.value.split(':');openCard(kind,id,e.target);});
  $('atlas-close-card')?.addEventListener('click',()=>closeCard());root.querySelector('[data-atlas-close-card]').addEventListener('click',()=>closeCard());
  svg.addEventListener('click',e=>{if(lastDrag){lastDrag=false;return;}const t=e.target.closest('[data-territory],[data-place],[data-event]') || lastPointerTarget; lastPointerTarget=null;if(t)openCard(t.dataset.event?'event':t.dataset.place?'place':'territory',t.dataset.event||t.dataset.place||t.dataset.territory,t);});
  svg.addEventListener('keydown',e=>{
    const t=e.target.closest('[data-territory],[data-place],[data-event]');if(t&&['Enter',' '].includes(e.key)){e.preventDefault();openCard(t.dataset.event?'event':t.dataset.place?'place':'territory',t.dataset.event||t.dataset.place||t.dataset.territory,t);return;}
    if(e.target!==svg)return;const a={ArrowLeft:pans.left,ArrowRight:pans.right,ArrowUp:pans.up,ArrowDown:pans.down};
    if(a[e.key]){e.preventDefault();state.x+=a[e.key][0]/state.zoom;state.y+=a[e.key][1]/state.zoom;mapView();}else if(['+','=','-','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home'){state.zoom=1;state.x=0;state.y=0;mapView();}else zoomTo(state.zoom*(e.key==='-'?1/1.2:1.2));}
  });
  const pointers=new Map();let start;
  const distance=()=>{const a=[...pointers.values()];return a.length===2?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0;};
  svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;lastPointerTarget=e.target.closest('[data-territory],[data-place],[data-event]');pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});svg.setPointerCapture(e.pointerId);start={x:e.clientX,y:e.clientY,vx:state.x,vy:state.y,zoom:state.zoom,distance:distance(),reveal:!!e.target.closest('#atlas-divider')};lastDrag=false;});
  svg.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!start)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>5)lastDrag=true;
    if(pointers.size===2&&start.distance){zoomTo(start.zoom*distance()/start.distance);return;}
    if(start.reveal){const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const p=point.matrixTransform(svg.getScreenCTM().inverse());state.reveal=Math.round(Math.max(0,Math.min(100,(p.x-state.x)/(1200/state.zoom)*100)));$('atlas-reveal').value=state.reveal;mapView();return;}
    const rect=svg.getBoundingClientRect();const units=Math.min(rect.width/(1200/state.zoom),rect.height/(720/state.zoom));state.x=start.vx-dx/units;state.y=start.vy-dy/units;mapView();svg.classList.add('is-dragging');
  });
  function endPointer(e){pointers.delete(e.pointerId);start=null;svg.classList.remove('is-dragging');}
  svg.addEventListener('pointerup',endPointer);svg.addEventListener('pointercancel',endPointer);
  svg.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();zoomTo(state.zoom*(e.deltaY<0?1.15:1/1.15));},{passive:false});
  root.querySelector('[data-atlas-library]').addEventListener('click',()=>{const target=$('atlas-library');target.scrollIntoView({behavior:'auto',block:'start'});target.tabIndex=-1;target.focus();});
  root.querySelectorAll('[data-atlas-person]').forEach(b=>b.addEventListener('click',()=>openModal('person',b.dataset.atlasPerson,b)));
  root.querySelectorAll('[data-atlas-document]').forEach(b=>b.addEventListener('click',()=>openModal('document',b.dataset.atlasDocument,b)));
  root.querySelector('[data-atlas-close-modal]').addEventListener('click',()=>$('atlas-modal').close());
  $('atlas-modal').addEventListener('close',()=>{if(skipModalRestore){skipModalRestore=false;return;}if(modalOpener?.isConnected)modalOpener.focus();});
  window.THOT_ATLAS={getState:()=>({...state,journey:journey?.id || null,journeyStep}),epochs:[...epochs.keys()]};
})();
