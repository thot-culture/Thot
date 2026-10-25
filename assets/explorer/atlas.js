(() => {
 'use strict';const root=document.querySelector('[data-places]');if(!root)return;
 const buttons=[...root.querySelectorAll('[data-place]')],panels=[...root.querySelectorAll('[data-place-panel]')],status=root.querySelector('[data-place-status]');if(!buttons.length||buttons.length!==panels.length||!status)return;
 function select(id){const panel=panels.find(p=>p.dataset.placePanel===id),button=buttons.find(b=>b.dataset.place===id);if(!panel||!button)return;panels.forEach(p=>p.hidden=p!==panel);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));status.textContent='Mention sélectionnée : '+button.textContent+'. Ce dossier ne fournit pas de coordonnées géographiques.';}
 buttons.forEach(b=>b.addEventListener('click',()=>select(b.dataset.place)));select(buttons[0].dataset.place);root.querySelector('.place-controls').hidden=false;
})();
