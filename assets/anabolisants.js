/* Deux activités facultatives. Chaque instance conserve son état dans la page. */
(() => {
  'use strict';
  document.querySelectorAll('.lecture-jeu[data-jeu]').forEach(game => {
    const forms = Array.from(game.querySelectorAll('form[data-etape]'));
    const end = game.querySelector('[data-fin]');
    const scored = game.dataset.jeu === 'mythes';
    let score = 0;

    function start(moveFocus) {
      score = 0;
      forms.forEach((form, index) => {
        form.reset();
        form.hidden = index !== 0;
        form.querySelector('fieldset').disabled = false;
        const submit = form.querySelector('[type="submit"]');
        submit.hidden = false;
        submit.disabled = true;
        form.querySelector('[data-correction]').hidden = true;
        form.querySelector('[data-suivant]').hidden = true;
      });
      end.hidden = true;
      if (moveFocus) forms[0].querySelector('h4').focus();
    }

    forms.forEach((form, index) => {
      const fieldset = form.querySelector('fieldset');
      const submit = form.querySelector('[type="submit"]');
      const feedback = form.querySelector('[data-correction]');
      const next = form.querySelector('[data-suivant]');
      form.addEventListener('change', () => { submit.disabled = false; });
      form.addEventListener('submit', event => {
        event.preventDefault();
        const choice = form.querySelector(':checked');
        if (!choice || fieldset.disabled) return;
        if (scored && choice.value === form.dataset.correct) score++;
        fieldset.disabled = true;
        submit.hidden = true;
        feedback.hidden = false;
        next.hidden = false;
        feedback.focus();
      });
      next.addEventListener('click', () => {
        form.hidden = true;
        const following = forms[index + 1] || end;
        following.hidden = false;
        const heading = following.querySelector('h4');
        if (following === end && scored) heading.textContent = `Votre score : ${score}/${forms.length}`;
        heading.focus();
      });
    });
    end.querySelector('[data-recommencer]').addEventListener('click', () => start(true));
    start(false);
    game.querySelector('[data-etapes]').hidden = false;
  });
})();
