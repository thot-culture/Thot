# Audit final THOT — 3 novembre 2026

## 1. Résumé général et périmètre

**Verdict : OUI, AVEC RÉSERVES pour la version corrigée de cette branche.** Les changements restent proposés dans la [PR #23 en brouillon](https://github.com/thot-culture/Thot/pull/23). Ils ne sont pas déployés : main et la PR #22 restent inchangés. Ce verdict ne décrit donc pas une mise en production des correctifs.

Bases effectivement comparées :

- main : `86ee7cbb27172262eca3648afe51cb7d2a81eab8` ;
- PR [#22](https://github.com/thot-culture/Thot/pull/22), branche `work/harmonie-visuelle-20261103` : `c7b62ad61c5ddabc63c61560175a55c85ec80200` ;
- branche d'audit : `work/audit-final-thot-20261103`, créée depuis ce dernier commit et proposée vers la branche de #22 pour isoler les corrections.

Le diagnostic initial a été sauvegardé avant la phase B dans le commit `2f4fb6e48dda07e8e4e42941e9a745f8450248b1`. Les résultats des audits précédents n'ont pas servi de preuves de réussite. Le rapport d'harmonisation a été lu, puis ses affirmations importantes contrôlées : les contenus principaux complets et les JSON-LD des **18 pages sont identiques entre main et #22**, comparaison indépendante via les fichiers des deux commits.

Le site est un ensemble HTML/CSS/JavaScript statique, sans CMS, framework, compte utilisateur ni serveur applicatif. Les défauts confirmés concernent surtout l'initialisation visuelle tardive, la préparation des publications et des outils de contrôle historiques. Aucun article n'a été supprimé ; aucun fait historique ou scientifique n'a été réécrit ; aucune URL publique THOT n'a changé.

L'environnement cloud est devenu indisponible pendant le diagnostic. La suite a été réalisée via GitHub et **de véritables runners GitHub Actions**, avec Chromium sous Linux et Windows. Aucun échec de test n'a été désactivé. Les sorties de pages générées ont été récupérées des générateurs réellement exécutés en CI, puis versionnées.

## 2. Inventaire des pages et architecture

Les 18 pages sont contrôlées sous `/Thot/`, aux largeurs **320, 390, 768, 1024 et 1440 px**. Le sitemap contient les 17 pages indexables ; la 404 reste hors sitemap.

| Page | Contenu |
| --- | --- |
| `index.html` | Accueil, recherche, sélection et découverte surprise |
| `bibliotheque.html` | Six articles, recherche, filtres et découverte surprise |
| `articles/autorite.html` | Article, trois situations, Décode le pouvoir |
| `articles/autrices-pseudonymes.html` | Article, pause pédagogique et cinq associations |
| `articles/pieuvres-couleur.html` | Article, chromatophore, sept structures et couches |
| `articles/puissance-etats-unis.html` | Article, trois cas, chronologie, comparateur et glossaire |
| `articles/roubaix-1917.html` | Article, huit dates, documents, zoom et transcription |
| `articles/evolution-strategies-militaires.html` | Article, six chapitres et quatre activités |
| `explorer.html` | Accueil Explorer |
| `explorer/enquetes/mer-aral.html` | Enquête, onze pièces, argumentation et sauvegarde |
| `explorer/atlas/rome-expansion.html` | Huit états, cartes, quatre parcours et quatre documents |
| `quiz.html` | Banque de 300 questions, partie classique et défi quotidien |
| `quiz-autrices.html` | Jeu autonome des cinq associations |
| `notre-methode.html` | Méthode éditoriale |
| `contact.html` | Signalements publics, limites du contact privé |
| `mentions-legales.html` | Informations explicitement partielles |
| `confidentialite.html` | Stockage local, hébergement et services tiers |
| `404.html` | Erreur, liens de secours et noindex |

Aucune page HTML supplémentaire détectée. Les références `.html.txt` de docs sont des archives de validation, pas des pages publiées.

### Sources, composants et sorties

- Les six articles sont des sources HTML. Les blocs éditoriaux des cinq premiers sont partiellement générés depuis `assets/article-editorial.json` ; le sixième utilise `layout: authored`.
- Les trois pages Explorer viennent de `build-explorer-reconstruction.py`, `explorer_aral_view.py`, `explorer_atlas_view.py` et des corpus dans `assets/explorer-v2/`. Elles ont été régénérées depuis leurs sources.
- `site_chrome.py` normalise marque, navigation, pied de page, favicon et métadonnées communes. Il incorpore maintenant le petit contrôleur commun de menu avant main, à partir de `assets/navigation.js`, pour éviter un repli tardif.
- `assets/visual-system.css` conserve l'identité de #22 et reste chargée en dernier ; les styles de lecture, quiz, cartes et documents restent dans leurs modules.
- `update-reading-times.py` génère JSON/JS et durées statiques ; `generate-social-cards.py` produit les cinq compositions historiques ; `build-quiz-references.py` produit les références du quiz.
- Le nouveau `sync-publication.py` ajoute les cartes manquantes et les URL au sitemap depuis les sources et notices, sans supprimer ou réécrire les cartes existantes.
- Python 3.12, Node 22, Pillow 12.3.0 pour les outils ; Shapely 2.1.2 seulement pour la préparation géographique ; Playwright 1.62.0, axe-core 4.10.3 et Lighthouse 12.8.2 pour l'audit. Aucune de ces dépendances de test n'est chargée par les lecteurs.
- GitHub Pages publie main. Les workflows ajoutés ne possèdent que `contents: read`, produisent des preuves et ne déploient rien.

## 3. Audit visuel et responsive

Les 90 vues sont examinées par les contrôles de dimensions, menus, HTTP local et erreurs JavaScript. Les captures du début de chaque page à 1440 px, et des débuts/milieux/pieds à 390 px, ont été **réellement visualisées** sous forme de planches. Les captures originales restent dans les artefacts.

Constats : marque et ibis cohérents, navigation et pieds de page reconnaissables, palette bleu nuit/crème/or préservée, corps de lecture et titres lisibles dans les vues consultées, cartes sans titre tronqué constaté, références et longs paragraphes lisibles. Aucun débordement horizontal global confirmé aux cinq largeurs, y compris après les interactions testées. Le zoom des documents et le défilement interne des cartes sont intentionnels et distincts d'un débordement de la page.

Corrections : contraste du libellé documentaire Roubaix, durée de sa carte et label d'accueil. Les changements de chargement réservent la place des commandes ; ils conservent leur présentation une fois prêtes. Aucun nouveau design n'a été introduit.

Captures avant/après pertinentes : `evidence/before/home-feature-{390,1440}.png`, `roubaix-contrast-{390,1440}.png` et leurs équivalents dans `evidence/after/`. Référence « avant » : commit exact de #22.

Limite : la revue de captures ne constitue pas une inspection visuelle de chaque pixel à chaque niveau de zoom ou de chaque combinaison d'état. Les 320/768/1024 px ont surtout une couverture automatisée.

## 4. Tests fonctionnels

- Linux : **90 vues PASS**, menus clavier/toucher simulé et aucune exception JavaScript inattendue ; 90 scans axe sans violation.
- Windows : **90 vues PASS** dans un véritable Chromium Windows, avec les mêmes contrôles de menu, clavier, débordement et erreurs.
- Quiz classique et défi du jour : cinq réponses jusqu'au résultat, score exact et sauvegarde native.
- Aral : onze pièces, sauvegarde, rechargement, arrêt complet/réouverture du navigateur, remise à zéro d'Aral et conservation du quiz.
- Recette HTTP : **270 URL et 157 ancres PASS** sur Linux et Windows ; erreur 404 réelle pour une URL inconnue.
- Chargement lent : cinq gabarits gardent la position du main avec les JS externes retardés de 1,2 seconde ; contrôle supplémentaire de la position de la carte et du corps du quiz.
- Banque de questions volontairement indisponible : notice réellement visible et démarrage désactivé.
- Sans JavaScript : navigation visible et absence de débordement sur les 18 pages à 320 px.

Le contrôle statique vérifie les liens et ancres internes, les ressources CSS/JS, les images locales et les références ARIA. Le contrôle HTTP initial a réellement servi 18 pages et 116 URL sous /Thot/ ; onze anciennes pages retirées retournent 404. La recette actuelle suit aussi les URL et ancres présentes dans le DOM après génération.

Les tests d'activités dans Chromium couvrent, aux cinq largeurs : toutes les réponses des situations Autorité, les trois scènes et le reset de Décode, les cinq associations des deux jeux Autrices avec erreur et clavier, le curseur et les sept structures Pieuvres, les trois cas et six étapes États-Unis, le comparateur à quatre lignes, les huit dates Roubaix, l'original de l'affiche et ses repères, les états des trois modules militaires et leurs notices, les quatre parcours Atlas et leurs documents, les onze pièces Aral, relation, conclusion, bilan, révision et remise à zéro.

La recherche passe depuis l'accueil vers `bibliotheque.html?q=Roubaix`, puis filtre, effacement, absence de résultat et recherche sans accents. Les contrôleurs DOM vérifient aussi l'historique, les API refusées, les clics modifiés et les replis. Le partage natif et le presse-papiers réel de chaque OS ne sont pas certifiés par les tests de DOM.

## 5. Audit technique, sécurité et non-régression

La comparaison de main et #22 montre des modifications de coque, pas des réécritures d'articles. Les échecs historiques listés en section 12 ont été reproduits sur les deux bases. Le contraste Roubaix et la logique des durées sont préexistants. Les contrôleurs de menu tardifs sont également préexistants ; **l'ampleur du CLS sur main avant #22 n'a pas été mesurée**, donc le rapport n'attribue pas toute sa valeur à une régression de #22.

Les duplications de menu de l'accueil et du quiz ont été remplacées par une source commune. Les petites initialisations incorporées sont générées, et contrôlées pour leur unicité, leur source exacte et leur position avant main. Un test retarde les autres scripts de 1,2 seconde pour reproduire les problèmes de chargement. Le repli de quiz reste visible si une banque échoue ; sans JS, les liens de secours restent présents.

`check-conservation.py` compare les main complets des anciens articles et du jeu Autrices, leurs JSON-LD, le catalogue d'illustrations et les banques de questions. Seules les durées calculées et l'unique réparation d'URL documentée sont normalisées. Un test modifie effectivement un texte et un lien pour vérifier leur détection. L'ancien contrôle éditorial défectueux n'a pas été supprimé.

Pas de secret requis côté client ni de formulaire de collecte distant ajouté. Les liens nouvel onglet sont contrôlés pour noopener. Les notes Aral sont rendues par nœuds de texte ; le seul HTML de visualisation injecté vient du corpus versionné. Les cas de stockage absent, refusé et sauvegarde sont exercés. Cela ne constitue pas un audit d'intrusion ou une garantie générale de sécurité.

Le répertoire local `work/` est ignoré pour éviter de versionner par accident profils, captures et mesures. Les polices, ZIP de sources et originaux documentaires présents dans le dépôt ne sont pas automatiquement téléchargés par les lecteurs ; ils ne sont donc pas supprimés comme prétendu « code mort ». P3 facultatif : `assets/reading-times.js` est aussi chargé sur des pages sans `#duree` (par exemple Méthode) ; environ 0,9 Ko transféré dans l'aperçu sans effet fonctionnel. Retirer ces seuls chargements après vérification des cartes serait une petite optimisation, pas une correction bloquante.

## 6. Performances et Core Web Vitals

Méthode : **Lighthouse 12.8.2, Chromium 151, téléphone et réseau simulés, HTTP local sous /Thot/**. Le serveur d'aperçu ne reproduit ni compression, ni cache/CDN de production. Les scores sont des mesures de laboratoire, pas des données CrUX ni un engagement sur téléphone physique.

| Page mesurée | Performance / 100 | LCP (s) | CLS | TBT (ms) |
| --- | ---: | ---: | ---: | ---: |
| `index.html` | 99 | 1.81 | 0.000 | 0 |
| `articles/autorite.html` | 96 | 2.72 | 0.000 | 0 |
| `articles/pieuvres-couleur.html` | 93 | 3.20 | 0.032 | 0 |
| `explorer/atlas/rome-expansion.html` | 74 | 4.46 | 0.000 | 0 |
| `explorer/enquetes/mer-aral.html` | 91 | 3.45 | 0.000 | 0 |
| `quiz.html` | 93 | 2.61 | 0.000 | 0 |

Mesures du [run 41620956858](https://github.com/thot-culture/Thot/actions/runs/41620956858), commit `433d84b8aa12b17df8e24589e3bf14bc7f9319f4`. Un passage froid par page dans ce run, après plusieurs mesures intermédiaires motivées par les défauts découverts. Résultats bruts conservés dans `docs/audit-final/performances-finales.json`. Ces six pages représentent les principaux gabarits ; les autres disposent de l'inventaire des ressources et des tests navigateur, pas d'un score Lighthouse inventé.

Les mesures initiales sont conservées dans `docs/audit-final/mesures-initiales.json`. Elles ont révélé des CLS de 0,682 sur Pieuvres, 0,366 sur Aral et 0,464 sur Quiz. Une mesure intermédiaire a aussi exposé 0,239 sur l'Atlas et 0,106 lié au record mobile du quiz. Causes corrigées : repli tardif du menu, apparition des commandes Atlas, disparition du message transitoire et repli du record. Les nouveaux tests de chargement lent protègent ces mécanismes.

Poids initiaux non compressés : accueil 19 164 octets ; plus gros article 54 498 ; Atlas 606 520 ; Aral 91 094. Deux PNG documentaires Aral pèsent 1 181 324 et 882 730 octets ; l'original laine 2 325 252 octets est demandé à l'agrandissement. Les photos locales principales utilisent généralement WebP, les médias secondaires lazy et des dimensions explicites ; aucune police Web n'est téléchargée.

Le LCP froid de l'Atlas reste à améliorer/mesurer en production : sa géométrie SVG incorporée est lourde. Une optimisation géographique demande une vérification spécifique des limites et licences ; aucune simplification hasardeuse n'a été faite. Les images externes restent dépendantes de tiers. Lighthouse observe un cookie tiers Wikimedia sur l'accueil/Pieuvres ; la page Confidentialité précise désormais les requêtes automatiques d'images tierces. Aucun outil publicitaire ou de mesure n'a été ajouté par THOT.

**INP non mesuré en conditions réelles.** Le TBT de Lighthouse et les réponses fonctionnelles ne sont pas présentés comme un INP. Aucune affirmation sur les Core Web Vitals Google réels sans données correspondantes.

## 7. Accessibilité — objectif WCAG 2.2 AA

**Zéro violation axe-core dans 90 états initiaux** avec les tags WCAG 2 A/AA, 2.1 AA et 2.2 AA. Les contrôles incomplets sont conservés dans `verifications-finales.json` : ce résultat ne les transforme pas en contrôles humains réussis. Les parcours clavier et dialogues sont vérifiés séparément dans les activités, sous Linux et dans la recette Windows.

Le contraste Roubaix #927038 sur #f8f6f1 était de 4,22:1 selon axe pour 11 px gras ; il est passé à #81632e, soit environ 5,17:1 calculés selon la formule WCAG. La palette et la mise en page restent identiques.

Un H1 et un main par page, langue française, alt présents, liens de sources nommés, ARIA et IDs contrôlés. Menu : Entrée/toucher simulé, Échap, focus restitué et sortie du focus. Glossaires et dialogues sont exercés ; les contenus essentiels restent accessibles sans JS. La réduction des animations est activée pendant les essais et les modules ont des replis statiques.

Réserves : axe ne certifie pas WCAG. Pas de lecteur d'écran réel, de lecture complète des cartes en audio ni de zoom natif exhaustif sur les 18 pages. La frise militaire saute de H2 à H4 dans ses six fiches ; c'est une amélioration sémantique restante. Les affirmations de conformité AA complète sont donc exclues.

## 8. SEO technique

Domaine et préfixe confirmés par le dépôt et les réponses HTTP : `https://thot-culture.github.io/Thot/`. Pas de CNAME détecté. Les 17 pages publiques indexables répondent réellement HTTP 200 ; sitemap et robots du projet également. L'URL inconnue testée retourne 404.

Titles et descriptions présents, titres distincts entre pages, un H1, canoniques cohérentes avec les URL, og:url alignés, images sociales locales existantes, 17 JSON-LD parsables. Les six articles déclarent Article, auteur, dates et image ; les pages Explorer déclarent WebPage. Aucun noindex sur les articles ; 404 noindex hors sitemap. La syntaxe JSON-LD ne garantit pas des résultats enrichis.

`/Thot/index.html` et `/Thot/` représentent l'accueil, avec une canonique vers le second : pas de changement d'URL demandé. Les anciennes pages retirées ne sont pas arbitrairement redirigées vers des contenus différents.

Attention : Google lit `https://thot-culture.github.io/robots.txt`, qui retourne **404**, et non le fichier du sous-projet. Cette absence n'interdit pas l'exploration ; le robots du projet ne contrôle pas à lui seul le domaine. Soumettre le sitemap dans Search Console est possible lorsque l'éditeur y a accès. L'indexation réelle et les statistiques Google n'ont pas été vérifiées.

## 9. Éditorial, sources et fiabilité

Les titres, cartes, dates et références des six articles ont été inventoriés ; respectivement 13, 16, 5, 18, 9 et 22 références pour Autorité, Autrices, Pieuvres, États-Unis, Roubaix et Stratégies. Les références et leurs limites restent visibles dans les captures consultées. Aucun lorem ipsum détecté ; les informations légales à compléter sont annoncées comme telles, sans données inventées.

Deux incohérences corrigées : Autorité n'est plus présenté comme la dernière publication du site, et Roubaix affiche 8 minutes dans ses cartes et recommandations, comme son registre. La sélection d'accueil reste éditoriale, tandis que la bibliothèque contient tous les articles.

L'ancienne adresse de la source George Eliot échoue en DNS. La même ressource Great Writers Inspire, contributeur Charlotte Barrett, a été ouverte, lue puis contrôlée HTTP 200 à `https://writersinspire.org/content/george-eliot-0`. Réparation limitée au lien, tracée dans `docs/audit-final/liens-repares.json` ; aucun fait du texte modifié.

Contrôle HTTP de **214 URL uniques** (liens, médias dynamiques, références de quiz vérifiées et échantillon d'infrastructure publique) : **169 réponses 200, deux 401, dix-huit 403, treize 429, deux 404 attendues et dix erreurs réseau/TLS/DNS**. Résultats détaillés dans `liens-http.json`.

Les deux 404 sont l'URL inconnue volontaire et le robots à la racine de l'hôte. Les 401 concernent Reuters ; les refus 403/429 concernent notamment éditeurs, musées et Wikimedia. Les erreurs comprennent quatre anciennes notices bn-r.cd-script.fr au certificat non concordant, SIGAR en échec DNS, un certificat institutionnel Navy et des délais Géoconfluences. Ces accès restent à revoir : ne pas contourner TLS et ne pas inventer une URL documentaire. Aucun 404 documentaire inattendu n'a été constaté dans ce passage ; cela ne valide ni les contenus ni la disponibilité universelle des sources.

Points éditoriaux à conserver dans la maintenance :

- Le registre du quiz comporte **24 questions vérifiées, 275 non réexaminées et une à revoir**. Cette dernière rattache le café à Kaffa comme étymologie populaire incertaine ; la [notice de l'Académie](https://www.dictionnaire-academie.fr/article/A9C0148), consultée indépendamment pendant cet audit, décrit une filiation turque/arabe et n'établit pas ce rattachement. Aucune validation globale des 300 questions n'est revendiquée.
- L'article États-Unis date explicitement son actualité iranienne d'octobre 2026 ; ses deux références Reuters refusent l'accès automatique. Une disponibilité HTTP seule ne permet pas de revalider ces faits.
- Plusieurs références Roubaix sont des notices ; l'accès direct aux documents originaux n'est pas confirmé. Des hôtes d'archives ont des erreurs de certificat. Les réserves déjà écrites dans l'article restent présentes.
- Les informations légales et le canal privé demandent une décision de l'éditeur. Le présent audit technique ne les remplit pas avec une identité ou une adresse supposée.

## 10. Processus pour deux articles par semaine

Le [GUIDE-PUBLICATION-ARTICLES.md](../GUIDE-PUBLICATION-ARTICLES.md) donne les étapes, données, médias, références, animations, génération, tests et PR.

Le travail ordinaire se limite désormais à **une source d'article HTML, une notice dans le registre et ses médias documentés**. Le synchroniseur ajoute la carte et l'URL ; les durées, la coque et leurs contrôles sont communs. L'accueil reste une sélection facultative : il n'a pas besoin d'être retouché à chaque publication.

Le synchroniseur refuse articles non déclarés, slugs invalides ou dupliqués, crédit absent pour une nouvelle carte, dates contradictoires, canoniques incohérentes et suppression implicite d'URL du sitemap. Les cartes existantes restent inchangées. Les tests créent réellement un article temporaire avec un slug chiffré, synchronisent, répètent l'opération, puis simulent oublis et doublons. Aucune page d'essai n'est publiée.

Ordre courant : `update-article-editorial.py --write`, `sync-publication.py --write`, `update-reading-times.py`, `site_chrome.py`. Reconstruire Explorer d'abord si ses sources ou la coque générée changent. Aucun CMS ni compilation de production supplémentaire.

## 11. Défauts découverts et corrections

| ID / gravité initiale | Reproduction, fichier, conséquence | Origine et traitement |
| --- | --- | --- |
| A01 — P1 contrôle | `check-editorial.py` échoue dès quiz-autrices, exclusions avant/après asymétriques ; comparaison globale inexploitable | Reproduit sur main/#22. Contrôle historique conservé ; garde complète actuelle `check-conservation.py`, tests de mutation et comparaison indépendante main/#22 |
| A02 — P1 contrôle | `test-site-browser.cjs` crée /work depuis /workspace/Thot et s'arrête avant la sauvegarde | Préexistant. Profil via tmpdir/mkdtemp, nettoyage, sorties locales au projet ; recette complète rejouée |
| A03 — P2 | Carte Roubaix 9 min contre 8 ; `update-reading-times.py` exclut les chiffres du slug | Préexistant. Regex corrigée dans la source ; quatre pages réellement régénérées, durées vérifiées |
| A04 — P2 | `index.html` présente Autorité comme dernière publication malgré l'article militaire plus récent | Préexistant. Label « À la une » et nom accessible du tirage alignés avec la sélection |
| A05 — P2 | `assets/roubaix-photos.css`, Roubaix `.thot-document-overline`, axe color-contrast 4,22 | CSS identique à main. Une seule teinte assombrie, axe rejoué |
| A06 — P1 maintenance | `assets/article-editorial.json`, `bibliotheque.html`, `sitemap.xml` : listes manuelles et risque d'oubli à l'ajout d'article | Préexistant. Synchroniseur limité, guide, sept tests de publication et CI |
| A07 — P2 outils | Cinq recettes historiques bloquent sur un ancien retrait ou périmètre | Échecs déjà présents sur main/#22 ; assertions conservées, statut historique explicite et nouvelles recettes actuelles |
| A08 — P2 décision | `mentions-legales.html` et `contact.html` : informations partielles et contact privé non configuré | Préexistant, reste à valider par l'éditeur, aucune information personnelle inventée |
| A09 — P2 documentaire | `articles/*.html` et notices : sources externes refusées, DNS ou TLS en erreur | Oxford réparé avec preuve ; autres refus et réserves documentés, pas de remplacement hasardeux |
| A10 — P2 performance | `explorer/atlas/rome-expansion.html` (source `scripts/explorer_atlas_view.py`) : 606 Ko, LCP froid lent dans l'aperçu non compressé | Préexistant ; mesure documentée, optimisation cartographique à part |
| A11 — P2 sémantique | `articles/evolution-strategies-militaires.html` : six fiches de frise passent de H2 vers H4 | Préexistant ; reste à améliorer sans modifier les textes/activités validés |
| A12 — P1 performance | `scripts/site_chrome.py`, `assets/navigation.js`, `site-home.js`, `site.js` : menu replié après main, CLS élevé et contrôleurs dupliqués | Contrôleurs tardifs préexistants, amplitude sur main non mesurée. Source unique incorporée avant main ; tests de retard et sans JS |
| A13 — P1 performance | `assets/explorer-v2/atlas.css` : apparition des commandes, 0,239 CLS dans un essai intermédiaire | Défaut latent exposé par la chronologie d'affichage intermédiaire. Espaces réservés invisibles avant initialisation, repli sans JS conservé ; mesure et tests |
| A14 — P1 performance | `assets/quiz-startup.js`, `assets/quiz.css`, `scripts/site_chrome.py` : message transitoire et record mobile déplacent le contenu | Initialisation légère, repli sur erreur/10 secondes, ligne du record réservée ; test avec banque manquante |
| A16 — P2 transparence | `confidentialite.html` : images tierces, requêtes et cookies avant un clic sur une source | Précision factuelle ajoutée, date visible et lastmod du sitemap alignés ; aucun mécanisme de suivi ajouté |
| A15 — P2 ressource | `scripts/site_chrome.py`, pages Explorer : favicon absente, requête /favicon.ico en 404 | Coque commune ajoute une favicon uniquement si absente ; pages générées reconstruites |

Aucun P0 confirmé. Les P1 fonctionnels et de maintenance disposent désormais de correctifs et de contrôles actuels réussis ; les scripts historiques restent explicitement signalés comme tels. Les réserves restantes sont les P2 détaillés, des décisions d'éditeur et des contrôles humains.

## 12. Tests réellement exécutés et preuves

Référence de code validée : `433d84b8aa12b17df8e24589e3bf14bc7f9319f4`.

| Vérification | Résultat effectif / preuve |
| --- | --- |
| `node scripts/check-site.mjs` | PASS : **18 pages, 879 liens/ressources internes, 53 scripts, 17 JSON-LD, 300 questions** |
| `node scripts/check-home.mjs` | PASS : liens, ressources et cinq articles de la sélection |
| `python scripts/test-publication.py` | **7 tests PASS**, dont ajout temporaire, répétition, oublis, doublons et mutations |
| `python scripts/test-portabilite.py` | PASS Linux et Windows : polices, cartes reproductibles, UTF-8, chemins avec espaces, générateurs |
| `python scripts/test-article-editorial.py` | Sept tests exécutés PASS ; un test historique optionnel de périmètre non activé |
| Les onze `scripts/test-*.mjs` | PASS : activités, composants, navigation, partage, chronologies, autorité/décodeur, bibliothèque, accueil, deux quiz |
| `python scripts/sync-publication.py --check` | PASS sur les sorties versionnées |
| `python scripts/update-article-editorial.py --check` et `update-reading-times.py --check` | PASS via la suite de portabilité |
| `python scripts/build-explorer-reconstruction.py --check` | PASS : trois pages générées à jour |
| `python scripts/site_chrome.py --check` | PASS : normalisation stable et non dupliquée |
| `python scripts/check-conservation.py --revision c7b62ad61c5ddabc63c61560175a55c85ec80200` | PASS : contenus, schémas, corpus et questions protégés |
| `node scripts/audit-final-browser.cjs` | PASS : 90 vues Linux, axe, activités, chargement lent, défaut simulé et sans JS |
| `node scripts/test-site-browser.cjs` | PASS : 90 vues Linux, Atlas, HTTP et persistance |
| `python scripts/run-browser-recipe.py` | PASS dans Chromium Windows : 90 vues, HTTP et persistance |
| `node scripts/audit-final-performance.cjs` | Six véritables mesures Lighthouse, valeurs section 6 |
| `python scripts/audit-final-links.py` | 214 résultats HTTP consignés ; pas de succès global fictif |

Runs terminés avec succès : [vérification portable Linux/Windows 41620956895](https://github.com/thot-culture/Thot/actions/runs/41620956895) et [audit navigateur Linux/Windows 41620956858](https://github.com/thot-culture/Thot/actions/runs/41620956858).

La CI portable **ne régénère pas les pages avant ses vérifications** : elle contrôle bien les sorties versionnées. Le workflow d'audit produit aussi un patch attendu, qui est vide dans ce run final. Les sept tests de publication utilisent des fichiers temporaires, pas un article de production.

Preuves durables dans `docs/audit-final/` : vérifications, mesures avant/après et liens HTTP. Captures et rapports Lighthouse complets : [artefact principal](https://github.com/thot-culture/Thot/actions/runs/41620956858/artifacts/13224175861), [artefact Windows](https://github.com/thot-culture/Thot/actions/runs/41620956858/artifacts/13222468799). Ces artefacts GitHub sont conservés jusqu'au **3 décembre 2026** ; les JSON versionnés restent dans le dépôt.

Échecs initiaux conservés et non présentés comme réussites :

- `check-editorial.py` : échec sur quiz-autrices, sur main et #22 ;
- `test-stabilisation.py` : ancien inventaire à 11 pages/retrait Explorer ;
- `test-strategies-static.py` : périmètre de fichiers depuis 5231c61 ;
- `test-explorer-reconstruction.py`, `test-explorer-finitions.py`, `test-explorer-recette-finale.py` : conservation globale fixée à d'anciens commits.

Ces six scripts n'ont pas été retouchés pour obtenir un succès. Les tests de contenu, références, ancres, comportements et sauvegarde sont exercés indépendamment par les recettes actuelles. Le contrôle éditorial de huit tests a été adapté pour **ajouter** l'exigence d'un menu commun exact, unique et placé avant main, en conservant la comparaison des scripts d'article d'origine. Son test optionnel de périmètre historique reste non activé sans `--head` ; il n'est pas compté comme exécuté.

Les échecs intermédiaires de la PR sont visibles dans Actions : sorties encore à régénérer, historique insuffisant en CI, ajout du script commun détecté par une assertion stricte, duplication d'initialisation lors d'une seconde génération, et sélecteur de test confondant les deux headers d'article. Leurs causes ont été corrigées ; aucun contrôle n'a été supprimé ou transformé en succès fictif.

## 13. Limites

Pas de téléphone physique, Safari/macOS, Firefox ni lecteur d'écran réel ; pas de certification WCAG. Le toucher est simulé. Les tests Linux et Windows utilisent Chromium. Le zoom natif 200/400 % sur l'ensemble des 18 pages n'a pas été exécuté ; le reflow aux largeurs demandées n'en tient pas lieu.

Mesures Lighthouse locales et simulées ; cache/CDN, INP et Core Web Vitals terrain non établis. Les liens externes peuvent varier selon heure, géographie et protections ; 200 ne prouve pas une source probante, 403/429 ne prouve pas une URL erronée. La vérification historique/scientifique exhaustive, les droits de chaque média et l'indexation Google ne sont pas certifiés.

Les premiers fichiers locaux sont devenus inaccessibles lors de la panne ; les preuves finales viennent des recettes distantes réellement exécutées. Aucun déploiement de cette version n'a été effectué.

## 14. Maintenance recommandée et réserves restantes

À chaque article : sources et droits, notice, génération, contrôles de PR et recette /Thot/. À chaque modification partagée : les 18 pages et les cinq largeurs. Revoir périodiquement les références externes, le quiz à réexaminer et les informations légales ; conserver une liste de décisions éditoriales plutôt que des coordonnées supposées.

Mesurer les Web Vitals en production lorsque des données seront disponibles. Si une optimisation de l'Atlas est entreprise, vérifier cartes, précision, licences et parcours. Préférer des dérivés locaux documentés pour les images externes lorsque les droits l'autorisent, en préservant les originaux nécessaires.

Après #22, recibler la PR d'audit vers main si nécessaire et vérifier les commits en présence. Fusion, sauvegarde et déploiement restent des opérations distinctes à décider ultérieurement. Les contrôles d'audit n'autorisent pas automatiquement une publication.

## 15. Conclusion

**THOT EST-IL TECHNIQUEMENT PRÊT POUR UNE PHASE CONSACRÉE AU SEO ET À LA PUBLICATION DE DEUX ARTICLES PAR SEMAINE ?**

**OUI, AVEC RÉSERVES.** Les parcours critiques, la navigation sous /Thot/, la conservation des contenus, les générateurs et la publication récurrente sont vérifiés. Les instabilités mobiles mesurées sont corrigées et un article peut rejoindre la bibliothèque et le sitemap depuis ses sources, avec des validations qui détectent les oublis. Aucun défaut P0 ni P1 fonctionnel non traité n'est confirmé sur cette version proposée.

Les réserves concernent les contrôles humains d'accessibilité, les services documentaires externes, la revue éditoriale ciblée, les informations d'éditeur et les mesures de performance en production. Elles sont explicites et ne sont pas transformées en réussites automatiques. La production reste sur main tant que les propositions n'ont pas été intégrées et publiées par le processus du dépôt.
