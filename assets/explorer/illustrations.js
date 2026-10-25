(() => {
 'use strict';
 for(const root of document.querySelectorAll('[data-structure-atlas]')){
  const choices=[...root.querySelectorAll('[data-structure]')],panels=[...root.querySelectorAll('[data-structure-panel]')];
  const controls=root.querySelector('.structure-controls'),status=root.querySelector('.structure-status');
  if(choices.length!==7||panels.length!==7||!controls||!status)continue;
  function select(id){
   const button=choices.find(b=>b.dataset.structure===id),panel=panels.find(p=>p.dataset.structurePanel===id);
   if(!button||!panel)return;
   choices.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));panels.forEach(p=>p.hidden=p!==panel);
   status.textContent='Repère sélectionné : '+button.textContent+'. Le dessin reste un modèle qualitatif.';
  }
  choices.forEach(b=>b.addEventListener('click',()=>select(b.dataset.structure)));
  root.querySelectorAll('[data-skin-toggle]').forEach(box=>box.addEventListener('change',()=>{
   root.querySelectorAll('[data-skin-layer="'+box.dataset.skinToggle+'"]').forEach(layer=>{layer.toggleAttribute('hidden',!box.checked);layer.setAttribute('aria-hidden',String(!box.checked));});
   status.textContent=(box.checked?'Repère réaffiché : ':'Repère masqué : ')+box.parentElement.textContent.trim()+'. Les explications restent accessibles.';
  }));
  select('chromatophore');controls.hidden=false;
 }
})();
