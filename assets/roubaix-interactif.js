/* THOT · Pilote documentaire de Roubaix 1917.
 * Notices synthétisées : ni transcription intégrale, ni reproduction de document.
 * Carte OpenStreetMap contemporaine : aucun point ne prétend localiser la salle de 1917.
 */
(() => {
  'use strict';
  const root = document.querySelector('#explorer-roubaix');
  if (!root) return;
  const events = [
  {
    "date": "Automne 1914",
    "short": "1914",
    "title": "Roubaix passe sous occupation allemande",
    "body": "L'administration militaire allemande exerce son autorité sur la ville. Les affiches conservées documentent les ordres publiés durant l'occupation.",
    "nuance": "La date est présentée à l'échelle de la saison, comme dans l'article.",
    "ref": "ref1"
  },
  {
    "date": "13 janvier 1917",
    "short": "13 jan.",
    "title": "Recherche de selliers : un brouillon d'avis",
    "body": "Un brouillon municipal évoque un recrutement rémunéré de selliers et présente ce travail comme un moyen d'éviter un bataillon d'ouvriers.",
    "nuance": "Il s'agit d'un brouillon signalé par une notice, non d'une preuve d'embauche effective.",
    "ref": "ref3"
  },
  {
    "date": "5 mars 1917",
    "short": "5 mars",
    "title": "Recherche d'ouvriers spécialisés",
    "body": "Une affiche sollicite des ouvriers de métier pour un atelier d'automobiles de Roubaix.",
    "nuance": "L'annonce témoigne d'une demande de main-d'œuvre, pas des conditions vécues par chaque ouvrier.",
    "ref": "ref4"
  },
  {
    "date": "1er juillet 1917",
    "short": "1er juil.",
    "title": "Annonce des revues d'appel",
    "body": "Une affiche signée Lehmeyer convoque les hommes nés entre 1867 et 1900.",
    "nuance": "La publication d'une convocation ne prouve pas combien d'hommes se sont effectivement présentés.",
    "ref": "ref2"
  },
  {
    "date": "Du 9 au 13 juillet 1917",
    "short": "9–13 juil.",
    "title": "Période des convocations annoncées",
    "body": "Selon l'affiche du 1er juillet, les hommes concernés devaient se rendre à la salle de gymnastique de la rue du Grand-Chemin.",
    "nuance": "Ces dates décrivent le calendrier annoncé, et non un registre de présence établi.",
    "ref": "ref2"
  },
  {
    "date": "12 août 1917",
    "short": "12 août",
    "title": "Un avis sur des bombes",
    "body": "Une affiche signée Hofmann affirme qu'un aviateur britannique a largué des bombes ayant tué plusieurs civils.",
    "nuance": "Cette pièce rapporte une affirmation de la commandanture : les circonstances et le bilan demanderaient d'autres sources.",
    "ref": "ref8"
  },
  {
    "date": "19 décembre 1917",
    "short": "19 déc.",
    "title": "Départs annoncés vers le sud de la France",
    "body": "Une affiche signée Hofmann annonce des horaires et des dates de départ pour des personnes ayant formulé une demande.",
    "nuance": "Elle ne suffit pas pour qualifier tous les déplacements de volontaires ou de forcés.",
    "ref": "ref7"
  },
  {
    "date": "Octobre 1918",
    "short": "1918",
    "title": "Fin de l'occupation de Roubaix",
    "body": "La ville sort de l'occupation allemande en octobre 1918 ; les affiches suivantes témoignent du changement des autorités.",
    "nuance": "Le corpus couvre aussi les mois précédant et suivant l'occupation.",
    "ref": "ref1"
  }
];
  const notes = [
  {
    "id": "nature",
    "label": "Nature et auteur",
    "field": "Affiche administrative",
    "value": "Signée par le commandant Lehmeyer.",
    "detail": "Elle rend public un ordre de l'autorité occupante et ne donne pas le point de vue des habitants."
  },
  {
    "id": "date",
    "label": "Date",
    "field": "1er juillet 1917",
    "value": "Date de publication de l'affiche.",
    "detail": "La date du document est distincte de celles des convocations, prévues plusieurs jours plus tard."
  },
  {
    "id": "public",
    "label": "Public visé",
    "field": "Hommes nés de 1867 à 1900",
    "value": "Les années de naissance sont incluses, selon la notice.",
    "detail": "Cela délimite les personnes visées mais ne révèle pas combien se sont réellement présentées."
  },
  {
    "id": "lieu",
    "label": "Lieu et période",
    "field": "Rue du Grand-Chemin",
    "value": "Salle de gymnastique, du 9 au 13 juillet 1917.",
    "detail": "La rue est identifiée ; le bâtiment précis n'est pas localisé par les sources consultées."
  }
];
  const buttons = [...root.querySelectorAll('[data-date-index]')];
  function chooseEvent(index) {
    const item = events[index];
    if (!item) return;
    buttons.forEach((b,i) => b.setAttribute('aria-pressed', String(i === index)));
    root.querySelector('#timeline-date').textContent = item.date;
    root.querySelector('#timeline-title').textContent = item.title;
    root.querySelector('#timeline-description').textContent = item.body;
    root.querySelector('#timeline-limitation').textContent = item.nuance;
    const source = root.querySelector('#timeline-reference');
    source.href = '#' + item.ref;
    source.textContent = 'Retrouver la source [' + item.ref.replace('ref','') + ']';
  }
  buttons.forEach(button => button.addEventListener('click', () => chooseEvent(Number(button.dataset.dateIndex))));
  chooseEvent(0);

  const hotspots = [...root.querySelectorAll('[data-archive-note]')];
  function chooseNote(id) {
    const item = notes.find(note => note.id === id);
    if (!item) return;
    hotspots.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.archiveNote === id)));
    root.querySelector('#archive-note-title').textContent = item.label;
    root.querySelector('#archive-note-field').textContent = item.field;
    root.querySelector('#archive-note-value').textContent = item.value;
    root.querySelector('#archive-note-analysis').textContent = item.detail;
  }
  hotspots.forEach(button => button.addEventListener('click', () => chooseNote(button.dataset.archiveNote)));
  chooseNote('nature');


  /* Archives authentiques hébergées chez L'Armarium : aucun scan n'est
   * dupliqué sur THOT. Les annotations décrivent les notices documentaires.
   */
  const originals = [
  {
    "key": "recolte",
    "title": "Prescriptions concernant la récolte de 1917 pour la ville de Roubaix",
    "label": "Récolte et ravitaillement",
    "code": "AFF_001_D_0694",
    "url": "https://www.armarium-hautsdefrance.fr/document/85546",
    "author": "Hofmann (commandant), signataire",
    "languages": "Affiche bilingue français–allemand",
    "size": "69 × 78 cm",
    "footnote": "ref6",
    "lead": "La récolte devient une affaire administrative : consignation, prix, paiements et sanctions apparaissent dans la notice de cette affiche.",
    "notes": [
      {
        "title": "Un ordre sur la récolte",
        "fact": "La notice indique que toute la récolte de 1917 est consignée.",
        "comment": "La consignation montre un contrôle officiel de la production. Elle ne renseigne pas à elle seule sur les quantités réellement collectées."
      },
      {
        "title": "Des prix et des paiements fixés",
        "fact": "La notice signale une liste des prix et des modalités de paiement.",
        "comment": "L'affiche règle à la fois la circulation des produits et les conditions économiques des échanges."
      },
      {
        "title": "Des sanctions annoncées",
        "fact": "La notice mentionne jusqu'à un an de prison et 3 000 marks d'amende, voire les deux.",
        "comment": "Ce sont des peines prévues dans le texte, pas la preuve que de telles peines ont effectivement été prononcées."
      },
      {
        "title": "Un document bilingue",
        "fact": "La notice identifie une affiche en français et en allemand, signée par Hofmann.",
        "comment": "Les langues utilisées reflètent la coexistence d'une population francophone et d'une autorité militaire allemande."
      }
    ]
  },
  {
    "key": "travail",
    "title": "Ordonnance concernant le refus de travail",
    "label": "Travail sous contrainte",
    "code": "AFF_001_D_0695",
    "url": "https://www.armarium-hautsdefrance.fr/document/85547",
    "author": "Sixt von Arnim (signataire)",
    "languages": "Affiche bilingue français–allemand",
    "size": "63 × 86 cm",
    "footnote": "ref4",
    "lead": "Cette ordonnance rend visibles les contraintes qui encadrent le travail sous occupation. Elle complète les annonces de recrutement étudiées dans l'article.",
    "notes": [
      {
        "title": "Le refus de travail visé",
        "fact": "La notice énumère notamment le refus de commencer ou de poursuivre un travail demandé.",
        "comment": "Le texte élargit le contrôle administratif à l'exécution du travail ; il ne permet pas de mesurer tous les refus effectifs."
      },
      {
        "title": "Des peines de prison et des amendes",
        "fact": "La notice prévoit pour certains manquements jusqu'à trois ans de prison ou 10 000 marks d'amende.",
        "comment": "Les sanctions annoncées doivent être distinguées des condamnations réellement appliquées."
      },
      {
        "title": "Des faits commis collectivement",
        "fact": "La notice distingue les actes commis de façon concertée, assortis de sanctions plus graves.",
        "comment": "Le texte surveille aussi les formes collectives de contestation du travail."
      },
      {
        "title": "Des tribunaux militaires compétents",
        "fact": "La notice attribue une compétence aux tribunaux militaires et aux commandants.",
        "comment": "Cette disposition traduit le rôle de l'appareil militaire dans l'encadrement de la population occupée."
      }
    ]
  },
  {
    "key": "departs",
    "title": "Avis concernant la défense d'émigrer du territoire occupé par l'armée allemande",
    "label": "Contrôle des déplacements",
    "code": "AFF_001_D_0618",
    "url": "https://www.armarium-hautsdefrance.fr/document/85556",
    "author": "Von Denk (signataire)",
    "languages": "Affiche bilingue français–allemand",
    "size": "69 × 62 cm",
    "footnote": "ref7",
    "lead": "Une autre affiche de 1917 détaille les interdictions de sortie du territoire occupé, notamment vers les Pays-Bas, sans autorisation.",
    "notes": [
      {
        "title": "Les déplacements contrôlés",
        "fact": "La notice indique qu'il est interdit de quitter le territoire occupé sans autorisation.",
        "comment": "L'obligation d'obtenir une autorisation documente le contrôle des circulations ; elle ne détermine pas les raisons individuelles de chaque départ."
      },
      {
        "title": "Le cas de la frontière néerlandaise",
        "fact": "La notice évoque spécialement le passage vers la Hollande dans le but de rejoindre les forces adverses.",
        "comment": "Il s'agit d'une préoccupation stratégique formulée par l'autorité occupante."
      },
      {
        "title": "Des peines très lourdes",
        "fact": "La notice évoque des sanctions pouvant aller, selon les cas, jusqu'à cinq ans de prison ou à la peine de mort.",
        "comment": "Cette menace appartient au texte publié, sans prouver que chaque peine a été appliquée."
      },
      {
        "title": "Un autre document de 1917",
        "fact": "La notice identifie une affiche bilingue signée Von Denk, cote AFF_001_D_0618.",
        "comment": "Cette ordonnance ne doit pas être confondue avec l'avis du 19 décembre 1917 sur des départs programmés (AFF_001_D_0759)."
      }
    ]
  }
];
  const archiveButtons = [...root.querySelectorAll('[data-original-document]')];
  const originalNoteButtons = [...root.querySelectorAll('[data-original-point]')];
  const originalFrame = root.querySelector('#original-archive-frame');
  const originalPlaceholder = root.querySelector('#original-archive-placeholder');
  const originalEmbedButton = root.querySelector('#original-archive-embed');
  let originalActive = originals[0];
  function chooseOriginalNote(position) {
    const note=originalActive.notes[position];
    if (!note) return;
    originalNoteButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===position)));
    root.querySelector('#original-note-title').textContent=note.title;
    root.querySelector('#original-note-fact').textContent=note.fact;
    root.querySelector('#original-note-analysis').textContent=note.comment;
  }
  function chooseOriginal(key) {
    const doc=originals.find(item=>item.key===key);
    if (!doc) return;
    originalActive=doc;
    archiveButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.originalDocument===key)));
    root.querySelector('#original-document-title').textContent=doc.title;
    root.querySelector('#original-document-cote').textContent=doc.code;
    root.querySelector('#original-document-meta').textContent='1917 · '+doc.author+' · '+doc.languages+' · '+doc.size;
    root.querySelector('#original-document-intro').textContent=doc.lead;
    const link=root.querySelector('#original-document-link');
    link.href=doc.url;
    link.textContent='Consulter la numérisation officielle sur L’Armarium ↗';
    root.querySelector('#original-source-reference').href='#'+doc.footnote;
    // Changer de document efface la consultation précédente et demande
    // un nouveau clic avant toute requête à l'hébergeur tiers.
    originalFrame.removeAttribute('src');
    originalFrame.hidden=true;
    originalPlaceholder.hidden=false;
    originalEmbedButton.hidden=false;
    originalNoteButtons.forEach((button,i)=>button.textContent=String(i+1)+' · '+doc.notes[i].title);
    chooseOriginalNote(0);
  }
  archiveButtons.forEach(button=>button.addEventListener('click',()=>chooseOriginal(button.dataset.originalDocument)));
  originalNoteButtons.forEach(button=>button.addEventListener('click',()=>chooseOriginalNote(Number(button.dataset.originalPoint))));
  originalEmbedButton.addEventListener('click',()=>{
    originalFrame.src=originalActive.url;
    originalFrame.title='Consultation sur L’Armarium : '+originalActive.title;
    originalPlaceholder.hidden=true;
    originalFrame.hidden=false;
    originalEmbedButton.hidden=true;
  });
  chooseOriginal('recolte');

  const maps = {
    city: {
      src:'https://www.openstreetmap.org/export/embed.html?bbox=3.144%2C50.678%2C3.214%2C50.707&layer=mapnik',
      title:'Roubaix et ses environs, carte actuelle',
      summary:"Vue d'ensemble de Roubaix aujourd'hui. L'article étudie la ville sous occupation allemande en 1917."
    },
    street: {
      src:'https://www.openstreetmap.org/export/embed.html?bbox=3.158%2C50.687%2C3.176%2C50.697&layer=mapnik',
      title:'Quartier de la rue du Grand-Chemin, carte actuelle',
      summary:"La rue du Grand-Chemin existe toujours. L'emplacement exact de la salle de gymnastique citée pour juillet 1917 n'est pas établi : aucun marqueur ne prétend le localiser."
    }
  };
  const frame = root.querySelector('#roubaix-map-frame');
  const load = root.querySelector('#roubaix-map-load');
  const mapButtons = [...root.querySelectorAll('[data-map-view]')];
  let currentMap = 'street', loaded = false;
  function chooseMap(key) {
    if (!maps[key]) return;
    currentMap = key;
    mapButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mapView === key)));
    root.querySelector('#roubaix-map-explanation').textContent = maps[key].summary;
    if (loaded) {
      frame.title = maps[key].title;
      frame.src = maps[key].src;
    }
  }
  mapButtons.forEach(button => button.addEventListener('click', () => chooseMap(button.dataset.mapView)));
  load.addEventListener('click', () => {
    loaded = true;
    frame.hidden = false;
    frame.title = maps[currentMap].title;
    frame.src = maps[currentMap].src;
    load.hidden = true;
    root.querySelector('#roubaix-map-placeholder').hidden = true;
  });
  chooseMap('street');

  // Parcours de lecture : une seule étape visible, navigation souris/clavier.
  const stages=[
    {key:'chronologie',label:'Les repères historiques',next:'Explorer les archives →'},
    {key:'archives',label:'Trois documents originaux',next:'Voir la carte →'},
    {key:'carte',label:'Se repérer dans Roubaix',next:'Terminer le parcours ✓'}
  ];
  const stageTabs=[...root.querySelectorAll('[data-ir-tab]')];
  const stagePanels=[...root.querySelectorAll('[data-ir-panel]')];
  const previous=root.querySelector('#ir-prev');
  const following=root.querySelector('#ir-next');
  let stageIndex=0;
  function selectStage(key,moveFocus=false){
    const index=stages.findIndex(stage=>stage.key===key);
    if(index<0)return;
    stageIndex=index;
    stageTabs.forEach((tab,i)=>{
      tab.setAttribute('aria-selected',String(i===index));
      tab.setAttribute('tabindex',i===index?'0':'-1');
    });
    stagePanels.forEach(panel=>{panel.hidden=panel.dataset.irPanel!==key;});
    root.querySelector('#archive-supplement-roubaix').hidden=key!=='archives';
    root.querySelector('#ir-step-counter').textContent=(index+1)+' / '+stages.length;
    root.querySelector('#ir-step-hint').textContent=stages[index].label;
    previous.disabled=index===0;
    following.hidden=index===stages.length-1;
    if(index<stages.length-1)following.textContent=stages[index].next;
    if(moveFocus)stageTabs[index].focus();
  }
  stageTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectStage(stages[index].key));
    tab.addEventListener('keydown',event=>{
      let target;
      if(event.key==='ArrowRight')target=(index+1)%stages.length;
      else if(event.key==='ArrowLeft')target=(index+stages.length-1)%stages.length;
      else if(event.key==='Home')target=0;
      else if(event.key==='End')target=stages.length-1;
      if(target===undefined)return;
      event.preventDefault();
      selectStage(stages[target].key,true);
    });
  });
  previous.addEventListener('click',()=>selectStage(stages[Math.max(0,stageIndex-1)].key,true));
  following.addEventListener('click',()=>selectStage(stages[Math.min(stages.length-1,stageIndex+1)].key,true));
  function synchronizeAnchor(){
    const hash=decodeURIComponent(window.location.hash.slice(1));
    if(['archive-roubaix','archive-supplement-roubaix'].includes(hash)){
      selectStage('archives');
      root.querySelector('#archive-supplement-roubaix').open=true;
    }else if(['originaux-roubaix','originals-title'].includes(hash))selectStage('archives');
    else if(['carte-roubaix','ir-map-heading'].includes(hash))selectStage('carte');
    else if(['frise-roubaix','ir-timeline-heading'].includes(hash))selectStage('chronologie');
  }
  selectStage('chronologie');
  synchronizeAnchor();
  window.addEventListener('hashchange',synchronizeAnchor);

})();
