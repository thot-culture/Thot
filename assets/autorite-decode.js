/* THOT — Décode le pouvoir : trois scènes fictives, aucun score ni profil. */
(() => {
  'use strict';
  const game = document.getElementById('decode-pouvoir');
  if (!game) return;

  const feedbacks = {
    parents: {
      expertise: 'Bien vu : le savoir-faire tient le guidon ! Alex cite une compétence reconnue, donc l’expertise. La confiance et le lien familial peuvent compter aussi.',
      statut: 'La casquette de parent peut compter, mais Alex cite surtout « son savoir-faire » : c’est l’expertise. Dans la vie, ces facteurs peuvent se combiner.',
      legitimite: 'Une règle jugée justifiée peut convaincre, mais Alex parle ici de compétence : l’expertise tient le guidon. D’autres raisons peuvent aussi jouer.',
      sanction: 'Pas de punition annoncée dans cette scène : Alex cite le savoir-faire, donc l’expertise. On repère cet indice, sans deviner toutes ses motivations.'
    },
    etat: {
      expertise: 'Le savoir-faire pourrait compter, mais Sam insiste sur une règle qui lui paraît justifiée et équitable : sa légitimité à ses yeux. Les motifs peuvent se mêler.',
      statut: 'Le titre entre en scène, mais Sam parle surtout des raisons qui rendent la règle acceptable à ses yeux : sa légitimité. Le statut peut aussi peser.',
      legitimite: 'Bien vu : la règle gagne un « ça me paraît justifié » ! Sam lui reconnaît une légitimité. Cela ne la rend pas irréprochable, et d’autres réactions sont possibles.',
      sanction: 'L’alarme de la sanction reste hors champ ! Sam dit surtout trouver la règle justifiée : c’est sa légitimité à ses yeux. D’autres motifs restent possibles.'
    },
    direction: {
      expertise: 'La compétence peut compter, mais Lou parle de la retenue à éviter : ici, la sanction vole la vedette. Cet indice ne résume pas sa personnalité.',
      statut: 'La fonction de direction peut peser, mais Lou cite surtout la retenue à éviter : la crainte d’une sanction. D’autres facteurs peuvent agir en même temps.',
      legitimite: 'Lou ne dit pas si la règle lui paraît juste : la retenue à éviter est l’indice explicite. La sanction vole ici la vedette, sans juger Lou ni la règle.',
      sanction: 'Bien vu : la retenue a volé la vedette ! Lou cite la conséquence qu’elle veut éviter. On repère ce motif, sans juger la personne ni exclure d’autres raisons.'
    }
  };

  const cases = [...game.querySelectorAll('[data-decode-case]')];
  const progress = game.querySelector('#decode-progress');
  const feedback = game.querySelector('#decode-feedback');
  const next = game.querySelector('#decode-next');
  const reset = game.querySelector('#decode-reset');
  const controls = game.querySelector('#decode-controls');
  const fallback = game.querySelector('#decode-fallback');
  const keys = ['expertise', 'statut', 'legitimite', 'sanction'];
  const records = cases.map(element => ({
    element,
    key: element.dataset.decodeCase,
    title: element.querySelector('h3'),
    buttons: [...element.querySelectorAll('[data-decode-option]')]
  }));
  // Garder les pistes natives accessibles si la structure est incomplète.
  if (!progress || !feedback || !next || !reset || !controls || !fallback ||
      records.length !== 3 || new Set(records.map(record => record.key)).size !== 3 ||
      records.some(record => !Object.hasOwn(feedbacks, record.key) || !record.title ||
        record.buttons.length !== keys.length ||
        keys.some(key => record.buttons.filter(button => button.dataset.decodeOption === key).length !== 1))) return;

  let current = 0;
  const answers = new Array(records.length).fill(null);

  function showCase(focus = false) {
    records.forEach((record, index) => { record.element.hidden = index !== current; });
    progress.textContent = 'Situation ' + (current + 1) + ' sur ' + records.length + '.';
    feedback.textContent = '';
    next.hidden = current === records.length - 1;
    next.disabled = answers[current] === null;
    if (focus) records[current].title.focus();
  }

  records.forEach((record, index) => {
    record.buttons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.disabled || current !== index) return;
        const choice = button.dataset.decodeOption;
        answers[index] = choice;
        record.buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
        let message = feedbacks[record.key][choice];
        next.disabled = false;
        if (current === records.length - 1) {
          progress.textContent = 'Situation 3 sur 3 · Les trois situations sont explorées. Tu peux poursuivre l’article.';
          message += ' Les trois situations sont explorées. Tu peux poursuivre l’article ou recommencer.';
        }
        feedback.textContent = message;
      });
    });
  });
  next.addEventListener('click', () => {
    if (answers[current] === null || current >= records.length - 1) return;
    current++;
    showCase(true);
  });
  reset.addEventListener('click', () => {
    answers.fill(null);
    records.forEach(record => record.buttons.forEach(button => button.setAttribute('aria-pressed', 'false')));
    current = 0;
    showCase(true);
    feedback.textContent = 'Le jeu recommence : repère l’indice mis en avant dans la première scène.';
  });

  showCase();
  records.forEach(record => record.buttons.forEach(button => { button.disabled = false; }));
  reset.disabled = false;
  fallback.hidden = true;
  controls.hidden = false;
})();
