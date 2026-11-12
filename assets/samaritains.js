/* THOT · Pauses pédagogiques facultatives, adaptées de sophistes.js.
   État limité à la page : ni stockage, ni transmission des réponses. */
(() => {
  'use strict';

  const identity = [{
    question: "Dans la parabole du Bon Samaritain, que désigne à l'origine le mot « Samaritain » ?",
    answers: [
      'A. Un titre donné aux personnes généreuses.',
      'B. Un membre de la communauté religieuse samaritaine.',
      'C. Un prêtre chargé de secourir les blessés.'
    ],
    correct: 1,
    explanation: "Les Samaritains constituent une communauté ethnoreligieuse ancienne, partageant un héritage israélite avec le judaïsme. C'est la parabole du Bon Samaritain qui a contribué à associer leur nom à la générosité."
  }];
  const traditions = [
    {
      question: 'Le mont Garizim est le lieu sacré central de cette tradition.',
      correct: 1,
      explanation: 'Le mont Garizim est au cœur du culte samaritain. Dans le judaïsme antique, Jérusalem et son Temple constituaient le centre cultuel principal.'
    },
    {
      question: 'Moïse occupe une place fondamentale dans la tradition religieuse.',
      correct: 2,
      explanation: 'Les deux traditions reconnaissent Moïse comme une figure majeure et accordent une autorité religieuse aux cinq livres qui lui sont traditionnellement attribués.'
    },
    {
      question: 'Les Écritures reconnues comprennent la Torah, les Prophètes et les Écrits.',
      correct: 0,
      explanation: "Il s'agit du canon juif, appelé Tanakh. Les Samaritains reconnaissent uniquement le Pentateuque comme Écriture faisant autorité."
    },
    {
      question: 'Les cinq livres de Moïse sont considérés comme sacrés.',
      correct: 2,
      explanation: 'Ils sont fondamentaux pour les deux traditions, bien que leurs versions présentent certaines différences textuelles.'
    },
    {
      question: "Le Décalogue contient une prescription concernant la construction d'un autel sur le mont Garizim.",
      correct: 1,
      explanation: "Cette prescription caractérise le Décalogue samaritain, dont l'organisation diffère de celle des Dix Commandements dans la tradition juive."
    }
  ].map(item => ({ ...item, answers: ['Judaïsme', 'Samaritanisme', 'Les deux traditions'] }));

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function focus(node) {
    node.tabIndex = -1;
    node.focus();
  }

  document.querySelectorAll('[data-samaritains-game]').forEach(root => {
    const scored = root.dataset.samaritainsGame === 'traditions';
    if (!scored && root.dataset.samaritainsGame !== 'identity') return;
    const stage = root.querySelector('[data-samaritains-stage]');
    if (!root.id || !stage || root.dataset.samaritainsReady) return;
    const questions = scored ? traditions : identity;
    let index = 0;
    let responses = [];

    function restart() {
      index = 0;
      responses = [];
      render(true);
    }

    function finish() {
      stage.replaceChildren();
      const score = responses.filter((choice, i) => choice === questions[i].correct).length;
      const title = element('h3', 'Défi terminé !');
      stage.append(title, element('p', `${score} / 5`, 'samaritains-score'), element('p', score === 5
        ? 'Tu as identifié toutes les réponses attendues !'
        : 'Voici les explications pour mieux comprendre les deux traditions.'));
      const recap = element('ol', null, 'samaritains-recap');
      questions.forEach((item, i) => {
        const row = element('li');
        row.append(element('h4', item.question),
          element('p', `Votre réponse : ${item.answers[responses[i]]}.`),
          element('p', `Bonne réponse : ${item.answers[item.correct]}.`),
          element('p', item.explanation));
        recap.append(row);
      });
      const replay = element('button', 'Rejouer', 'sophistes-action');
      replay.type = 'button';
      replay.addEventListener('click', restart, { once: true });
      stage.append(recap, replay);
      focus(title);
    }

    function render(moveFocus = false) {
      stage.replaceChildren();
      const item = questions[index];
      let title;
      if (scored) {
        title = element('h3', `Question ${index + 1} / 5`);
        title.id = `${root.id}-progress`;
        const progress = element('progress');
        progress.max = questions.length;
        progress.value = index + 1;
        progress.setAttribute('aria-labelledby', title.id);
        stage.append(title, progress);
      }
      const form = element('form');
      const fieldset = element('fieldset');
      const legend = element('legend', item.question);
      fieldset.append(legend);
      const radios = item.answers.map((answer, choice) => {
        const label = element('label', null, 'sophistes-choice');
        const radio = element('input');
        radio.type = 'radio';
        radio.name = `${root.id}-answer`;
        radio.value = String(choice);
        label.append(radio, element('span', answer));
        fieldset.append(label);
        return radio;
      });
      const validate = element('button', scored ? 'Valider' : 'Vérifier ma réponse', 'sophistes-action');
      validate.type = 'submit';
      validate.disabled = true;
      radios.forEach(radio => radio.addEventListener('change', () => { validate.disabled = false; }));
      form.append(fieldset, validate);
      stage.append(form);
      let answered = false;
      form.addEventListener('submit', event => {
        event.preventDefault();
        const choice = radios.findIndex(radio => radio.checked);
        if (answered || choice === -1) return;
        answered = true;
        responses.push(choice);
        fieldset.disabled = true;
        validate.disabled = true;
        validate.hidden = true;

        const feedback = element('div', null, 'sophistes-feedback');
        const feedbackTitle = element('h4', choice === item.correct
          ? 'Bonne réponse !'
          : scored ? `La bonne réponse est : ${item.answers[item.correct]}.` : 'La bonne réponse est B.');
        feedbackTitle.id = `${root.id}-feedback-title`;
        const explanation = element('p', item.explanation);
        explanation.id = `${root.id}-explanation`;
        // Un déplacement de focus annonce la correction et son explication.
        // Pas de région live supplémentaire qui répéterait la même annonce.
        feedback.setAttribute('role', 'region');
        feedback.setAttribute('aria-labelledby', feedbackTitle.id);
        feedback.setAttribute('aria-describedby', explanation.id);
        feedback.append(feedbackTitle);
        if (scored && choice === item.correct) feedback.append(element('p', `Bonne réponse : ${item.answers[item.correct]}.`));
        feedback.append(explanation);

        const next = element('button', scored
          ? (index === questions.length - 1 ? 'Voir mon résultat' : 'Question suivante')
          : 'Recommencer', 'sophistes-action');
        next.type = 'button';
        next.addEventListener('click', () => {
          next.disabled = true;
          if (!scored) return restart();
          index += 1;
          if (index === questions.length) finish();
          else render(true);
        }, { once: true });
        stage.append(feedback, next);
        focus(feedback);
      });
      if (moveFocus) focus(title || legend);
    }

    render();
    root.dataset.samaritainsReady = 'true';
    stage.hidden = false;
    const fallback = root.querySelector('[data-samaritains-fallback]');
    if (fallback) fallback.hidden = true;
  });
})();
