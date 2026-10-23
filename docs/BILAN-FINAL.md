# COMPTE RENDU POUR CHATGPT — THOT

Audit technique des **10 pages** du site statique THOT, terminé côté code et tests
locaux le 23 octobre 2026, puis complété par une passe de navigation et de lecture.
Branche finale : `work/ameliorations-navigation-lecture`, depuis l’audit `e1033ee`.
Les versions précédentes restent dans l’historique
Git local et dans la sauvegarde de livraison. **La publication officielle de cette
version a désormais été explicitement autorisée par l’utilisateur.**

L’utilisateur a autorisé de poursuivre les améliorations sur l’ensemble du site.
Un accord explicite de publication sur GitHub Pages a ensuite été donné. La progression complète figure dans
[PROGRESSION.md](PROGRESSION.md). La nouvelle passe est détaillée dans
[AMELIORATIONS-NAVIGATION-LECTURE.md](AMELIORATIONS-NAVIGATION-LECTURE.md).

## Rapports par page

| Page | Compte rendu |
| --- | --- |
| Accueil | [AUDIT-ACCUEIL.md](AUDIT-ACCUEIL.md) |
| Bibliothèque | [AUDIT-BIBLIOTHEQUE.md](AUDIT-BIBLIOTHEQUE.md) |
| Notre méthode | [AUDIT-NOTRE-METHODE.md](AUDIT-NOTRE-METHODE.md) |
| Quiz | [AUDIT-QUIZ.md](AUDIT-QUIZ.md) |
| Jeu des autrices | [AUDIT-JEU-AUTRICES.md](AUDIT-JEU-AUTRICES.md) |
| Autorité | [AUDIT-AUTORITE.md](AUDIT-AUTORITE.md) |
| Autrices | [AUDIT-AUTRICES.md](AUDIT-AUTRICES.md) |
| Pieuvres | [AUDIT-PIEUVRES.md](AUDIT-PIEUVRES.md) |
| États-Unis | [AUDIT-ETATS-UNIS.md](AUDIT-ETATS-UNIS.md) |
| Roubaix | [AUDIT-ROUBAIX.md](AUDIT-ROUBAIX.md) |

## Résultat des dernières corrections

La dernière passe ajoute la recherche depuis l’accueil, des recherches et filtres
restaurables/partageables par URL, le sommaire repliable sur les cinq articles et
un accès clavier plus direct aux autrices dans les deux jeux. Les contrôles
ci-dessous portent sur cette version complète ; les rapports par page conservent
également les détails de l’audit précédent.

Les deux jeux des autrices partagent un moteur corrigé sans perdre leurs variantes
éditoriales. L’activité Autorité retrouve ses styles et ses trois scènes sur
mobile. Les commandes d’activités sont activées après initialisation. Les
glossaires restent lisibles sans JavaScript. Les cinq sommaires repliables
transfèrent le focus vers les sections. Les liens du pied de page ont un contraste
clair, les liens d’évitement sont utilisables et les images conservent leurs
proportions responsive.

Trois copies locales déjà documentées remplacent le chargement externe des mêmes
documents : George Sand, photographie de Shorabak et couverture ELD de Roubaix.
Aucune nouvelle image ni attribution n’a été inventée. Aucun article, fait
historique, source, crédit ou fonctionnalité n’a été supprimé. Aucune nouvelle
dépendance applicative n’a été ajoutée.

## Vérifications exécutées

Depuis le dossier du projet :

```sh
node scripts/check-site.mjs
node scripts/check-home.mjs
for test_file in scripts/test-*.mjs; do node "$test_file" || exit; done
python3 scripts/check-editorial.py
git diff --check
```

Tous passent. Le contrôle global compte **10 pages, 376 liens/ressources internes,
22 scripts, 5 JSON-LD et 300 questions**. Il contrôle fichiers/ancres, identifiants,
références ARIA, attributs alt, métadonnées, canonical, sitemap, catalogue,
syntaxe JavaScript/JSON et répartition des questions. Le détecteur a aussi été
validé sur une copie temporaire avec erreurs injectées (liens, ID, ARIA, JS,
JSON-LD et catalogue).

Les neuf scripts de tests couvrent les menus/recherche/découverte, quiz et
stockage/migration/UTC, associations, activités, glossaires, médias, sommaires,
comparateur et chronologies. Ils exécutent les vrais scripts dans un DOM simulé.
Les événements natifs, viewport, horloge et réseau y sont simulés.

Le comparateur éditorial vérifie les six dernières pages contre la révision
GitHub antérieure à l’audit `c45c2a193e9a366d95bdfb4ad0612ed1b80cce32` : tous
les mots du corps de page et les liens éditoriaux sont conservés, ainsi que les
alt et les JSON-LD. Seul le nouveau message technique de chargement est exclu.
Les textes, crédits, licences et notices du catalogue et les banques externes de
questions sont également conservés. Ce contrôle nécessite l’historique Git.

## Effets des fichiers partagés

- `article.css` : cinq articles et jeu des autrices ; évitement, navigation, pied
  de page et proportions des illustrations.
- `autrices-quiz.css` et `quiz-autrices.js` : jeu dédié et activité de l’article.
- `glossaire-interactif.js/.css` : États-Unis et Roubaix.
- `puissance-sommaire.js` : les cinq articles.
- `article-media.js` et `illustrations.json` : actuellement utilisés par Roubaix.

Cette passe modifie l’accueil, la bibliothèque, les cinq articles et le jeu des
autrices. Notre méthode et le quiz principal restent inchangés. Les URLs des
ressources concernées portent une révision pour éviter de
combiner le nouveau HTML avec un ancien script ou style mis en cache.

## Limites et recommandations restantes

**Aucun rendu réel ordinateur/mobile n’a pu être validé.** Chromium échoue au
démarrage (`setsockopt: Operation not permitted`, `SIGTRAP`). Aucun contrôle
lecteur d’écran, capture, tactile, HTTP externe, Lighthouse, LCP ou CLS n’est
revendiqué. Les adaptations responsive ont été examinées dans le code ; elles
doivent encore être confirmées visuellement. Les parcours visuels États-Unis et
Roubaix ont été relus mais n’ont pas de test d’exécution dédié.

Les photos encore externes et leurs notices restent dépendantes de leur hôte.
Deux portraits d’autrices n’ont pas de dimensions HTML explicites ; relever les
dimensions originales avant de les ajouter. La frise Roubaix montre son premier
événement sans JavaScript. Le stockage du quiz ne garantit pas de transaction
atomique entre des écritures strictement simultanées, limite déjà documentée.
Les faits historiques et droits des notices n’ont pas fait l’objet d’une nouvelle
validation éditoriale : leurs formulations et références ont été préservées.

À contrôler avant toute publication : chaque page à 320/390/768/1440 px, zoom
200 %, clavier seul, scripts désactivés, puis lecture d’écran et images/liens
externes. Effectuer ensuite les mesures de performance dans un navigateur réel.

## Consulter le résultat sans publier

Extraire `THOT-site-ameliore.zip`, ouvrir un terminal dans son dossier `Thot`, puis :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrir **http://127.0.0.1:8000/**. Les articles se trouvent dans `/articles/`.
Un serveur local est nécessaire pour charger le catalogue JSON des illustrations
Roubaix ; un simple double-clic en `file://` ne teste pas cette fonctionnalité.
Ce serveur est à lancer sur la machine de consultation ; aucun serveur accessible
publiquement n’a été démarré ici.

L’archive contient le site, les tests et les dix rapports. Le fichier
`THOT-site-ameliore.patch` contient les corrections cumulées depuis le snapshot
initial `main` (`93dd85f`). Le bundle `THOT-site-ameliore.bundle` conserve l’historique
et la branche finale ; pour le récupérer dans un nouveau dossier :

```sh
git clone -b work/ameliorations-navigation-lecture THOT-site-ameliore.bundle Thot-historique
```

## Publication officielle

L’utilisateur autorise explicitement la publication de l’ensemble de cette version.
GitHub Pages utilise `main` et la racine du dépôt : configuration API lue avec
HTTP 200 (`build_type: legacy`, `source: main /`, HTTPS forcé), confirmée aussi
par les logs du run `39929238094`. La branche distante de sauvegarde
`backup/thot-avant-publication-20261023-c45c2a1` conserve l’ancien site au commit
`c45c2a193e9a366d95bdfb4ad0612ed1b80cce32`. La mise à jour de `main` doit vérifier
ce SHA avant écriture pour préserver les modifications concurrentes.

Le déploiement sera contrôlé par un run Pages associé au nouveau commit et par
`scripts/check-published.py` sur les réponses publiques. Les rapports d’audit
précédents décrivent l’état avant publication ; la confirmation finale du
déploiement sera donnée dans le compte rendu de publication.

Les règles convenues pour les interventions futures sont conservées dans
[REGLES-PUBLICATION.md](REGLES-PUBLICATION.md).
