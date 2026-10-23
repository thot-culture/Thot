# COMPTE RENDU POUR CHATGPT — THOT

Page examinée : **Autrices et pseudonymes**, `articles/autrices-pseudonymes.html`.
Audit du 23 octobre 2026, branche `work/audit-final-site`, base `066d580`.
Aucune publication sur le site public.

## Bugs identifiés et corrigés

- Le jeu intégré supprimait la sélection après une erreur tout en invitant à
  réessayer. Il utilise maintenant le moteur corrigé de la page dédiée : sélection
  conservée, temporisations annulées au reset et état rouge nettoyé dès la réussite.
- Les onze commandes du jeu et les deux choix de la pause pédagogique étaient
  actifs sans JavaScript. Leur activation suit désormais leur initialisation.
- Un message technique avec liens de rechargement et de page dédiée reste visible
  si le jeu ne démarre pas. Son lien de rechargement ne se limite pas à une ancre.

## Améliorations et contenu préservé

Le moteur est partagé avec `quiz-autrices.html`, chargé avec `defer`, et gère le
focus après réussite et réinitialisation. La variante exacte de l’article est
conservée via `data-explanation` : « George Eliot est le pseudonyme de Mary Anne
(« Marian ») Evans. » Les cinq associations, la pause, les réponses, les sources
et les développements historiques sont inchangés.

Les portraits de George Sand utilisent la copie locale `autrices-nadar.webp`,
déjà identifiée dans `GUIDE-IMAGES.md` comme le même document de Nadar. Dimensions
explicites 1176 × 900, hauteur CSS automatique ; légende, crédit et notice
Wikimedia conservés. Le fichier pèse 165 322 octets. Les deux autres portraits
restent externes. Le style commun améliore l’évitement et le pied de page.

## Fichiers modifiés

- `articles/autrices-pseudonymes.html`
- `assets/autrices-visuels.css`
- `assets/quiz-autrices.js` : nouveau moteur commun au jeu dédié.
- `assets/autrices-quiz.css`, `assets/article.css` : styles partagés.
- Ajouts : `scripts/test-quiz-autrices.mjs`,
  `scripts/test-article-activities.mjs` et présent rapport.

## Tests et résultats

- `node scripts/test-quiz-autrices.mjs` : réussite sur les deux vrais HTML,
  cinq associations, explication Eliot propre à chaque page, erreur puis nouvel
  essai, minuteurs, reset, focus et préférence de réduction des animations.
- `node scripts/test-article-activities.mjs` : deux réponses de la pause,
  sélection exclusive, explications exactes et lien `#ref1` conservé.
- Contrôle global, conservation éditoriale et espaces Git : réussite.
  Le corps de page conserve 2 546 mots et 65 liens éditoriaux, hors nouveau
  message technique. Alt, JSON-LD et références conservés ; SEO structurel valide.

## Limites, conséquences et recommandations

Tests en DOM simulé ; rendu réel mobile/ordinateur, tactile, lecteur d’écran,
chargement HTTP des portraits externes et performances réelles non vérifiés.
Les deux portraits externes n’ont toujours pas de dimensions HTML explicites :
les relever sur les fichiers originaux lors d’une vérification réseau.

Le moteur et le bouton de reset affectent aussi le jeu dédié ; ses tests passent.
La règle des portraits ne concerne que cet article. Les autres effets partagés
sont décrits dans [BILAN-FINAL.md](BILAN-FINAL.md).

Consulter `/articles/autrices-pseudonymes.html` sur le serveur local.
État du code : **Vérifiée et corrigée** ; validation visuelle réelle en attente.

## Mise à jour supplémentaire

Une passe de recherche, navigation mobile et clavier complète cette version.
Les changements propres à cette page, les fichiers et les tests sont détaillés
dans [AMELIORATIONS-NAVIGATION-LECTURE.md](AMELIORATIONS-NAVIGATION-LECTURE.md).
La livraison courante est `THOT-site-ameliore.zip` ; aucune publication effectuée.
