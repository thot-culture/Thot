# Article sur les sophistes

Socle : `thot-culture/Thot`, `main`, `b3e7b50c060c993e440416850e442bb520400b1d`.

## Contenu et intégration

L’article reprend le texte et les quinze références fournis par l’utilisateur le 8 novembre 2026. `scripts/test-sophistes.py` vérifie une empreinte du titre, du chapeau et des huit sections narratives pour détecter toute réécriture involontaire. Les explications des jeux reprennent le second envoi complet de l’utilisateur, qui précise qu’elles doivent rester dynamiques.

Les modules `assets/sophistes.js` et `assets/sophistes.css` utilisent le JavaScript natif et les variables de `assets/article.css`. Le premier suit Gorgias ; le second suit Thrasymaque. Ils sont facultatifs, indépendants et sans stockage ni requête réseau. Le premier utilise des boutons radio, puis une validation explicite ; le second affiche directement une explication après sélection, avec avertissement préalable du déplacement de focus. Les retours, titres des étapes et résultats reçoivent le focus clavier. Les liens « Passer le jeu » conduisent aux titres suivants, focalisables, sans rechargement. Sans JavaScript, l’article et les sources restent disponibles.

Réutilisés : coque commune de `site_chrome.py`, feuilles `article.css`, `article-editorial.css` et `visual-system.css`, partage `article-share.js`, registre éditorial, synchroniseur bibliothèque/sitemap, calculateur de durée et générateur typographique de cartes sociales. Aucun framework ni paquet applicatif ajouté. Les activités des articles sur l’autorité, les autrices, les pieuvres et les stratégies militaires ont servi de références.

La catégorie de filtre est `sciences-humaines`, catégorie existante ; le libellé et les mots-clés précisent Antiquité/Philosophie. La notice conserve la description proposée et le titre exact ; le titre SEO et celui de la carte sociale sont plus courts. La carte 1200 × 630 est une composition originale THOT, sans document antique ni portrait inventé ; le générateur et les licences de polices sont déjà dans le dépôt.

Les quatre ressources scientifiques complémentaires ont été ouvertes pour vérifier leurs destinations : [SEP — Protagoras](https://plato.stanford.edu/entries/protagoras/), [The Sophists](https://plato.stanford.edu/entries/sophists/), [Callicles and Thrasymachus](https://plato.stanford.edu/entries/callicles-thrasymachus/) et [IEP — The Sophists](https://iep.utm.edu/sophists/).

Aucune correction historique n’a été apportée au texte fourni. Les références imprimées sont conservées ; la vérification des liens complémentaires n’équivaut pas à une consultation intégrale des éditions citées.

## Durée de lecture

**1 392 mots, 7 minutes**, à 210 mots/minute, arrondi au supérieur. Sont compris le chapeau et les titres des sections ; le H1, les deux jeux, leurs corrections, la bibliographie, les appels de note et les liens de navigation sont exclus.

Le calculateur existant accepte deux attributs facultatifs : `data-reading-include` inclut le chapeau situé hors du conteneur article ; `data-reading-exclude` exclut les appels de note et le lien de retour. Les pages antérieures n’utilisent pas ces attributs et conservent leurs comptes. La classe existante `sm-module` exclut intégralement les deux jeux. Le test injecte mille mots dans les jeux et la bibliographie pour vérifier cette exclusion.

## Vérifications

```sh
node scripts/validate.mjs --python CHEMIN_PYTHON
python scripts/check-conservation.py --revision b3e7b50c060c993e440416850e442bb520400b1d
node scripts/test-sophistes-browser.cjs
git diff --check
```

Comme les recettes existantes, `production_checks.py` vérifie l’intégrité de la copie contre son commit courant : le lancer après avoir enregistré les changements. Le contrôle de conservation utilise séparément le socle antérieur pour vérifier les anciens contenus.

La recette navigateur emploie les dépendances de test existantes : Playwright et axe-core (via `NODE_PATH` dans la CI). `THOT_CHROMIUM_EXECUTABLE` sélectionne au besoin un Chromium installé ; `THOT_AXE_PATH` sélectionne axe-core. Les vraies ressources locales sont servies par interception sous `/Thot/`, sans contacter Internet. `THOT_OUTPUT_DIR` choisit le dossier des captures et du rapport JSON.

Elle couvre les huit combinaisons de Gorgias, tous les scores, les neuf choix du second jeu et leurs limites/perspectives, l’absence de correction avant validation, les doubles validations, les reprises, l’indépendance et la double initialisation, les liens de saut et le focus, le clavier, JavaScript désactivé, la réduction des mouvements et cinq largeurs de 320 à 1440 px. Cinq audits axe examinent les états initiaux, retours et conclusions.

Les tests statiques s’ajoutent au lanceur existant ; la recette navigateur s’ajoute au workflow d’audit, sans modification des permissions ni du déploiement. L’ancien test de bibliothèque attend le nombre d’articles du registre plutôt qu’une constante de six ; ses contrôles de recherche, filtre et tirage restent présents.

Limites : pas de lecteur d’écran humain, de terminal tactile physique ni de Safari/iOS local. Chromium et axe ne garantissent pas à eux seuls l’accessibilité sur tous les appareils. Un commit ou une PR ne prouve pas la publication : le déploiement et la page publique doivent être vérifiés séparément.
