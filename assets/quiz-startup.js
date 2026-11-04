/* Préserver la position de lecture pendant le chargement du quiz.
   Sans JavaScript, le message HTML et ses liens restent visibles. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.setAttribute('data-quiz-loading', '');
  // Un téléchargement bloqué doit conserver un accès au rechargement/articles.
  const timeout = setTimeout(() => root.removeAttribute('data-quiz-loading'), 10000);
  document.addEventListener('DOMContentLoaded', () => {
    clearTimeout(timeout);
    root.removeAttribute('data-quiz-loading');
  }, { once: true });
})();
