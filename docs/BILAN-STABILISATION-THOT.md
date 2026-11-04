# Bilan de stabilisation THOT — 4 novembre 2026

## 1. Verdict et portée

**THOT EST-IL PRÊT À PASSER EN PHASE DE PRODUCTION ÉDITORIALE ET DE DÉVELOPPEMENT SEO ?**

**OUI AVEC RÉSERVES pour la version consolidée proposée.** Les six articles, les jeux et Explorer sont conservés ; les parcours et deux publications successives ont été vérifiés. Deux corrections finales traitent la stabilité des relations sauvegardées d'Aral et la hiérarchie des titres de la frise militaire. Aucun défaut technique bloquant connu ne reste dans les contrôles locaux de cette version.

**Ce verdict n'est pas une déclaration de mise en production.** Les trois PR sont non fusionnées et le site public correspond toujours à l'ancien `main`. Toute fusion et tout déploiement attendent une autorisation explicite. La clôture complète demande aussi les décisions d'éditeur sur les mentions légales et le contact, la revue documentaire ciblée et la vérification du site après sa publication réelle.

## 2. État réel des PR et consolidation

[État initial récupéré via GitHub](stabilisation/etat-initial.json), distinct des rapports historiques :

| Référence | SHA récupéré | Destination / état initial |
|---|---|---|
| `main` | `86ee7cbb27172262eca3648afe51cb7d2a81eab8` | Version publique, inchangée |
| [#22 — harmonisation](https://github.com/thot-culture/Thot/pull/22) | `c7b62ad61c5ddabc63c61560175a55c85ec80200` | Vers `main`, ouverte, brouillon, sans conflit |
| [#23 — stabilisation](https://github.com/thot-culture/Thot/pull/23) | `2cae9b575b70f58c14c75ff1a9ca11cc213ca101` | Vers la branche de #22, ouverte, brouillon, sans conflit |
| [#24 — SEO](https://github.com/thot-culture/Thot/pull/24) | `069e2ef41267807fac8ed2466550fac9fafb1d48` | Vers la branche de #23, ouverte, brouillon, sans conflit |

Les trois PR ont été passées de brouillon à **prêtes pour la revue**, avec leurs destinations conservées et sans fusion. Les descriptions de #22/#23/#24 sont actualisées ; en particulier, #23 ne présente plus ses anciennes recettes comme encore inachevées.

Les derniers workflows des trois SHA étaient réussis au départ : ce constat a été récupéré, **puis complété par de nouveaux tests de la version combinée**. Les six documents demandés ont été lus et confrontés aux sources et aux sorties des générateurs. Leurs mesures historiques restent attachées à leurs dates et SHA ; elles ne valent pas validation automatique de ce complément.

La branche locale `work/finalisation-thot-20261104` part du SHA de #24. Son complément est destiné à **la même PR #24**, sans quatrième PR. #24 contient déjà tous les commits de #23 ; #23 contient ceux de #22 ; #22 descend de `main`. Aucun cherry-pick, squash, rebase ou force push n'est nécessaire.

Fichiers modifiés initialement : 23 dans #22, 53 dans #23, 37 dans #24. Les recouvrements sont de 20 fichiers entre #22/#23, 9 entre #22/#24 et 15 entre #23/#24, notamment la coque, les pages HTML, les workflows et la publication. Ils représentent des évolutions successives dans une même ascendance. Les listes sont conservées dans le relevé ; les simulations de fusion et la comparaison des arbres vérifient la conservation du résultat.

## 3. Corrections finales, sans refonte

| Correction | Cause et modification minimale | Validation |
|---|---|---|
| Persistance Aral | `sanitize()` remplaçait les ID des relations par `l0`, `l1`… à chaque chargement, alors que leur création utilise un ID stable différent. Selon le délai de sauvegarde, l'assertion de persistance pouvait passer ou échouer. Les notes restaient présentes. Les ID valides sont désormais conservés ; les ID invalides/dupliqués sont réparés sans retirer les relations | Comparaison de l'état complet et de la chaîne stockée, rechargement, arrêt/réouverture du navigateur, onze pièces et quiz conservé ; cas supplémentaire de sauvegarde altérée |
| Frise militaire | Six fiches H4 directement sous un H2 deviennent H3. Leur texte, ordre et activités restent identiques. La règle CSS ciblée conserve 18 px sur mobile et ordinateur, y compris face à la règle mobile générale des H3 | Six titres × deux largeurs : polices, marges et dimensions identiques ; captures avant/après ; contrôle SEO sans avertissement |
| Conservation stricte | Les comparateurs doivent reconnaître ces seuls changements de niveau, tout en détectant une modification du texte | Manifeste de six fragments ; transformation limitée H4→H3 avec texte strictement identique et occurrence unique ; tests négatifs sur un fait et sur un titre inventé |
| Deux publications successives | Les tests précédents séparaient métadonnées et carte ; la chaîne complète doit être éprouvée avec tous les anciens articles | Nouvelle recette dans une copie temporaire, génération réelle, contrôles statiques et navigateur, puis suppression de la copie |
| Consignes d'intégration | Une phrase de stratégie suggérait encore #22 puis #23 puis SEO | Guide et stratégie alignés sur #24→#23→#22→main ; aucun merge exécuté |
| Exécution Lighthouse | Le script utilisait uniquement le navigateur téléchargé par Playwright | Respect de `THOT_BROWSER_EXECUTABLE`, comme les autres recettes ; aucun changement pour les lecteurs |
| Sortie CLI Windows | `site_chrome.py` n'importait pas le réglage d'encodage commun ; la nouvelle recette capturée échouait sur les accents Windows-1252 | Import du réglage UTF-8 existant ; décodage explicite testé avec `PYTHONIOENCODING=cp1252`, sans désactiver la recette |
| Fins de ligne Windows | Le générateur de durées réécrivait les anciens articles en CRLF sous Windows, au lieu des LF du dépôt ; leur texte était identique mais pas leurs octets | Sorties HTML éditoriales/Explorer et durées explicitement en LF ; la comparaison octet par octet des anciennes pages reste active |
| Nom accessible de la découverte | Lighthouse signale que « Surprends-moi » n'est pas repris dans le nom accessible des liens de découverte | Libellé visible conservé et repris dans l'aria-label, sur accueil et bibliothèque ; contrôle navigateur ajouté sans modifier le tirage |

Les pages Explorer ont été reconstruites depuis leurs sources après modification du contrôleur Aral ; le chemin de cache JavaScript est actualisé. La feuille militaire reçoit une version de cache explicite. Aucun fichier géographique, tracé de carte, média documentaire, source bibliographique, date historique ou banque de questions n'est changé.

## 4. Contenus et identité préservés

Les six articles restent présents : Autorité, Autrices et pseudonymes, Pieuvres, Puissance américaine, Roubaix 1917 et Évolution des stratégies militaires. Leurs références, images, légendes, nuances et activités ont été conservées.

- `check-conservation.py` réussit contre `main` **et** contre le SHA initial de #24. Les seules normalisations sont celles documentées : durées, réparation Oxford déjà approuvée et six niveaux de titre.
- [Comparaison complémentaire](stabilisation/conservation.json) : 15 blocs `main` sur 18 strictement identiques à #24 initiale ; les trois autres ne changent que les six niveaux de titre et les deux noms accessibles de découverte. Les données structurées des articles et les 300 questions restent protégées. [Comparaison des questions, médias et corpus géographiques à main](stabilisation/corpus-conserves.json).
- La feuille `assets/visual-system.css` est identique à celle de #22. Le logo ibis, les couleurs, la navigation, les pieds de page et la typographie sont conservés.
- [Planches à 390 px](stabilisation/planches-390.jpg) et [1440 px](stabilisation/planches-1440.jpg), couvrant les 18 pages. [Frise avant](stabilisation/frise-avant-390.png) / [après](stabilisation/frise-apres-390.png) ; [comparaison des styles aux deux largeurs](stabilisation/titres-comparaison.json).

La présence et l'accessibilité d'un contenu ne prouvent pas sa véracité scientifique : aucune revalidation exhaustive des faits n'est revendiquée.

## 5. Tests nouveaux de la version consolidée

| Vérification réellement exécutée localement | Résultat / preuve |
|---|---|
| 31 commandes statiques et de conservation | Toutes réussies ; [commandes, codes de retour et sorties](stabilisation/verifications-locales.json) |
| Générateurs : éditorial, bibliothèque/sitemap, durées, Explorer et coque | Sorties à jour et idempotentes ; chemins `/Thot/` conservés |
| SEO | 18 pages, 0 erreur et 0 avertissement ; 17 canoniques indexables, 404 exclue ; titres/descriptions, H1, JSON-LD, auteur/dates/images et liens vérifiés |
| Tests SEO / publication | 12 tests SEO et 9 tests de publication réussis, dont mutations de conservation et six changements de niveau bornés |
| Contrôle éditorial | 7 tests réussis ; le contrôle historique optionnel `--head` n'est pas activé et n'est pas compté comme exécuté |
| Onze suites JavaScript | Activités, navigation, partage, recherche/filtres, quiz et défi quotidien réussis |
| Tests spécialisés | Pieuvres, comparateur de puissance, document Roubaix et contenu militaire réussis ; le mode militaire `--content-only` ne valide pas son ancien périmètre global |
| Navigateur et axe | **18 pages × 5 largeurs = 90 vues**, 320/390/768/1024/1440 ; aucune exception inattendue, erreur HTTP locale ou violation axe détectée ; [rapport](stabilisation/navigateur.json) |
| Deuxième recette native | **90 vues**, Atlas et contrôles mobiles ; **270 URL et 157 ancres** ; sauvegarde Aral, ID stables, récupération d'ID altérés, redémarrage et reset sans perdre le quiz ; [rapport](stabilisation/recette-native.json) |
| Parcours complets | Recherche depuis l'accueil, accents, filtres combinés, état vide/reset ; quiz et défi jusqu'aux résultats ; activités des six articles ; cartes/parcours/documents Atlas ; onze pièces Aral, relation, conclusion et révision |
| Chargement lent et sans JS | Cinq gabarits avec scripts externes retardés de 1,2 s : position du main stable. Banque quiz indisponible : notice réelle et démarrage désactivé. Sans JS : navigation et reflow sur les 18 pages à 320 px |

Les validations distantes après les corrections Windows sont réussies au SHA **`986a3ac9f4cac1349fb371c9883a6ebc32a68213`** : [génération Linux/Windows 41827276320](https://github.com/thot-culture/Thot/actions/runs/41827276320) et [audit navigateur Linux/Windows 41827276369](https://github.com/thot-culture/Thot/actions/runs/41827276369). Les quatre jobs sont terminés avec succès ; [relevé des statuts](stabilisation/validations-github.json), [90 vues et axe en CI](stabilisation/navigateur-ci.json), [90 vues et stockage natif en CI](stabilisation/recette-native-ci.json). Aucune image n'est signalée cassée dans ce passage CI, sans erreur de certificat du proxy local.

Le complément de noms accessibles de découverte est vérifié dans [quatre états navigateur avec la règle axe ciblée](stabilisation/noms-accessibles.json). Les vérifications du dernier SHA sont à consulter dans [#24 / checks](https://github.com/thot-culture/Thot/pull/24/checks) ; elles sont contrôlées avant livraison et devront encore être contrôlées sur les nouveaux SHA après chaque fusion autorisée.

Navigateur local : Chromium **155.0.8059.79**, Playwright 1.64.1, Linux. Les gestes tactiles sont simulés. Les scripts CI conservent leurs versions épinglées et leurs vrais runners Linux/Windows. Aucune affirmation de test Safari/macOS, Firefox, téléphone physique, lecteur d'écran ou conformité WCAG complète.

**Limite réseau constatée :** six ressources d'images externes échouent dans Chromium local avec `ERR_CERT_AUTHORITY_INVALID` lié à la confiance du proxy ; les détails figurent dans les échecs de requêtes du rapport. Les GET Python avec validation TLS répondent 200 sur ces ressources. Les contrôles de mise en page et de fonctionnement ne sont pas transformés en validation du rendu de ces photographies manquantes. Les replis et textes restent visibles ; contrôler les images dans les preuves CI puis sur le site publié depuis un navigateur ordinaire. Aucune vérification TLS n'a été désactivée.

### Deux publications, pas seulement un ajout isolé

[Recette statique](stabilisation/publication-statique.json) et [recette navigateur](stabilisation/publication-navigateur.json) :

1. Copie complète temporaire des sources, indépendante du site servi au public.
2. Création d'une première page, notice `authored`, auteur, dates, références et PNG 1200×630 de test.
3. Quatre générateurs réels, puis leurs modes `--check`, contrôle SEO et contrôle des liens.
4. Canonique, title/description, Article/OG, image, référence et dates cohérents ; carte unique et sitemap avec `lastmod` ; **725 mots / 4 min** calculés.
5. Même chaîne pour une seconde publication ; la première reste intacte, comme les six articles préexistants.
6. Recherche réelle → carte → article, image et référence, menu/clavier aux largeurs 390/1440 après chaque publication.
7. Copie et fichiers de test supprimés automatiquement. Aucun faux article n'est dans le dépôt ou en ligne.

Dans la copie uniquement : six→sept→huit articles et 17→18→19 URL de sitemap. Le site proposé conserve **six articles et 17 URL indexables**. La recette fait désormais partie des contrôles portables et sa variante navigateur du workflow d'audit.

### Erreurs conservées et corrigées

L'[échec initial de persistance](stabilisation/persistance-erreur-initiale.txt) est conservé ; l'assertion n'a pas été supprimée. Les fixtures de recette ont aussi été corrigées : image responsive avec les classes communes, et injection d'une sauvegarde altérée au début du nouveau document pour éviter son écrasement normal par `pagehide`. La règle mobile des H3 a été prise en compte avant validation visuelle. Ces essais intermédiaires ne sont pas présentés comme des réussites.

Le premier passage distant de ce complément a aussi signalé l'encodage CLI Windows dans la nouvelle recette de publication ([run 41825540433](https://github.com/thot-culture/Thot/actions/runs/41825540433)). La source CLI est corrigée et le contrôle d'encodage renforcé ; ce run initial reste enregistré comme échec, distinct des validations après correction.

Le passage suivant ([41826569878](https://github.com/thot-culture/Thot/actions/runs/41826569878)) a détecté les fins de ligne différentes lors de la conservation binaire des anciens articles sous Windows. Les écritures sont uniformisées en LF ; aucun texte n'est exclu du comparateur pour contourner cet échec.

## 6. Performances mesurées

Mesure de clôture sur un runner GitHub Actions, commit `986a3ac…`, run 41827276369 : **Lighthouse 12.8.2, Chromium 151.0.7922.34, téléphone/réseau simulés, HTTP local non compressé sous `/Thot/`**. Un passage froid par gabarit, pas des performances réelles des visiteurs. [Résultats CI](stabilisation/performances-ci.json), sans runtimeError Lighthouse.

| Gabarit | Performance /100 | LCP (s) | CLS | TBT (ms) |
|---|---:|---:|---:|---:|
| Accueil | 99 | 1,80 | 0,000 | 0 |
| Autorité | 96 | 2,71 | 0,000 | 0 |
| Pieuvres | 93 | 3,17 | 0,031 | 0 |
| Atlas Rome | 74 | 4,48 | 0,000 | 0 |
| Enquête Aral | 91 | 3,45 | 0,000 | 0 |
| Quiz | 96 | 2,62 | 0,000 | 4 |

Accessibilité et SEO Lighthouse : 100 sur les six gabarits, sans certification WCAG ni garantie de classement. Les bonnes pratiques sont à 79 sur accueil/Pieuvres, avec notamment les cookies tiers Wikimedia ; aucun outil publicitaire ou de collecte n'est ajouté par THOT. Le diagnostic expérimental des noms de cartes complexes reste à relire avec des outils d'assistance réels ; il ne doit pas être transformé en conformité globale à partir des seuls scores.

Un passage local distinct, **Lighthouse 13.6.0 / Chromium 155**, est aussi conservé dans [performances.json](stabilisation/performances.json) : 99/96/99/76/91/96. Le proxy local y empêche certaines photographies externes de charger ; ces nombres ne démontrent donc aucun gain sur l'accueil ou Pieuvres. Les versions et conditions diffèrent : ne pas mélanger les deux séries.

L'Atlas reste à **74/100 et LCP 4,48 s** dans la mesure CI non compressée ; sa géométrie et ses documents sont inchangés. La production est déjà compressée, comme l'a vérifié l'audit SEO. Mesurer le site publié et les données terrain lorsqu'elles existent avant d'envisager un chantier géographique. Aucun INP, CrUX ou Core Web Vitals réel de visiteurs n'est revendiqué. TBT n'est pas INP.

## 7. Derniers problèmes, classés

### Bloquants

- **Corrigé avant proposition finale :** instabilité des ID de relations Aral, avec comparaison de stockage intermittente. La recette renforcée passe après correction.
- **Aucun défaut technique bloquant connu restant** dans les contrôles actuels de la version consolidée. Les validations distantes du dernier SHA et l'absence de conflit restent obligatoires avant chaque fusion.
- **Autorisation absente :** toutes les fusions et le déploiement restent en attente, conformément à « Ne fusionne rien sans mon autorisation explicite ».

### À corriger prochainement / décisions d'éditeur

| Sujet | Constat réel et prochaine action |
|---|---|
| Mentions légales | Page explicitement partielle. L'éditeur doit déterminer son régime et les mentions applicables, confirmer les informations d'hébergement et les coordonnées requises. Ne pas considérer le site juridiquement finalisé avant cette validation ; aucune identité supposée ajoutée |
| Contact privé | Pas d'adresse configurée ; canal public GitHub fonctionnel et clairement annoncé. L'éditeur doit choisir un canal privé et les informations destinées à publication avant sa mise en place ; ne pas utiliser une issue publique pour des données personnelles |
| Puissance américaine | Passages sur l'Iran datés d'octobre 2026, sources Reuters refusant l'accès automatique. Relecture factuelle et chronologique avant promotion ou actualisation de cette page ; autres articles publiables indépendamment |
| Quiz, étymologie du café | La question incertaine existe bien parmi les 300 ; registre cohérent : 24 vérifiées, 275 non réexaminées, 1 à revoir. L'Académie ne justifie pas le rattachement à Kaffa dans la notice citée. Décision éditoriale documentée nécessaire ; aucune réponse réécrite, aucun statut « vérifié » inventé |
| Sources externes | Nouveau passage : 214 URL, 192 réponses 200, 15 refus 403, 2 refus 401, 2 réponses 503, 1 erreur réseau et 2 réponses 404 attendues (robots racine et URL inconnue). [Détails](stabilisation/liens-http.json). Vérifier humainement les notices difficiles ; 403/401/503 ne prouvent pas une URL inexistante |
| Images externes / Atlas | Vérifier le chargement hors proxy et la performance publique après publication ; ne pas modifier cartes, licences ou originaux pour gagner quelques points de laboratoire |
| Search Console | Accès au compte non utilisé. Propriété de préfixe `https://thot-culture.github.io/Thot/`, balise réelle à vérifier par son propriétaire, sitemap exact à soumettre. Pas de chiffre d'indexation inventé |

### Facultatifs ou dette d'outillage identifiée

Les six scripts historiques ci-dessous **échouent encore dans leur exécution complète**, sur `main` comme sur la version consolidée. Leurs sorties sont conservées dans [tests-historiques.json](stabilisation/tests-historiques.json). Aucun n'est annoncé comme réussi dans son intégralité.

| Script | Échec reproduit / traitement |
|---|---|
| `check-editorial.py` | Exclusions asymétriques de `site-parcours`, échec sur `quiz-autrices.html` même sur main ; contrôle complet actuel par `check-conservation.py`, avec tests de mutation |
| `test-stabilisation.py` | Inventaire figé à 11 pages, incompatible avec les 18 pages actuelles ; inventaire/liens/générateurs vérifiés par les contrôles courants |
| `test-strategies-static.py` | Périmètre global figé depuis `5231c61` ; ce périmètre reste en échec. Son mode préexistant `--content-only` passe, avec toutes ses assertions de contenu/médias et l'ajustement strict des six niveaux de titre |
| `test-explorer-reconstruction.py` | Conservation globale d'un ancien socle, échec dès le workflow modifié |
| `test-explorer-finitions.py` | Même type de conservation globale ancienne, échec sur le workflow |
| `test-explorer-recette-finale.py` | Même type de périmètre figé, échec sur le workflow |

Ces invariants décrivent des opérations historiques incompatibles entre elles ou avec la structure actuelle. Ils ne sont pas désactivés ou transformés en succès ; les activités, corpus, images, textes et sorties actuelles ont leurs contrôles actifs. Leur modernisation exhaustive n'est pas nécessaire pour cette intégration et ouvrirait un chantier d'outillage supplémentaire. La conservation et les suites actives doivent rester obligatoires.

Autres améliorations facultatives : liens thématiques proposés dans la stratégie, réduction ciblée des chargements inutiles, essais sur appareils et lecteurs d'écran réels. Aucune nouvelle fonctionnalité majeure n'est ajoutée.

## 8. Ordre exact des fusions, après autorisation seulement

**Ne pas fusionner #22 en premier.** La séquence préparée est :

1. **#24 → `work/audit-final-thot-20261103`**, branche source de #23. Conserver les commits avec « Créer un commit de fusion » ; pas de squash/rebase. Attendre et vérifier les checks de #23 sur son **nouveau SHA**.
2. **#23 → `work/harmonie-visuelle-20261103`**, branche source de #22. Attendre et vérifier les checks de #22 sur son **nouveau SHA**.
3. Juste avant la dernière étape, vérifier que `main` correspond toujours au SHA publié attendu, créer une branche de sauvegarde sur ce SHA et vérifier les paramètres GitHub Pages.
4. **#22 → `main`**, par commit de fusion, uniquement après autorisation explicite. Cette étape peut déclencher le déploiement automatique Pages ; une fusion vers main et son déploiement ne sont donc pas indépendants dans cet hébergement.

Garder les branches sources jusqu'à la validation publique. Si main ou une source a changé, recalculer l'ascendance, les conflits et les tests ; ne pas pousser de force. Les simulations Git ne modifient aucune branche distante et ne remplacent pas les nouveaux checks après les vraies fusions.

Les améliorations visuelles, menus stabilisés, réservations d'espace, correction de durées, descriptions de partage et outils de publication deviendront publics ensemble à la dernière étape. Les URL, les six articles, les références et la structure pédagogique restent conservés. Les outils de génération sont destinés à la publication éditoriale, pas à l'exécution chez les lecteurs.

## 9. Validation du déploiement et retour arrière

Après autorisation et fusion réelle, attendre un workflow **GitHub Pages réussi sur le SHA de main attendu**. Un push ou une CI de PR réussie ne suffit pas. Puis :

1. Ouvrir `https://thot-culture.github.io/Thot/` et la bibliothèque ; rechercher un article, combiner/effacer les filtres, ouvrir les six articles.
2. Vérifier le logo, menu mobile (Entrée/Échap/focus), boutons, images/crédits, textes, sources et console ; tailles 320 et 390 px puis ordinateur.
3. Terminer un quiz et un défi ; ouvrir Explorer, manipuler les états/parcours de l'Atlas et ses documents.
4. Dans Aral : ajouter plusieurs pièces et une relation, recharger puis redémarrer le navigateur ; vérifier relation, notes et quiz conservés, puis le reset ciblé.
5. Vérifier les 17 URL indexables, le sitemap, canoniques, title/description, OG/Article et ressources ; une URL inconnue doit répondre 404. Le robots à la racine de l'hôte reste distinct de `/Thot/robots.txt`.
6. Exécuter `python scripts/audit-seo-public.py --output work/validation-production.json` après récupération des références distantes ; comparer les corps des 18 HTML à la version effectivement fusionnée. Tester manuellement les ressources tierces, même si leurs GET répondent 200.
7. Inspecter les articles prioritaires dans Search Console depuis le compte autorisé, soumettre `https://thot-culture.github.io/Thot/sitemap.xml`, puis suivre l'indexation réelle. Aucun audit ne la garantit.

**Retour arrière préparé, non exécuté :** préserver le SHA de main avant fusion dans `backup/avant-integration-thot-20261104` (vérifier d'abord que ce nom n'existe pas avec un autre contenu). En cas de régression importante publiée, ouvrir une branche de correction depuis main et une PR de retour arrière. Si la fusion finale est un merge commit, `git revert -m 1 SHA_DU_MERGE_FINAL` annule son apport en conservant l'historique. Faire relire, tester, autoriser cette PR, puis contrôler le déploiement correctif et le site public. Ne pas utiliser reset/force push sur main. Si le mode de fusion diffère, identifier les commits à annuler avant toute commande ; ne pas appliquer aveuglément `-m 1`.

## 10. Ce que l'éditeur doit encore faire

- Relire les trois PR et ce bilan, puis autoriser explicitement les trois fusions et le déploiement selon l'ordre préparé.
- Décider des mentions légales applicables et du canal privé ; fournir uniquement les informations validées destinées à publication.
- Planifier la revue de la page Puissance américaine, de l'étymologie du café et des sources difficiles, sans retarder les autres sujets bien documentés.
- Effectuer la validation publique après le déploiement autorisé, puis connecter ou vérifier Search Console avec son compte.
- Pour chaque article : une source HTML, une notice JSON, des médias documentés, génération, contrôles et relecture en PR. La bibliothèque et le sitemap suivent automatiquement ; l'accueil reste une sélection éditoriale facultative.

Le [guide de publication](../GUIDE-PUBLICATION-ARTICLES.md), le [tutoriel Search Console](GOOGLE-SEARCH-CONSOLE.md), la [stratégie et ses dix pistes](STRATEGIE-SEO-THOT.md) et le suivi hebdomadaire restent les outils de travail. La priorité suivante est la qualité documentaire de deux articles par semaine et l'observation des données réelles, sans nouvelle refonte.
