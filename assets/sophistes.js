/* THOT · Deux pauses facultatives. Aucun stockage, aucune requête réseau. */
(() => {
  'use strict';

  const gorgias = [
    {
      title: 'Une réforme efficace ?',
      question: 'Qui tire une conclusion trop rapide ?',
      answers: [
        '« Depuis l’adoption de cette mesure, les accidents ont diminué. C’est donc forcément grâce à elle. »',
        '« Les accidents ont diminué. Vérifions si cette mesure en est réellement la cause. »'
      ],
      correct: 0,
      explanation: 'Deux événements peuvent se succéder sans que l’un soit nécessairement la cause de l’autre. Le discours A confond corrélation et causalité.'
    },
    {
      title: 'Des chiffres inquiétants',
      context: 'Une cité passe de deux à quatre incidents annuels.',
      question: 'Quel discours cherche davantage à provoquer une réaction émotionnelle ?',
      answers: [
        '« Les incidents ont doublé. Examinons cette évolution et ses causes. »',
        '« Les incidents ont explosé de 100 % ! Notre cité devient dangereuse ! »'
      ],
      correct: 1,
      explanation: 'Les chiffres sont identiques, mais le second discours utilise un cadrage alarmant et avance une conclusion qui nécessite davantage de preuves.'
    },
    {
      title: 'Un expert a parlé',
      question: 'Quel discours utilise abusivement l’argument d’autorité ?',
      answers: [
        '« Un spécialiste soutient cette mesure. Étudions ses arguments. »',
        '« Un spécialiste soutient cette mesure. Il est donc inutile d’en débattre davantage. »'
      ],
      correct: 1,
      explanation: 'L’expertise mérite d’être prise en compte, mais elle ne remplace pas l’examen des arguments et des preuves.'
    }
  ];

  const dilemmas = [
    {
      title: 'Deux perceptions',
      context: 'Deux personnes assistent au même concert. L’une trouve la musique trop forte, tandis que l’autre estime le volume agréable.',
      question: 'Quelle démarche privilégieriez-vous ?',
      answers: [
        'Écouter les deux personnes pour comprendre leurs ressentis.',
        'Mesurer le volume sonore pour obtenir un repère objectif.',
        'Chercher un compromis acceptable pour les deux.'
      ],
      explanations: [
        'Vous privilégiez l’expérience individuelle. C’est important pour comprendre ce que ressent chaque personne.\n\nMais deux expériences sincères ne permettent pas nécessairement d’établir tous les faits.',
        'Vous privilégiez la mesure objective.\n\nUne mesure fournit des informations vérifiables, mais elle ne permet pas à elle seule de déterminer le confort de chaque personne.',
        'Vous privilégiez une solution pratique.\n\nLe compromis peut résoudre un désaccord, mais trouver une solution acceptable ne revient pas nécessairement à établir une vérité objective.'
      ],
      perspective: 'Ce dilemme rejoint la réflexion sur Protagoras : il faut distinguer les perceptions individuelles, les faits mesurables et les décisions que nous prenons collectivement.'
    },
    {
      title: 'Une loi contestée',
      context: 'Une cité vote démocratiquement une loi limitant l’accès à un jardin public. Certains habitants sont particulièrement désavantagés par cette décision.',
      question: 'Quel critère privilégieriez-vous pour juger cette loi ?',
      answers: [
        'Le respect de la procédure démocratique.',
        'L’égalité de traitement entre les habitants.',
        'Les raisons de la mesure et ses conséquences concrètes.'
      ],
      explanations: [
        'Vous privilégiez la légalité et la procédure démocratique.\n\nCes éléments contribuent à la légitimité d’une décision. Mais une loi adoptée régulièrement peut toujours être contestée sur le plan moral.',
        'Vous accordez une importance particulière aux effets de la loi sur les personnes.\n\nCependant, toute différence de traitement ne signifie pas nécessairement qu’une mesure est injustifiée.',
        'Vous préférez examiner les circonstances avant de juger.\n\nCette démarche permet d’évaluer les justifications de la loi, mais ses conséquences ne constituent pas le seul critère possible de justice.'
      ],
      perspective: 'Ce dilemme rejoint la distinction entre nomos et physis. Une règle peut être légalement établie sans que sa justification morale soit définitivement réglée.'
    },
    {
      title: 'Une décision politique',
      context: 'Des dirigeants réduisent leurs propres contributions financières tout en augmentant celles des autres habitants.',
      question: 'Quelle question examineriez-vous en premier ?',
      answers: [
        'La décision a-t-elle été adoptée selon les règles ?',
        'Sert-elle principalement les intérêts de ceux qui gouvernent ?',
        'Quelles sont ses conséquences pour l’ensemble de la cité ?'
      ],
      explanations: [
        'Vous examinez d’abord la légalité de la décision.\n\nC’est un élément important, mais une décision parfaitement légale n’est pas nécessairement juste.',
        'Vous examinez les rapports entre le pouvoir et les intérêts particuliers.\n\nC’est la question qui rejoint le plus directement la thèse que Platon attribue à Thrasymaque.',
        'Vous examinez les conséquences concrètes de la décision.\n\nCette démarche est pertinente, même si certaines questions de justice dépassent les seuls résultats pratiques.'
      ],
      perspective: 'Une décision politique peut être examinée sous plusieurs angles : sa légalité, les intérêts qu’elle sert et les conséquences qu’elle produit.'
    }
  ];

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  document.querySelectorAll('[data-sophistes-game]').forEach(root => {
    const scored = root.dataset.sophistesGame === 'gorgias';
    if (!scored && root.dataset.sophistesGame !== 'dilemmes') return;
    const stage = root.querySelector('[data-sophistes-stage]');
    const fallback = root.querySelector('[data-sophistes-fallback]');
    if (!root.id || !stage || root.dataset.sophistesReady) return;
    const questions = scored ? gorgias : dilemmas;
    let index = 0;
    let score = 0;

    function focus(node) {
      node.tabIndex = -1;
      node.focus();
    }

    function finish() {
      stage.replaceChildren();
      const title = element('h3', scored ? `Votre résultat : ${score}/3` : 'Prendre le temps de philosopher');
      const text = scored
        ? (score < 2
          ? 'Les techniques de persuasion ne sont pas toujours faciles à repérer. Avant d’accepter une affirmation, demandez-vous quelles preuves permettent de la soutenir.'
          : score === 2
            ? 'Vous savez déjà identifier plusieurs procédés de persuasion. Continuez à distinguer les faits, leurs interprétations et les émotions suscitées par un discours.'
            : 'Vous avez reconnu les trois procédés ! Mais même lorsqu’on connaît ces techniques, il reste important d’examiner les arguments avec attention.')
        : 'Philosopher ne consiste pas toujours à trouver immédiatement la bonne réponse.\n\nC’est aussi apprendre à distinguer les questions, les arguments et les critères qui permettent de juger une situation.';
      const restart = element('button', 'Recommencer', 'sophistes-action');
      restart.type = 'button';
      restart.addEventListener('click', () => {
        index = 0;
        score = 0;
        render(true);
      });
      stage.append(title, ...text.split('\n\n').map(paragraph => element('p', paragraph)));
      if (!scored) stage.append(element('p', 'Trois dilemmes, trois occasions de réfléchir autrement.'));
      stage.append(restart);
      focus(title);
    }

    function render(moveFocus = false) {
      stage.replaceChildren();
      const item = questions[index];
      const title = element('h3', `${scored ? 'Défi' : 'Dilemme'} ${index + 1}/3 — ${item.title}`);
      stage.append(title);
      if (item.context) stage.append(element('p', item.context));
      const form = element('form');
      const fieldset = element('fieldset');
      fieldset.append(element('legend', item.question));
      const radios = item.answers.map((answer, answerIndex) => {
        const label = element('label', null, 'sophistes-choice');
        const radio = element('input');
        radio.type = 'radio';
        radio.name = `${root.id}-answer`;
        radio.value = String(answerIndex);
        const letter = String.fromCharCode(65 + answerIndex);
        label.append(radio, element('span', `${letter}. ${answer}`));
        fieldset.append(label);
        return radio;
      });
      const validate = element('button', 'Valider ma réponse', 'sophistes-action');
      validate.type = 'submit';
      validate.disabled = true;
      form.append(fieldset);
      if (scored) form.append(validate);
      stage.append(form);
      let answered = false;

      function reveal(choice) {
        if (answered) return;
        answered = true;
        fieldset.disabled = true;
        validate.hidden = true;
        const feedback = element('div', null, 'sophistes-feedback');
        const feedbackTitle = element('h4', scored
          ? (choice === item.correct ? 'Bonne réponse.' : `La bonne réponse est ${String.fromCharCode(65 + item.correct)}.`)
          : `Votre choix : ${String.fromCharCode(65 + choice)}`);
        feedbackTitle.id = `${root.id}-feedback-title`;
        feedback.setAttribute('role', 'region');
        feedback.setAttribute('aria-labelledby', feedbackTitle.id);
        feedback.append(feedbackTitle, ...(scored ? item.explanation : item.explanations[choice]).split('\n\n').map(paragraph => element('p', paragraph)));
        if (scored && choice === item.correct) score += 1;
        if (!scored) {
          feedback.append(element('h4', 'Mise en perspective'), element('p', item.perspective));
        }
        const next = element('button', scored
          ? (index === 2 ? 'Voir mon résultat' : 'Question suivante')
          : 'Continuer', 'sophistes-action');
        next.type = 'button';
        next.addEventListener('click', () => {
          index += 1;
          if (index === questions.length) finish();
          else render(true);
        }, { once: true });
        stage.append(feedback, next);
        focus(feedback);
      }

      radios.forEach((radio, choice) => radio.addEventListener('change', () => {
        if (scored) validate.disabled = false;
        else reveal(choice);
      }));
      form.addEventListener('submit', event => {
        event.preventDefault();
        const choice = radios.findIndex(radio => radio.checked);
        if (choice !== -1) reveal(choice);
      });
      if (moveFocus) focus(title);
    }

    render();
    root.dataset.sophistesReady = 'true';
    stage.hidden = false;
    if (fallback) fallback.hidden = true;
  });
})();
