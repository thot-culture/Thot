# Audit final THOT — 3 novembre 2026

## 1. Périmètre et état du travail

Audit indépendant du dépôt public `thot-culture/Thot`, base `main` : `86ee7cbb27172262eca3648afe51cb7d2a81eab8`, PR [#22](https://github.com/thot-culture/Thot/pull/22) non fusionnée : `c7b62ad61c5ddabc63c61560175a55c85ec80200`. Branche dédiée : `work/audit-final-thot-20261103`, issue de cette PR et destinée à sa branche pour éviter de dupliquer ses modifications dans une revue vers main.

**Document de diagnostic, en cours de finalisation.** Les résultats ci-dessous proviennent de commandes réellement exécutées pendant cette intervention. Ils ne reprennent pas comme preuves les conclusions des audits antérieurs. Aucun déploiement, aucune fusion et aucune modification de main. Le guide pratique se trouve à la racine : `GUIDE-PUBLICATION-ARTICLES.md`.

L'environnement cloud est devenu indisponible après les premières recettes. Les captures locales et journaux détaillés n'étaient pas encore versionnés. Leur examen visuel et la validation des corrections doivent être complétés ; les constats non établis restent explicitement non vérifiés.

## 2. Architecture et inventaire

Site statique, sans framework, sans CMS, sans serveur applicatif ni dépendance JavaScript de production à installer. HTML, CSS et scripts classiques différés ; polices système, Georgia pour les titres. Python 3.12 et Node servent aux contrôles et à la génération. Pillow est nécessaire pour les cartes sociales ; Shapely uniquement à la préparation géographique. Playwright sert aux tests navigateur.

Les 18 pages présentes ont été ouvertes en HTTP local sous `/Thot/`, dans Chromium 155.0.8059.79 aux largeurs 320, 390, 768, 1024 et 1440 px :

| Page | Type | Contrôles d'affichage initiaux |
| --- | --- | --- |
| `index.html` | Accueil, recherche, découverte | 5 largeurs |
| `bibliotheque.html` | Catalogue, recherche et filtres | 5 largeurs |
| `articles/autorite.html` | Article et activités | 5 largeurs |
| `articles/autrices-pseudonymes.html` | Article et jeu | 5 largeurs |
| `articles/pieuvres-couleur.html` | Article et schéma | 5 largeurs |
| `articles/puissance-etats-unis.html` | Article et comparateur | 5 largeurs |
| `articles/roubaix-1917.html` | Article et document agrandissable | 5 largeurs |
| `articles/evolution-strategies-militaires.html` | Article et quatre activités | 5 largeurs |
| `explorer.html` | Accueil Explorer | 5 largeurs |
| `explorer/enquetes/mer-aral.html` | Enquête et stockage local | 5 largeurs |
| `explorer/atlas/rome-expansion.html` | Atlas et parcours historiques | 5 largeurs |
| `quiz.html` | Quiz classique et défi quotidien | 5 largeurs |
| `quiz-autrices.html` | Jeu autonome | 5 largeurs |
| `notre-methode.html` | Méthode éditoriale | 5 largeurs |
| `contact.html` | Corrections publiques | 5 largeurs |
| `mentions-legales.html` | Informations légales partielles | 5 largeurs |
| `confidentialite.html` | Stockage et confidentialité | 5 largeurs |
| `404.html` | Erreur, noindex | 5 largeurs |

Aucune autre page HTML détectée. Les documents HTML conservés en `.html.txt` dans `docs/` sont des références de validation, pas des pages du site.

### Sources et fichiers générés

- `scripts/build-explorer-reconstruction.py`, `explorer_aral_view.py`, `explorer_atlas_view.py` et `assets/explorer-v2/data/` produisent les trois pages Explorer.
- `scripts/site_chrome.py` harmonise logo, navigation, pied de page et métadonnées générales ; il est appelé par le générateur Explorer.
- `assets/visual-system.css` (PR #22), `navigation.css` et les feuilles propres aux parcours se superposent. La feuille commune est chargée en dernier et porte une empreinte de contenu.
- `assets/article-editorial.json` contient six notices ; `update-article-editorial.py` produit les encadrés de cinq anciens articles et vérifie le sixième, déclaré `layout: authored`.
- `update-reading-times.py` calcule les durées, écrit JSON/JS et synchronise certaines occurrences statiques.
- `generate-social-cards.py` produit cinq compositions historiques ; le sixième article possède sa propre image sociale.
- `build-quiz-references.py` dérive les références affichables du registre de vérification des questions.
- La bibliothèque, la sélection de l'accueil et le sitemap nécessitent encore des mises à jour explicites. Ce point doit être simplifié ou fiabilisé avant la cadence de deux articles par semaine.

### Construction et publication

Le workflow `verification-portable.yml` exécute génération, portabilité, liens et cohérence sur Ubuntu et Windows. Le run [41597686406](https://github.com/thot-culture/Thot/actions/runs/41597686406) de la PR #22 est réellement terminé avec succès ; cela ne prouve pas l'accessibilité ni les performances. GitHub Pages publie actuellement main, conformément au README ; le présent audit ne publie aucune branche.

## 3. Visuel et responsive

90 ouvertures HTTP contrôlées : aucun débordement global supérieur à 1 px et aucune exception JavaScript détectée. En-têtes, navigation et menus présents. Menus mobiles ouverts au clavier et par toucher simulé, fermés par Échap avec retour du focus ; navigation visible sur les trois largeurs supérieures.

Des captures 390 et 1440 px ont été produites localement. **Elles n'ont pas encore été examinées visuellement ni sauvegardées dans la livraison**, l'environnement étant devenu indisponible. Il serait incorrect de déclarer à ce stade une revue visuelle complète de chaque page, des paragraphes et des tableaux. Les contrôles de dimensions ne suffisent pas à établir l'absence de tout chevauchement.

Les images externes ont échoué dans Chromium avec `ERR_CERT_AUTHORITY_INVALID` lié au certificat du proxy de cet environnement. Ce défaut de confiance local ne prouve pas une panne des images publiques. Aucun remplacement éditorial de média n'est justifié par ce seul résultat.

## 4. Fonctionnement

- `test-explorer-http.py --origin http://127.0.0.1:8765` : **PASS**, 18 pages et 116 URL/ressources servies sous /Thot/ ; onze anciennes pages retournent 404.
- `test-site-browser.cjs` : pages, menus et Atlas passent à 320, 390, 768, 1440 px. Les huit périodes, le comparateur, les zooms, les déplacements, les fiches et le regroupement des rendus par frame sont exercés.
- Cette recette échoue ensuite avant le parcours de sauvegarde : son profil persistant est créé dans `/work`, hors du projet. Le quiz complet, la sauvegarde Aral et le redémarrage de navigateur ne sont donc **pas validés par ce run**.
- Onze suites `test-*.mjs` passent en DOM simulé : activités, composants, navigation, partage, chronologies, autorité, décodeur, bibliothèque, accueil et deux quiz. Ces résultats ne sont pas présentés comme des essais de navigateur ou d'OS réels.
- Les liens/ancrages internes passent au contrôle statique global.
- Un contrôle HTTP externe était encore en cours lors de la perte d'environnement : 119 URL avaient un résultat, dont 109 HTTP 200, huit HTTP 403, un HTTP 503 et un tunnel refusé. Ce décompte est **partiel**. 403 et 503 ne sont pas qualifiés de liens définitivement cassés ; vérification manuelle nécessaire.

## 5. Code, sécurité et maintenabilité

Les modifications de la PR #22 portent principalement sur la coque visuelle, le générateur commun et le contrôleur d'accueil. Les six échecs de recettes historiques ci-dessous sont reproduits sur main et sur la PR : aucun n'est attribué à tort à la refonte.

Le site n'a ni authentification, ni écriture serveur, ni secret requis côté client. Les liens ouvrant un nouvel onglet sont contrôlés pour `noopener`. Les états locaux sont traités dans les contrôleurs du quiz et d'Aral ; les contenus saisis utilisent des nœuds de texte. Le HTML de visualisation injecté dans Aral vient du corpus versionné : ne jamais le remplacer par du contenu distant non fiable. Aucun audit de sécurité exhaustif ni analyse de dépendances téléchargées n'est revendiqué.

Les recettes historiques fixées à d'anciens commits ne constituent pas une suite globale pérenne. Elles restent présentes et leurs échecs restent visibles ; aucun test n'a été désactivé.

## 6. Performances

Mesures physiques initiales des fichiers, non des transferts compressés :

| Ressource | Octets | Interprétation |
| --- | ---: | --- |
| Accueil HTML | 19 164 | Faible poids HTML |
| Plus gros article HTML, États-Unis | 54 498 | Faible poids HTML |
| Atlas Rome HTML | 606 520 | Géométries SVG incorporées, budget à surveiller |
| Aral HTML | 91 094 | Corpus/documentation incorporés |
| Aral, barrage 2006 PNG | 1 181 324 | Document lourd, chargement à examiner |
| Aral Nord 1964 PNG | 882 730 | Document lourd, chargement à examiner |
| Original laine Roubaix JPEG | 2 325 252 | Original documentaire à la demande |

Les principales images locales d'articles sont en WebP, avec dimensions et chargement différé pour les médias secondaires. Aucun téléchargement de police Web. Plusieurs CSS sont bloquants mais locaux et modestes ; éviter un regroupement hasardeux sans mesure.

**Pas encore de mesure Lighthouse, LCP, CLS ou INP exploitable.** L'installation de Lighthouse avait abouti, pas son exécution. Aucun score n'est attribué. Les ZIP de sources et polices de génération présents dans le dépôt ne sont pas chargés automatiquement par les lecteurs.

## 7. Accessibilité

axe-core a été exécuté dans les 90 ouvertures avec les tags WCAG 2 A/AA, 2.1 AA et 2.2 AA. Résultat local consulté : une violation de contraste sur Roubaix, reproduite aux différentes largeurs ; aucune autre violation recensée dans ce run initial. Les vérifications incomplètes d'axe restent à compléter.

Le texte `.thot-document-overline` utilise #927038 sur #f8f6f1, contraste mesuré par axe 4,22:1 pour 11 px gras, inférieur à 4,5:1. Une teinte légèrement plus sombre suffit, sans changer la palette générale.

Un H1, un main et `lang=fr` sont contrôlés sur les 18 pages ; présence d'alt et références ARIA contrôlées statiquement. Menus : clavier, Échap, focus et toucher simulé exercés. Réduction des animations activée dans les contextes d'essai, sans certification exhaustive des animations.

**Non validés : lecteur d'écran réel, zoom natif sur toutes les pages, commandes de tous les modules au clavier, perception des cartes et contrastes non couverts par axe.** Les titres H4 directement après un H2 dans la frise militaire méritent une correction sémantique ou une justification.

## 8. SEO technique

Le domaine confirmé par README, canoniques et registre est `https://thot-culture.github.io/Thot/`. Aucun domaine ni changement d'URL proposé. Absence de CNAME confirmée via l'API GitHub (404 du fichier).

Contrôleur statique : titres uniques par page, meta descriptions présentes, un H1, canoniques et og:url cohérents, JSON-LD parsables, sitemap couvrant les pages indexables, 404 noindex hors sitemap. La syntaxe JSON-LD ne constitue pas une validation de l'éligibilité aux résultats enrichis Google.

`robots.txt` est présent sous /Thot/, mais Google lit le robots à la racine de l'hôte `/robots.txt`. Ne pas prétendre que ce fichier de projet pilote à lui seul l'exploration du domaine. Son absence à la racine n'interdit pas l'indexation ; le sitemap peut être soumis dans Search Console. Accès Search Console et indexation Google réelle non vérifiés.

Les anciennes pages Explorer retirées retournent 404 dans l'aperçu ; ne pas les rediriger toutes arbitrairement. Une stratégie 301 demanderait une correspondance éditoriale et une capacité d'hébergement qui ne sont pas établies ici.

## 9. Éditorial et publication

Les six notices éditoriales et cartes de bibliothèque sont présentes. Aucun article ni fait historique ou scientifique n'a été modifié. Le registre indique honnêtement que certaines sources Roubaix restent accessibles par notice et que l'actualité iranienne n'a pas été réévaluée. Le quiz ne dispose que de 24 questions vérifiées sur 300 et d'une question signalée à réexaminer dans son registre ; aucune fiabilité exhaustive ne peut être annoncée.

Deux incohérences confirmées : l'accueil nomme Autorité (23 octobre) « Dernière publication », malgré Stratégies militaires (27 octobre) ; la carte Roubaix affiche 9 minutes contre 8 dans le registre généré. Le générateur ne reconnaît pas les cartes de classe `discovery-card__link` dans sa regex actuelle : son --check ne détecte donc pas cette durée périmée.

La page de mentions légales annonce explicitement des informations à compléter, et la page contact ne fournit pas de canal privé validé. Ce sont des décisions d'éditeur à traiter, sans inventer d'identité ou d'adresse. Ce rapport technique ne délivre pas de validation juridique.

## 10. Inventaire des défauts — phase A

| ID / gravité | Fichier et reproduction | Conséquence / origine | Correction recommandée |
| --- | --- | --- | --- |
| A01 — P1 | `scripts/check-editorial.py`, lancer sans argument ; échec sur quiz-autrices | Comparaison avant/après asymétrique, contrôle de conservation inexploitable ; préexistant sur main | Réparer la portée de comparaison et tester qu'une modification de texte est effectivement détectée ; conserver les références historiques |
| A02 — P1 | `scripts/test-site-browser.cjs`, dépôt /workspace/Thot ; profil résolu dans /work | Arrêt avant sauvegarde et parcours complet ; code préexistant | Profil via `mkdtemp(os.tmpdir())`, nettoyage ensuite, relancer toute la recette |
| A03 — P2 | Accueil, carte Roubaix 9 min ; registre 8 min | Métadonnées incohérentes et --check aveugle ; préexistant | Corriger la détection des cartes dans le générateur, régénérer et vérifier les cartes |
| A04 — P2 | Accueil, label « Dernière publication » sur Autorité | Information datée erronée ; préexistant | Garder la sélection éditoriale et libeller simplement « À la une », ou sélectionner automatiquement le plus récent |
| A05 — P2 | Roubaix `.thot-document-overline`, axe color-contrast 4,22 | WCAG 1.4.3 insuffisant ; comparaison CSS avec main à compléter | Assombrir uniquement ce libellé, vérifier avec axe |
| A06 — P1 | Ajout d'article : HTML, registre, bibliothèque, accueil, sitemap à synchroniser | Risque d'oubli à cadence bihebdomadaire | Petit synchroniseur ou validation d'inventaire, guide et CI active |
| A07 — P2 | Recettes historiques, lancer les cinq suites listées ci-dessous | Échecs préexistants dus aux références de périmètre et à l'ancien retrait | Documenter leur statut historique, conserver leurs assertions, compléter une recette actuelle indépendante |
| A08 — P2 | `mentions-legales.html` et `contact.html` | Informations non validées par l'éditeur | Décision humaine, aucun renseignement inventé |
| A09 — P2 | Références externes refusées, contrôle HTTP partiel | Accessibilité documentaire incertaine | Contrôler dans un navigateur public, conserver DOI/notices et accès alternatifs prouvés |
| A10 — P3 | Atlas 606 Ko et PNG Aral volumineux | Risque sur téléphone, effet réel non mesuré | Mesurer avant d'optimiser ; conserver les originaux et licences |
| A11 — P2 | Frise militaire H2 vers H4 | Hiérarchie de titres sautée | Passer les titres de niveau immédiat en H3 dans la source, vérifier le rendu et le contenu |

Aucun P0 confirmé. Les P1 ci-dessus doivent être résolus ou explicitement levés avant un verdict de stabilisation positif.

## 11. Corrections — phase B

En attente de validation. Aucun correctif non testé n'est présenté ici comme acquis.

## 12. Tests effectivement exécutés avant corrections

| Commande / groupe | Résultat |
| --- | --- |
| `node scripts/check-site.mjs` | PASS |
| `node scripts/check-home.mjs` | PASS, couverture limitée à cinq articles d'accueil |
| `python scripts/site_chrome.py --check` | PASS |
| `python scripts/build-explorer-reconstruction.py --check` | PASS |
| `python scripts/test-portabilite.py` | PASS sur Linux |
| Les onze `scripts/test-*.mjs` présents | PASS, DOM simulé |
| `python scripts/test-article-editorial.py` | PASS |
| `python scripts/check-editorial.py` | FAIL sur main et PR #22 |
| `python scripts/test-stabilisation.py` | FAIL sur main et PR : ancien nombre de pages |
| `python scripts/test-strategies-static.py` | FAIL sur main et PR : périmètre depuis 5231c61 |
| `python scripts/test-explorer-reconstruction.py` | FAIL sur main et PR : conservation historique |
| `python scripts/test-explorer-finitions.py` | FAIL sur main et PR : conservation historique |
| `python scripts/test-explorer-recette-finale.py` | FAIL sur main et PR : conservation historique |
| Contrôleur navigateur indépendant, 18 × 5 | 90 contrôles dimensions/menu/erreurs PASS ; contraste Roubaix signalé |
| `python scripts/test-explorer-http.py --origin http://127.0.0.1:8765` | PASS, 116 URL |
| `test-site-browser.cjs` | FAIL global ; pages/Atlas PASS, profil persistant inaccessible |
| HTTP externe | Partiel, aucun résultat global de succès |

Les six échecs de scripts statiques ont été rejoués depuis un worktree détaché de main. Aucun test en échec n'a été modifié pour le faire passer.

## 13. Limites et éléments encore à résoudre

Panne d'environnement avant les retests ; captures non inspectées ; aucun score Lighthouse ; aucun téléphone physique, Safari, Firefox ou lecteur d'écran réel ; pas d'indexation Google observée ; HTTP externe incomplet ; qualification scientifique/historique de chaque phrase hors de portée. Les erreurs de certificat des images dans le navigateur local relèvent de l'environnement et doivent être levées avant d'évaluer leur rendu.

## 14. Maintenance recommandée

À chaque article : article source, notice éditoriale, image et droits, bibliographie, synchronisation du catalogue et sitemap, contrôles statiques, aperçu /Thot/, recette mobile et clavier. Sur chaque PR : génération déterministe Linux/Windows et suites de fonctionnement ; périodiquement : navigateur, accessibilité et liens externes. À chaque changement d'animation : réduction des mouvements et performance mesurée. Ne pas réécrire les originaux documentaires ni les URL publiques pour obtenir un meilleur score.

## 15. Verdict provisoire

**NON, à ce stade du diagnostic : la stabilisation n'est pas encore démontrée.** Deux contrôles P1 restent défectueux et le processus de publication doit être fiabilisé ; les corrections et leurs retests ne sont pas terminés. Ce verdict doit être réévalué sur preuves après la phase B, sans confondre une interruption d'environnement avec une panne du site public.
