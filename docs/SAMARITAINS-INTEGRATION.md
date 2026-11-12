# Article sur les Samaritains — intégration du 12 novembre 2026

Branche : `article/bon-samaritain-20261112`.
Socle : `6ec1985043303aa689e66587e35cf69f2e1e56ac`.
Page : `articles/bon-samaritain.html` ; chemin d’aperçu `/Thot/articles/bon-samaritain.html`.
La date de la notice est celle de la préparation éditoriale. Cette branche ne publie pas la page : la fusion et la publication restent distinctes.

## Texte et intégration

Le texte reçu est conservé dans `docs/samaritains-texte-valide.txt`, avec les deux repères d’insertion d’origine. Le test compare séparément chaque titre et chaque paragraphe à la page et fixe aussi l’empreinte SHA-256 de cette copie. Seuls le balisage, les liens et les appels de sources sont ajoutés. Les cinq parties et la conclusion sont intégrales.

La page reprend `article.css`, `article-editorial.css`, le partage, les durées de lecture, la coque et le sommaire communs. Le registre `article-editorial.json` alimente les cartes, les métadonnées Article/Open Graph/Twitter, la bibliothèque, le filtre Histoire et le sitemap avec les générateurs existants. La sélection d’accueil inclut le nouvel article ; son article à la une reste celui du socle. Lecture estimée : 1 267 mots, 7 minutes, hors activités, images et bibliographie.

Les jeux utilisent les cartes, choix et boutons de `sophistes.css` et adaptent le fonctionnement de `sophistes.js` dans un script local isolé, sans modifier les sophistes. Le premier suit immédiatement la partie I, le second la partie IV. Chaque jeu possède son état indépendant, ses radios natives dans un fieldset/legend et un lien pour continuer la lecture. La validation verrouille les choix et déplace le focus sur une correction nommée et décrite, sans annonce live redondante. Le résultat du second jeu est calculé à partir des cinq réponses conservées uniquement en mémoire ; les doubles événements sont neutralisés. Le bilan reproduit les questions, choix, réponses attendues et explications. Les reprises effacent tout l’état du jeu concerné.

Aucun paquet n’est ajouté au site, aucune réponse n’est stockée ou transmise. Les nouveaux tests rejoignent le lanceur statique et le workflow d’audit navigateur existants ; la configuration de déploiement n’est pas modifiée.

## Références contrôlées

Contrôle du 12 novembre 2026 : correspondance du titre, de l’auteur, de la publication et de l’année, sur les notices officielles indiquées. Les dix URL fournies sont conservées dans une seule bibliographie finale. Chaque référence est appelée dans la partie concernée et les cinq mentions « Pour approfondir » contiennent leurs liens directs (deux liens dans la partie IV).

| N° | Publication | Résultat de consultation |
| --- | --- | --- |
| 1 | Pummer, « Samaritans », Oxford Classical Dictionary, version 2022 | La [notice Oxford indexée](https://academic.oup.com/edited-volume/61673/chapter-abstract/548062125?login=false) identifie Pummer et la version du 28 janvier 2022. L’ouverture directe par l’outil redirige vers un CDN inaccessible ; le client HTTP reçoit 403. |
| 2 | Knoppers, Jews and Samaritans, OUP, 2013 | [Page de l’éditeur](https://academic.oup.com/book/10746) consultée : titre, Gary N. Knoppers, OUP, 30 mai 2013 concordants. |
| 3 | Kartveit, « Theories of the Origin… », Religions, 2019 | [Page MDPI](https://www.mdpi.com/2077-1444/10/12/661) consultée : auteur, titre, 4 décembre 2019, 10(12), 661 concordants. |
| 4 | Hjelm, « The Samaritan and Jewish Versions… », Religions, 2020 | [Page MDPI](https://www.mdpi.com/2077-1444/11/2/85) consultée : Ingrid Hjelm, titre, 12 février 2020, 11(2), 85 concordants. |
| 5 | Magness, « When Was the First Samaritan Temple… », JAJ, 2025 | Ouverture du [DOI fourni](https://doi.org/10.30965/21967954-bja10079) bloquée (403). La [notice institutionnelle Orion](https://orion-bibliography.huji.ac.il/index.php/node/82161) confirme ce DOI, Jodi Magness, 2025, Journal of Ancient Judaism 16(3), p. 340–349. Lien de secours présent dans la section des sources. |
| 6 | Barbu et Macchi, « Le sacrifice de Pâque… », ASDIWAL 7, 2012 | [Persée](https://www.persee.fr/doc/asdi_1662-4653_2012_num_7_1_982) consulté : auteurs, titre, année, numéro et p. 151–169 concordants. |
| 7 | Évangile selon Luc, 10, 25–37 | [Chapitre 10, USCCB](https://bible.usccb.org/bible/luke/10) consulté : texte primaire et passage de la parabole présents. |
| 8 | Luc Bronner, reportage sur les Samaritains, Le Monde, 17 mai 2026 | [Page du Monde](https://www.lemonde.fr/m-le-mag/article/2026/05/17/pres-de-naplouse-les-samaritains-forment-une-microsociete-neutre-au-c-ur-d-une-terre-en-guerre_6690055_4500055.html) consultée : titre, auteur et date concordants. Article réservé aux abonnés ; le texte intégral n’a pas été consulté. |
| 9 | Ryan, « Revisiting the Parable… », SCJR, 2021 | [Page de la revue](https://ejournals.bc.edu/index.php/scjr/article/view/13987) consultée : Maurice Ryan, titre, 4 octobre 2021 et volume 16(1) concordants. |
| 10 | Dayfani, « 4QpaleoExodᵐ and the Gerizim Composition », JBL 141(4), 2022 | Ouverture du [DOI fourni](https://doi.org/10.15699/jbl.1414.2022.5) bloquée (403). La [notice de l’Université hébraïque](https://cris.huji.ac.il/en/publications/4qpaleoexodsupmsup-and-the-gerizim-composition/) confirme le DOI, Hila Dayfani, titre, 2022, volume, numéro et p. 673–698. Lien de secours présent dans la section des sources. |

Ces contrôles identifient les publications citées ; ils ne constituent pas une nouvelle validation historique du texte. Aucun lien n’a été déclaré invalide sur la seule base d’un refus d’accès automatisé. Les ouvertures bloquées ne sont pas comptées comme réussies.

## Photographie et droits

Photographie réelle d’un site samaritain sur le mont Garizim, Daniel (dani36v), 29 octobre 2007, [notice individuelle Commons](https://commons.wikimedia.org/wiki/File:Mount_Gerizim_the_site_of_the_Samarities_(14719209955).jpg). Licence [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) confirmée par la notice et sa revue Flickr. Les crédits sont visibles sous la figure et sous les cartes ; les conversions et recadrages sont signalés. Aucun visuel historique inventé n’est utilisé. La provenance, l’empreinte du fichier téléchargé et les transformations sont consignées dans `docs/samaritains-image.json`.

## Validation

Le socle initial passe les 42 commandes de `node scripts/validate.mjs`.

Résultats locaux :

- `node scripts/validate.mjs` : **43/43 commandes réussies**, incluant les cinq nouveaux tests éditoriaux, les suites JavaScript existantes, les générateurs, la publication en copie temporaire, les contrôles SEO, les ressources, la portabilité et les corpus.
- `python scripts/check-conservation.py --revision 6ec1985043303aa689e66587e35cf69f2e1e56ac` : réussite ; les huit anciens articles, leurs JSON-LD et les corpus protégés restent conservés. Aucun ancien fichier d’article n’est modifié.
- `node scripts/test-samaritains-browser.cjs` : réussite sur Chromium 156.0.8078.79, en HTTP local. Trois choix du jeu 1 ; 32 parcours du jeu 2, dont 0/5, 5/5 et tous les scores intermédiaires ; 160 corrections et bilans vérifiés ; validations vides et doubles événements ; verrouillages et reprises ; indépendance des jeux et initialisation répétée.
- La même recette passe au clavier (Tab, flèches, Entrée, Espace), sans JavaScript, avec mouvements réduits, à 320/390/768/1024/1440 px et à 200 % de zoom. Six audits axe WCAG A/AA sans violation ; aucune exception JavaScript, ressource locale absente ou requête externe. Le résultat détaillé est dans [samaritains/navigateur.json](samaritains/navigateur.json).
- `THOT_BROWSER_EXECUTABLE=/usr/bin/chromium python scripts/run-browser-recipe.py` : réussite ; 105 contrôles de pages/largeurs (21 pages × 5 largeurs), 374 URL et 236 ancres en HTTP, navigation Atlas, onze pièces Aral, stockage des anciennes activités et lecture sans JavaScript. Aucune erreur consignée.
- `THOT_BROWSER_EXECUTABLE=/usr/bin/chromium THOT_AXE_PATH=… node scripts/audit-final-browser.cjs` : réussite ; 105 contrôles de pages/largeurs, aucun échec, aucune violation axe WCAG A/AA, aucune exception JavaScript ni erreur HTTP locale. Les sept parcours complémentaires de recherche, quiz, menus différés, repli et HTTP 404 réussissent également.
- Comparaison supplémentaire au socle : les huit anciens fichiers d’article sont identiques octet par octet et leurs huit notices éditoriales sont inchangées.
- `git diff --check` et les contrôles de syntaxe Node des deux nouveaux scripts : réussite.

Captures de la recette : [haut de page sur ordinateur](samaritains/article-desktop.webp), [jeu 1 sur mobile](samaritains/jeu-1-mobile.webp), [jeu 2 sur mobile](samaritains/jeu-2-mobile.webp), [bilan sur mobile](samaritains/bilan-mobile.webp). La capture du haut de page est un extrait de la capture intégrale, sans retouche du contenu.

Commandes de reproduction :

```sh
python scripts/test-samaritains.py
node scripts/validate.mjs
python scripts/check-conservation.py --revision 6ec1985043303aa689e66587e35cf69f2e1e56ac
node scripts/test-samaritains-browser.cjs
```

La recette navigateur utilise les dépendances de test déjà documentées par le dépôt (Playwright et axe-core), un serveur HTTP sous `/Thot/` et Chromium. `THOT_CHROMIUM_EXECUTABLE` ou `THOT_BROWSER_EXECUTABLE` permet de choisir le navigateur ; `THOT_AXE_PATH` permet de désigner axe dans un préfixe temporaire. Le bac à sable local interdit les sockets ; la recette HTTP doit y être lancée avec l’autorisation d’exécution correspondante. Cela ne concerne pas les visiteurs du site.

Limites : aucun téléphone physique, lecteur d’écran réel, Safari ou Firefox n’a été testé. Les tests et simulations clavier/axe ne constituent pas une certification d’accessibilité. Les trois ouvertures de sources bloquées et le contenu réservé aux abonnés sont décrits dans le tableau ci-dessus ; leur disponibilité intégrale reste à vérifier dans un navigateur autorisé. Les résultats Windows de la CI distante doivent être consultés sur la PR, séparément de la validation locale Linux.

## Fichiers livrés

Créations :

- `articles/bon-samaritain.html` : page intégrale, sommaire, jeux, sources et métadonnées.
- `assets/samaritains.js`, `assets/samaritains.css` : interactions et compléments de styles.
- `assets/images/samaritains-garizim.webp`, `assets/social-cards/bon-samaritain.jpg` : photographie et recadrage de partage.
- `scripts/test-samaritains.py`, `scripts/test-samaritains-browser.cjs` : fidélité et recette interactive.
- `docs/samaritains-texte-valide.txt`, `docs/samaritains-image.json`, `docs/SAMARITAINS-INTEGRATION.md` : texte source, droits et présent rapport.
- `docs/samaritains/navigateur.json` et les quatre captures WebP liées ci-dessus : preuves de recette.
- `docs/samaritains/validation.json` : synthèse des contrôles statiques et des deux recettes de non-régression existantes.

Modifications :

- `assets/article-editorial.json` : une notice ajoutée et référencement dans la sélection d’accueil ; notices précédentes inchangées.
- `assets/reading-times.json`, `assets/reading-times.js` : durée du nouvel article générée.
- `index.html`, `bibliotheque.html`, `sitemap.xml` : cartes, compte d’articles et URL générés.
- `scripts/validate.mjs`, `.github/workflows/audit-final.yml` : raccordement des nouveaux tests aux vérifications existantes, sans déploiement.
