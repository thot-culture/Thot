/* THOT — Frise autonome de Roubaix. Réutilise les huit événements sourcés de la première version. */
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

  const buttons = [...root.querySelectorAll('[data-date-index]')];
  const date = root.querySelector('#timeline-date');
  const title = root.querySelector('#timeline-title');
  const description = root.querySelector('#timeline-description');
  const nuance = root.querySelector('#timeline-limitation');
  const source = root.querySelector('#timeline-reference');
  if (buttons.length !== events.length || !date || !title || !description || !nuance || !source) return;

  function chooseEvent(index, focus = false) {
    const item = events[index];
    if (!item) return;
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-pressed', String(selected));
    });
    date.textContent = item.date;
    title.textContent = item.title;
    description.textContent = item.body;
    nuance.textContent = item.nuance;
    source.href = '#' + item.ref;
    source.textContent = 'Retrouver la source [' + item.ref.slice(3) + ']';
    if (focus) buttons[index].focus();
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => chooseEvent(index));
    button.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      chooseEvent(next, true);
    });
  });
  chooseEvent(0);
  buttons.forEach(button => { button.disabled = false; });
})();
