# Article sur les Samaritains — intégration du 12 novembre 2026

Branche : `article/bon-samaritain-20261112`.
Socle : `6ec1985043303aa689e66587e35cf69f2e1e56ac`.
Page : `articles/bon-samaritain.html` ; chemin d’aperçu `/Thot/articles/bon-samaritain.html`.
La date de la notice est celle de la préparation éditoriale. Cette branche ne publie pas la page : la fusion et la publication restent distinctes.

## Texte et intégration

Le texte reçu est conservé dans `docs/samaritains-texte-valide.txt`, avec les deux repères d’insertion d’origine. Le test compare séparément chaque titre et chaque paragraphe à la page et fixe aussi l’empreinte SHA-256 de cette copie. Seuls le balisage, les liens et les appels de sources sont ajoutés. Les cinq parties et la conclusion sont intégrales.

La page reprend `article.css`, `article-editorial.css`, le partage, les durées de lecture, la coque et le sommaire communs. Le registre `article-editorial.json` alimente les cartes, les métadonnées Article/Open Graph/Twitter, la bibliothèque, le filtre Histoire et le sitemap avec les générateurs existants. La sélection d’accueil inclut le nouvel article ; son article à la une reste celui du socle. Lecture estimée : 1 267 mots, 7 minutes, hors activités, images et bibliographie.

Les jeux utilisent les cartes, choix et boutons de `sophistes.css` et adaptent le fonctionnement de `sophistes.js` dans un script local isolé, sans modifier les sophistes. Le premier suit immédiatement la partie I, le second la partie IV. Chaque jeu possède son état indépendant, ses radios natives dans un fieldset/legend et un lien pour continuer la lecture. La validation verrouille les choix et déplace le focus sur une correction nommée et décrite, sans annonce live redondante. Le résultat du second jeu est calculé à partir des cinq réponses conservées uniquement en mémoire ; les doubles événements sont neutralisés. Le bilan reproduit les questions, choix, réponses attendues et explications. Les reprises effacent tout l’état du jeu concerné.

Les jeux n’ajoutent aucun paquet, aucune réponse n’est stockée ou transmise. Les nouveaux tests rejoignent le lanceur statique et le workflow d’audit navigateur existants ; la configuration de déploiement n’est pas modifiée. La carte ajoutée le 14 novembre utilise Leaflet local, comme détaillé ci-dessous.

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

## Complément du 14 novembre 2026 — carte du mont Garizim

La PR en brouillon nº 35, préparée le 12 novembre, est réutilisée. Aucun doublon d’article ni nouvelle URL : `articles/bon-samaritain.html` reste la page de référence. Le script et le CSS des deux jeux, leur texte validé, la photographie documentaire et l’image sociale sont conservés sans modification par rapport à `83eeb1bf5869260953863645e9b3cbcb90cef253`. Les paragraphes du texte de la nouvelle mission sont identiques au texte validé déjà intégré et passent leur comparaison exacte. La publication initiale reste datée du 12 novembre ; l’ajout de la carte est signalé comme mise à jour du 14 novembre dans le HTML, le registre et le sitemap.

### Carte et sources

Le dépôt a été inspecté, notamment les articles, modules, dépendances, générateurs, tests et workflows. Aucun moteur cartographique général n’était présent ; les rendus d’Explorer sont spécifiques à ses corpus. **Leaflet 1.9.4** est livré localement dans `assets/vendor/leaflet/`, avec CSS, petites images de sa distribution et licence BSD 2-Clause. Aucune dépendance de construction n’est ajoutée. Le script est chargé lorsque la carte approche de l’écran.

La carte s’insère immédiatement après « Selon leur tradition, cette montagne est le véritable centre sacré d’Israël. » Elle présente trois repères dans les environs du Garizim, avec marqueur principal distinct, zoom ±, glissement, sélection au clavier/toucher, fiches fermables et recentrage. Les trois descriptions complètes restent dans le HTML, même sans JavaScript ou si le fournisseur est indisponible. Le sommaire comporte une entrée vers la carte et un lien permet de la passer.

Coordonnées contrôlées le 14 novembre par l’API OpenStreetMap et des requêtes ponctuelles Nominatim, sans géocodage lors de la lecture :

| Repère | Latitude | Longitude | Source primaire cartographique |
| --- | ---: | ---: | --- |
| Mont Garizim, sommet | 32.2008881 | 35.2730961 | https://www.openstreetmap.org/node/3602728613 |
| Naplouse, repère de localité | 32.2205316 | 35.2569374 | https://www.openstreetmap.org/way/265619988 |
| Kiryat Luza, repère de village | 32.2041266 | 35.2686671 | https://www.openstreetmap.org/node/2317268628 |

La [fiche UNESCO](https://whc.unesco.org/en/tentativelists/5706/) indique N32 12 44 E35 16 08 pour le site proposé dans son ensemble. Ce point est distingué du sommet et n’est pas utilisé pour inventer un emplacement de temple. La [présentation de l’Israel Nature and Parks Authority](https://en.parks.org.il/reserve-park/mount-gerizim/) a également été consultée pour le contexte du lieu. Le repère archéologique facultatif est omis ; aucune frontière antique ni reconstitution du sanctuaire n’est dessinée.

Fond standard `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, attribution visible et lien vers les [droits OSM](https://www.openstreetmap.org/copyright), données sous ODbL. La [politique du fournisseur](https://operations.osmfoundation.org/policies/tiles/) a été vérifiée : aucun préchargement de zone ni usage hors ligne, pas de suppression du Referer ni contournement du cache. Le navigateur demande les tuiles de la vue affichée. Cette connexion cartographique n’envoie aucun choix de jeu et n’ajoute aucun analytics. Le service externe reste sans garantie de disponibilité.

Les dix références bibliographiques ont fait l’objet d’une nouvelle tentative de consultation le 14 novembre. Les résultats concordent avec le tableau du 12 novembre : notices/pages officielles accessibles, limites persistantes pour l’ouverture directe Oxford et les deux DOI Magness/Dayfani, notices universitaires de secours accessibles ; reportage du Monde soumis à abonnement. La recherche sur le domaine Oxford confirme la version du 28 janvier 2022 de Pummer. Aucun texte intégral inaccessible n’est déclaré consulté et aucun nouvel ouvrage n’est ajouté.

### Fichiers de ce complément

Créations : `assets/samaritains-map.js`, `assets/samaritains-map.css`, `assets/vendor/leaflet/` (JS, CSS, licence et cinq PNG), `docs/samaritains-coordonnees.json`, `scripts/test-samaritains-map.py`, `scripts/test-samaritains-map-browser.cjs`.

Modifications : `articles/bon-samaritain.html`, `assets/article-editorial.json`, `sitemap.xml`, le présent rapport, `scripts/validate.mjs`, `.github/workflows/audit-final.yml`, `scripts/test-p1-cartes-browser.py` et `scripts/test-samaritains-browser.cjs`. Cette dernière recette conserve les 32 parcours des jeux et simule les tuiles pour rester déterministe ; elle accepte aussi un port d’aperçu configurable et décrit correctement la plateforme exécutée. Le script applicatif des jeux reste inchangé.

### Validation réellement exécutée sur la version finale

- **44/44 commandes** de `node scripts/validate.mjs --python <interpréteur disponible>` réussies, zéro échec : générateurs, référencement, publication, scripts Node, corpus, portabilité et inventaire de production. Les contrôles d’inventaire comparent au commit de travail ; la conservation des anciens contenus est comparée séparément au socle.
- `python scripts/test-samaritains.py` : **5/5 tests**, chaque paragraphe et titre, dix sources, liens, jeux, métadonnées, image et lecture inchangés : 1 267 mots, 7 minutes hors modules.
- `python scripts/test-samaritains-map.py` : **5/5 tests**, emplacement exact, trois coordonnées vérifiées, alternative textuelle, licence, absence de doublon/suivi, dates et ancres uniques.
- `node scripts/test-samaritains-browser.cjs` : les trois réponses du premier jeu ; **32 parcours** du second, dont 0/5 et 5/5, **160 corrections**, récapitulatifs, doubles validations, reprises ; partie complète au clavier ; cinq largeurs de 320 à 1 440 px et zoom 200 % ; JavaScript désactivé ; recherche et filtre Histoire. **6 audits axe A/AA** sans violation détectée ; aucune exception JS ni ressource locale absente.
- `node scripts/test-samaritains-map-browser.cjs` : trois repères visibles aux cinq largeurs, clic/clavier/toucher, ouverture/fermeture des fiches et restitution du focus, zoom ±, glissement, recentrage, attribution ; tuiles bloquées, script Leaflet absent, JavaScript désactivé, mouvements réduits. **3 audits axe A/AA** sans violation détectée ; aucune exception JS ni ressource locale absente.
- `python scripts/run-browser-recipe.py` : recette HTTP réelle sous `/Thot/`, **21 pages à cinq largeurs**, navigation et Atlas, quiz, onze pièces Aral, sauvegarde/rechargement/redémarrage, réinitialisation et absence de JavaScript.
- `python scripts/test-p1-cartes-browser.py` : **10 rendus de catalogue**, neuf liens d’articles, filtres, recherche, survol/focus, dix rendus sans JavaScript et écrans de haute densité réussis. Le premier passage de CI avait échoué car cette recette attendait encore sept cartes de sélection et huit articles, valeurs antérieures à cette PR. Les attentes sont désormais dérivées du registre et la liste exacte des articles affichés est vérifiée ; aucune assertion de disposition, média, crédit, date ou interaction n’est supprimée. Le test accepte le navigateur local via `THOT_BROWSER_EXECUTABLE`.
- `node scripts/test-sophistes-browser.cjs` : huit parcours de Gorgias, neuf choix de dilemmes, cinq largeurs, clavier et cinq audits axe réussis dans cette session ; script et styles des sophistes inchangés.
- `python scripts/check-conservation.py --revision 6ec1985043303aa689e66587e35cf69f2e1e56ac` : anciens contenus et corpus conservés. `git diff --check` : réussite.
- Essai visuel supplémentaire sur le serveur local avec les **vraies tuiles OpenStreetMap** : 14 réponses HTTP 200, aucune requête en échec ni exception JS ; captures ordinateur et mobile examinées. Recherche « Garizim » : un seul résultat, l’article existant. Il s’agit d’un essai ponctuel, sans garantie pour la disponibilité future du fournisseur.

Les recettes de carte et de jeux utilisent des tuiles simulées pour isoler les fonctionnalités ; l’essai réseau réel est distingué ci-dessus. La validation locale du 14 novembre a utilisé Chrome headless sur **Windows** et des interactions tactiles simulées. Aucun téléphone physique, lecteur d’écran humain, Safari ou Firefox n’a été testé. Les vérifications GitHub Actions restent distinctes des résultats locaux et sont consultables dans la PR. Aucune fusion ni publication n’est effectuée.
