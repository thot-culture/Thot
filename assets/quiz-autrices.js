  (() => {
    'use strict';
    const answers={currer:'charlotte',ellis:'emily',acton:'anne',eliot:'maryanne',sand:'aurore'};
    const explanations={currer:'Currer Bell est le pseudonyme de Charlotte Brontë.',ellis:'Ellis Bell est le pseudonyme d’Emily Brontë.',acton:'Acton Bell est le pseudonyme d’Anne Brontë.',eliot:'George Eliot est le pseudonyme de Mary Anne Evans, qui a utilisé le prénom Marian.',sand:'George Sand est le pseudonyme d’Aurore Dupin.'};
    const left=[...document.querySelectorAll('[data-pen]')];
    const right=[...document.querySelectorAll('[data-author]')];
    const status=document.getElementById('quiz-status');
    const progress=document.getElementById('quiz-progress');
    const instruction=document.getElementById('quiz-instruction');
    const details=document.getElementById('quiz-explanations');
    const reset=document.getElementById('quiz-reset');
    let selected=null, matched=new Set();
    const wrongTimers=new Map();
    const clearError=button=>{
      clearTimeout(wrongTimers.get(button));
      wrongTimers.delete(button);
      button.classList.remove('is-wrong');
    };
    const clearSelection=()=>{for(const b of [...left,...right])b.setAttribute('aria-pressed','false');};
    const updateProgress=()=>{const n=matched.size;progress.textContent=n+' association'+(n>1?'s':'')+' sur 5 trouvée'+(n>1?'s':'')+'.';};
    for(const button of left){
      button.addEventListener('click',event=>{
        if(button.disabled||matched.has(button.dataset.pen))return;
        selected=button.dataset.pen;
        clearSelection();
        button.setAttribute('aria-pressed','true');
        instruction.textContent='Maintenant, choisis l’autrice qui correspond à '+button.textContent+'.';
        status.textContent='Nom sélectionné : '+button.textContent+'.';
        if(event.detail===0)right.find(b=>!b.disabled)?.focus();
        else right.find(b=>!b.disabled)?.scrollIntoView?.({block:'nearest',behavior:'auto'});
      });
    }
    for(const button of right){
      button.addEventListener('click',()=>{
        if(button.disabled)return;
        const author=button.dataset.author;
        if(!selected){status.textContent='Choisis d’abord un nom de plume à gauche.';return;}
        if(matched.has(selected))return;
        const pen=selected;
        if(answers[pen]===author){
          clearError(button);
          matched.add(pen);
          const l=left.find(b=>b.dataset.pen===pen);
          l.disabled=true;button.disabled=true;
          l.classList.add('is-matched');button.classList.add('is-matched');
          l.dataset.pair=String(matched.size);button.dataset.pair=String(matched.size);
          l.setAttribute('aria-label',l.textContent+' — paire '+matched.size+' correctement associée');
          button.setAttribute('aria-label',button.textContent+' — paire '+matched.size+' correctement associée');
          l.setAttribute('aria-pressed','false');button.setAttribute('aria-pressed','false');
          status.textContent=l.dataset.explanation||explanations[pen];
          instruction.textContent='Association trouvée. Choisis le prochain nom de plume.';
          selected=null;updateProgress();
          if(matched.size===5){
            details.hidden=false;
            status.textContent='Bravo, les cinq associations sont trouvées ! Retrouve les explications et les sources juste en dessous.';
            details.querySelector('h3').focus();
            details.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
          }else{
            left.find(b=>!b.disabled)?.focus();
          }
        }else{
          clearError(button);
          button.classList.add('is-wrong');
          status.textContent='Ce n’est pas la bonne autrice. Essaie encore ou sélectionne un autre nom de plume.';
          wrongTimers.set(button,setTimeout(()=>clearError(button),700));
        }
      });
    }
    reset.addEventListener('click',()=>{
      selected=null;matched=new Set();
      for(const b of [...left,...right]){clearError(b);b.disabled=false;b.classList.remove('is-matched');delete b.dataset.pair;b.removeAttribute('aria-label');}
      clearSelection();details.hidden=true;updateProgress();
      status.textContent='Le jeu est réinitialisé. À toi de jouer.';
      instruction.textContent='Commence par sélectionner un nom de plume dans la colonne de gauche.';
      left[0].focus();
    });
    // N’activer le jeu qu’après l’installation de toutes ses interactions.
    for(const button of [...left,...right,reset])button.disabled=false;
    const loadStatus=document.getElementById('quiz-load-status');
    if(loadStatus)loadStatus.hidden=true;
  })();
