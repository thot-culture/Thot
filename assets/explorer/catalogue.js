(() => {
 'use strict';
 const form=document.querySelector('.explorer-search'),cards=[...document.querySelectorAll('[data-resource]')];
 if(!form||!cards.length)return;
 const query=document.querySelector('#explorer-query'),discipline=document.querySelector('#explorer-discipline'),collection=document.querySelector('#explorer-collection'),category=document.querySelector('#explorer-category');
 const status=document.querySelector('.explorer-results'),empty=document.querySelector('.explorer-empty');
 if(!query||!discipline||!collection||!category||!status||!empty)return;
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
 const records=cards.map(card=>({card,text:normalize(card.textContent+' '+card.dataset.resource)}));
 function valid(select,value){return [...select.options].some(o=>o.value===value)?value:'';}
 function update(write=true){
  let n=0;const terms=normalize(query.value).split(/\s+/).filter(Boolean);
  for(const r of records){const d=r.card.dataset;const visible=(!discipline.value||d.discipline===discipline.value)&&(!collection.value||d.collection===collection.value)&&(!category.value||d.category===category.value)&&terms.every(t=>r.text.includes(t));r.card.hidden=!visible;if(visible)n++;}
  status.textContent=n===0?'Aucune ressource trouvée.':n+' ressource'+(n>1?'s':'')+' disponible'+(n>1?'s':'')+'.';empty.hidden=n!==0;
  if(write)try{const url=new URL(location.href);for(const [key,field] of [['q',query],['discipline',discipline],['collection',collection],['categorie',category]]){if(field.value)url.searchParams.set(key,field.value);else url.searchParams.delete(key);}history.replaceState(history.state,'',url);}catch{}
 }
 function restore(){try{const url=new URL(location.href);query.value=url.searchParams.get('q')||'';discipline.value=valid(discipline,url.searchParams.get('discipline')||'');collection.value=valid(collection,url.searchParams.get('collection')||'');category.value=valid(category,url.searchParams.get('categorie')||'');}catch{}update(false);}
 function reset(){query.value='';discipline.value='';collection.value='';category.value='';update();query.focus();}
 form.addEventListener('submit',event=>{event.preventDefault();update();});form.addEventListener('input',()=>update());form.addEventListener('change',()=>update());form.addEventListener('reset',event=>{event.preventDefault();reset();});document.querySelector('[data-reset-explorer]').addEventListener('click',reset);window.addEventListener('popstate',restore);restore();form.hidden=false;
})();
