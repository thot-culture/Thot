# Ajouter une enquête THOT

Le contenu est séparé du comportement. Les pages statiques ne nécessitent aucun service d’évaluation, compte, stockage ou dépendance externe.

## Fichiers

- `assets/enquetes/dossiers.json` : catalogue éditorial, pièces, indices, appuis et explications.
- `scripts/build-enquetes.py` : génération des quatre pages actuelles ; contrôle de cohérence de leur contenu.
- `assets/enquetes/enquetes.js` : carnet, conclusion, réponse aux preuves retenues, révision, remise à zéro et manipulations.
- `assets/enquetes/enquetes.css` : présentation isolée de la rubrique.
- `enquetes/index.html`, `lumo.html`, `hausse.html`, `image.html` : sorties générées, pièces et dénouement lisibles sans JavaScript.
- `docs/ENQUETES-PHOTO-SOURCE.json` : provenance et empreinte de l’image actuelle.

## Contrat éditorial d’un dossier

Créer une entrée avec un `slug` unique, `title`, `kind`, `tag`, `notice`, `claim`, `intro`, `pieces`, `hints`, `expected`, `required`, `supports`, `answer`, `limits`, `next` et `reflex`.

Chaque pièce possède un identifiant unique `id`, une question ou un titre `title`, le contenu documentaire `body`, une observation à retenir `proof` et une explication de sa portée `feedback`. Les pièces sont consultables indépendamment. Les cocher ne prouve pas qu’on les a comprises.

`expected` désigne la conclusion proportionnée dans ce dossier : `etayee`, `limitee`, `contredite` ou `insuffisante`. Ce champ concerne une affirmation, jamais la qualité ou le profil de la personne.

`supports` est une liste de combinaisons d’appuis suffisants pour la conclusion visée : `[["reponses", "recrutement"]]` demande ces deux éléments ensemble ; `[["taux"], ["valeurs"]]` accepte l’un ou l’autre comme point de départ numérique. Ce sont des repères pédagogiques, pas une mesure automatique de la compréhension. Une phrase libre sert à rendre le raisonnement explicite ; elle n’est ni analysée par un service distant ni notée.

`required` énumère les pièces utiles à suggérer lorsque le carnet ne contient pas d’appui suffisant. L’explication peut aussi conseiller une autre dimension : dans le graphique, une observation sur les données et une sur la présentation. Le dénouement distingue un carnet vide ou insuffisant d’un dossier qui, lui, permet de conclure.

`answer` explique ce qui est établi ; `limits`, ce qui ne l’est pas ; `next`, ce qu’il faudrait vérifier ensuite. Les retours mentionnent chaque pièce retenue et sa portée. Les autres conclusions reçoivent une explication adaptée, sans points ni jugement personnel. Les indices n’ont aucun coût.

## Types de manipulation

Les types actuels sont `survey` (questions/pièces), `chart` (échelle réglable et référence fixe) et `photo` (fenêtre réversible et contexte). Le générateur refuse un type inconnu.

Une enquête de type `survey` peut être ajoutée avec ses contenus sans changer le moteur. Les widgets `chart` et `photo` de ce premier lot sont volontairement propres aux données 8 → 10 € et au document Apollo 8 : **ne pas réutiliser leur rendu inchangé pour une autre série ou photographie**. Ajouter alors les paramètres/documentations nécessaires ou un nouveau rendu explicite dans `visual()` et dans le module, avec des tests adaptés. Il ne faut pas produire automatiquement une interaction parce qu’un champ porte un nom de type.

Toute nouvelle photographie demande une source et des droits effectivement vérifiés, un fichier complet intact, un crédit proche et une notice de traçabilité distincte. Ne pas remplacer l’original existant. Distinguer légende pédagogique inventée, contexte documenté et interprétation. Aucune représentation de données inventées comme données authentiques.

## Génération et tests

```bash
python3 scripts/build-enquetes.py
python3 scripts/build-enquetes.py --check
python3 scripts/test-enquetes.py
python3 scripts/test-enquetes.py --browser
node scripts/check-site.mjs
python3 scripts/check-editorial.py
python3 scripts/preview.py
```

Consulter `http://127.0.0.1:8765/Thot/enquetes/`. Les tests navigateur utilisent actuellement des fixtures Chromium locales car la navigation réseau est limitée dans l’environnement ; ils ne sont pas des tests du site public. Playwright/Chromium sont des outils de développement, aucune bibliothèque n’est chargée par le site.

Ajouter la nouvelle page au sitemap. Ajouter ses assertions au test : calculs, source, conclusions proportionnées et excessives, appuis alternatifs, carnet incomplet, révision, indices, clavier, absence de débordement aux quatre largeurs et repli sans JavaScript. Pour un nouveau média, tester son échec de chargement. Relancer les tests de non-régression du dépôt et inspecter de vraies captures.

Les commandes sont masquées dans le HTML initial et révélées après initialisation réussie. Le texte et l’explication de repli restent accessibles si JavaScript manque. Aucun `localStorage` ni `sessionStorage` n’est utilisé ; le quiz garde ses données et ses règles.

La construction et les tests ne publient rien. Toute publication de ce nouveau chantier nécessite une autorisation explicite distincte.
