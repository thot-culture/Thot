# COMPTE RENDU POUR CHATGPT — THOT

Compte rendu de la phase locale, achevée le 25 octobre 2026. Publication autorisée ensuite par l’utilisateur (« publie ») ; le rapport de publication final précise le commit et le déploiement. Les indications « sans publication » ci-dessous décrivent l’état lors de la livraison locale.

Intervention globale locale du 25 octobre 2026. Branche `work/fluidite-globale-20261025`, base `64c4e45d445e164a86fad026097dd14c90c00065`. Modifications conservées dans l’arbre de travail, sans nouveau commit, fusion, push ou publication. `main` et `origin/main` restent sur la version publique précédente.

## Aperçu et livraison

Le serveur d’aperçu fonctionne à **http://127.0.0.1:8765/Thot/** dans cet environnement. Pour consulter l’archive sur son ordinateur : extraire le dossier `Thot`, ouvrir un terminal dans ce dossier et lancer `python3 scripts/preview.py`. Ouvrir la même adresse. Le serveur écoute uniquement sur l’interface locale ; il n’expose pas les autres dossiers de l’espace de travail.

Archive de livraison : `/workspace/THOT-site-local-fluidite-20261025.zip`. Résultats, mesures et captures : `/workspace/THOT-FLUIDITE-TESTS/`. Aucun outil de publication n’est nécessaire pour consulter cet aperçu.

## Inventaire et changements par parcours

| Page ou parcours | Changement réalisé | État |
| --- | --- | --- |
| Accueil | Introduction mobile réduite, emblème décoratif masqué sur petit écran, actions lecture/quiz côte à côte quand la place le permet. Premier article présenté avant la recherche, copie avant image sur mobile. Indications concrètes pour schéma, document et comparaison. Correction des mots collés et de la décoration chevauchant le titre. | Vérifiée et corrigée localement |
| Bibliothèque | Filtre Insolite vide retiré de l’interface ; ancienne URL de cette catégorie ramenée au catalogue complet. Recherche combinée, accents, partage par URL, réinitialisation et tirage aléatoire conservés. Indications documentaires et durées communes. | Vérifiée et corrigée localement |
| Notre méthode | Accès au quiz ajouté à l’en-tête et navigation de parcours commune au pied de page. Texte de méthode inchangé. | Vérifiée et corrigée localement |
| Quiz classique | Partie placée avant les cartes d’univers ; introduction et décoration compactées. Choix des thèmes et difficultés conservés. Progression, statistiques et badges dans un bloc natif dépliant. Avertissement de stockage maintenu visible hors de ce bloc. | Vérifiée et corrigée localement |
| Défi quotidien, missions et progression | Défi accessible à son ancre d’origine ; missions dépliables. Aucune modification du moteur, des règles, des données persistantes ou des clés de stockage. | Vérifiés selon les limites ci-dessous |
| Roubaix 1917 | Accès direct à l’affiche depuis le sommaire ; en-tête et navigation communs plus compacts. Original, repères, zoom, déplacement, vue entière, transcription et huit événements conservés. | Vérifiée et corrigée localement |
| Pieuvres | Curseur immédiatement après le dessin, légende après le retour d’état. À 390 px, dessin et commande tiennent dans moins de 400 px de hauteur. Avertissement qualitatif, référence au repos et clavier conservés. | Vérifiée et corrigée localement |
| Puissance américaine | Bouton direct « Comparer Afghanistan et Daech », masqué pendant la comparaison ; ancien choix de référence toujours disponible. Aide raccourcie et espaces réduits. Quatre critères, deux ordres de référence, périodes, liens et limites conservés. Iran toujours séparé, aucun fait nouveau. | Vérifiée et corrigée localement |
| Autorité | Accès direct à « Décode le pouvoir » dans le sommaire ; aide distinguant les objectifs des deux activités facultatives. Consignes protégées, nuances et retours conservés ; présentation mobile plus compacte. | Vérifiée et corrigée localement |
| Autrices, article et jeu autonome | Deux colonnes compactes sur téléphone pour rapprocher noms et choix. Retour lisible près de la grille. Au toucher, la première réponse disponible est amenée dans la vue si nécessaire ; focus clavier existant conservé. Aucun glisser-déposer imposé. | Vérifiés et corrigés localement |
| Page introuvable | Nouvelle `404.html`, style THOT, retours vers accueil, bibliothèque et quiz, `noindex` et exclusion du sitemap. Serveur local vérifié avec une vraie réponse 404 sur des URL absentes. | Vérifiée localement |

États de chargement, erreur d’image, aucun résultat et repli sans JavaScript contrôlés selon les tests détaillés ci-dessous. Les dix pages préexistantes et la nouvelle page 404 sont incluses dans l’inventaire navigateur. Aucun article ni parcours supprimé.

## Architecture et protection éditoriale

`assets/experience.css` regroupe les ajustements de confort, navigation, cibles, focus, réduction des animations et adaptations mobiles. Elle complète les feuilles existantes sans migration. Les pieds de page proposent les mêmes quatre parcours ; les en-têtes des articles conservent leur retour contextuel et ajoutent bibliothèque/quiz. Les URL et anciennes ancres restent disponibles, sous `/Thot/`.

`scripts/update-reading-times.py` produit `assets/reading-times.json`, le petit module commun `reading-times.js` et les libellés statiques des articles, cartes et recommandations. Estimation à 210 mots/minute, texte principal hors sources, figures et activités facultatives ; le temps des pauses documentaires s’ajoute. Les balises article imbriquées de la frise ont été prises en compte. Durées : Autorité 7 min, Autrices 7 min, Pieuvres 7 min, Puissance 6 min, Roubaix 8 min. Le module commun rétablit la même estimation après les anciens calculs inline, laissés intacts pour respecter leur protection. Les durées restent présentes sans JavaScript.

Aucune date de publication, date éditoriale ou mention scientifique n’a été avancée pour cette intervention d’interface. Aucun fait, chiffre, citation, source, transcription, crédit ou fichier image n’est modifié. Aucune nouvelle actualisation de l’Iran. Aucun nouveau quiz ou système de points. Les originaux documentaires et le catalogue d’illustrations sont intacts.

Le contrôle éditorial continue de comparer tous les anciens mots et liens documentaires. Il normalise seulement les libellés de durée de lecture et exclut les ajouts d’interface identifiés (navigation, liens de sommaire, aide des activités). Le générateur en mode `--check` contrôle la cohérence des nouvelles durées. Les tests de sommaires ajoutent explicitement les nouvelles destinations ; les anciennes restent vérifiées. Le contrôle de site impose `noindex` et l’absence du sitemap à la nouvelle page d’erreur. Les attentes de catégorie vide ont été adaptées à la remise au catalogue ; les autres tests de recherche/URL restent actifs. Le bloc protégé de « Décode le pouvoir », les banques de questions et les scripts inline sont inchangés.

## Tests réellement exécutés

**21 commandes réussies** : toutes les suites `test-*.mjs`, contrôleurs site/accueil, conservation éditoriale, génération des durées et métadonnées en mode vérification, huit tests des articles, trois contrôles documentaires statiques et `git diff --check`. Le contrôle de périmètre historique `--head HEAD` compare les commits existants, pas les modifications non commitées ; la portée de cette livraison est vérifiée séparément par le diff et l’inventaire complet. Le contrôle statique global examine **11 pages, 509 liens/ressources internes, 26 scripts, cinq JSON-LD et 300 questions**. Sorties complètes : `static-tests.json`.

**Chromium réel, 44 vues** : onze pages à 320, 390, 768 et 1440 px. Captures, un H1 par page, absence de débordement horizontal et d’erreur JavaScript non gérée. Activation clavier du curseur et des associations d’autrices, comparaison directe, recherche « Roubaix », aucun résultat et remise à zéro. Partie réelle avec bonne/mauvaise réponse, indice, bilan, corrections et rejeu lorsque le stockage est indisponible. Lecture des onze pages sans JavaScript. Résultats : `browser.json`.

**Tests détaillés des trois composants** dans Chromium, aux quatre largeurs : zoom, repères, panne récupérable d’image, original chargé volontairement et transcription à Roubaix ; référence fixe et clavier du chromatophore ; deux ordres de comparaison, quatre critères exactement repris, liens de sources, sortie vers Iran et composant incomplet. Réduction des animations et replis contrôlés. Résultats : `composants-browser.json` et sous-dossiers `roubaix/`, `pieuvres/`, `puissance/`.

**HTTP local réel**, distinct de Chromium : **98 GET, dix pages préexistantes, 57 assets et 132 ancres**, aucun échec, empreintes identiques aux fichiers locaux et MIME HTML/CSS/JS conformes. Quatre requêtes supplémentaires vérifient la nouvelle 404, deux URL absentes (dont une sous `articles/`) et la feuille commune. Résultats : `http-local.json`, `http-404.json`. Ce sont des contrôles sur le serveur local, aucune mesure sur la version publique.

Les suites DOM existantes couvrent en plus la persistance du défi terminé, les statistiques, les erreurs/corrections, les règles de rejeu, les URL de recherche, le retour arrière, les paramètres tiers et les stockages refusés. Ces simulations ne sont pas présentées comme des essais de stockage persistant dans Chromium.

## Captures inspectées et corrections visuelles

Les captures de l’accueil ont permis de corriger la jonction des mots et la décoration superposée ; celles des quiz ont guidé la réduction des espacements. Le rendu de la page 404 a été revérifié après correction du résolveur des chemins absolus dans l’outil de fixture. Les vues mobile/ordinateur de la bibliothèque, du quiz, du schéma, du comparateur, du jeu des autrices et les en-têtes des articles ont été inspectés. Les 60 captures du test global sont disponibles ; les tests détaillés ajoutent leurs propres captures. Chaque capture n’a pas fait l’objet d’une annotation humaine exhaustive.

Exemples : `index.html-390.png`, `index.html-1440.png`, `quiz.html-390.png`, `quiz.html-1440.png`, `chromato-390.png`, `comparaison-1440.png`, `autrices-quiz-autrices-390.png`, `404.html-320.png`.

## Mesures et limites

Cinq couples mesurés : texte nuit/ivoire **15,42:1**, texte secondaire/ivoire **6,22:1**, lien bleu/ivoire **8,21:1**, navigation claire/nuit **11,58:1**, bronze sombre/ivoire **4,53:1**. Ce sont des calculs de couleurs unies sélectionnées, pas une certification WCAG ni une vérification de toutes les superpositions ou de tous les états. Données et poids bruts/gzip des ressources ajoutées : `mesures.json`. Le site n’a reçu aucune dépendance externe. Le chargement volontaire de l’original documentaire et les dimensions réservées existantes sont conservés ; aucun fichier photographique n’a été retouché.

La navigation réseau de Chromium est bloquée par l’environnement. Les essais utilisent des fixtures incorporant les vrais fichiers locaux ; leur résolveur conserve le chemin des scripts et reconnaît `/Thot/`. Les images distantes sont exclues, et certains modules dépendant de l’origine ou des médias ne reproduisent pas tout le parcours d’une page servie normalement. Les boutons de partage, les navigations natives vers une autre page/ancre, l’historique réel et la persistance du défi dans un navigateur normal restent à confirmer sur l’aperçu ; leurs tests DOM et les destinations HTTP ont été conservés. Les captures peuvent donc montrer des replis d’images qui ne démontrent pas une panne du site public.

Pas d’essai sur téléphone physique, Safari/Firefox ou lecteur d’écran audio, ni de mesure du zoom navigateur à 200 %. Pas de Lighthouse, de score Core Web Vitals ou de mesure réseau mobile réel. Les tests à petites largeurs et les vérifications de clavier ne constituent pas une conformité WCAG 2.2 AA complète. Aucun contrôle ni changement sur le site public pendant cette intervention.

## Fichiers concernés et suite

Dix HTML préexistants et `404.html` ; nouveaux `assets/experience.css`, `assets/reading-times.json`, `assets/reading-times.js` ; ajustements de `assets/bibliotheque.js`, `assets/puissance-comparateur.js`, `assets/quiz-autrices.js` ; générateur `scripts/update-reading-times.py`, navigateur `scripts/test-experience-browser.py`, serveur `scripts/preview.py` ; résolveur `scripts/browser_fixture.py`, protections `scripts/check-editorial.py`, contrôleur `scripts/check-site.mjs`, tests `scripts/test-article-navigation.mjs` et `scripts/test-bibliotheque.mjs` ; ce compte rendu. Les fichiers photographiques, les banques et le moteur du quiz sont inchangés.

La prochaine recette utile est un parcours manuel sur l’aperçu dans un navigateur ordinaire : partage/copie, images chargées, ancres, défi terminé après rechargement, lecteur d’écran et zoom texte. Toute publication nécessite une nouvelle instruction explicite. Rien n’a été envoyé au dépôt distant.
