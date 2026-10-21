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
})();
