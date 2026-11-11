# Contrôles techniques courants

Prérequis : Node.js 22 ou ultérieur, Python 3.12, dépendances déjà déclarées dans
`requirements-tools.txt`, historique Git complet pour les comparaisons de corpus.

```sh
node scripts/validate.mjs
node scripts/validate.mjs --python python --revision SHA_DU_SOCLE
```

Le lanceur exécute 43 commandes sans installation ni réseau : contrôles des pages,
liens, scripts, quiz et activités, vérification des générateurs, publication de deux
articles en copie temporaire, portabilité, SEO et conservation des contenus.
Il fonctionne depuis un autre dossier et échoue si une commande échoue.
Les suites navigateur et les anciennes recettes de livraison sont distinctes.

`test-documentary-links.py` couvre les faux succès HTTP 200 (erreur Omeka,
maintenance, contrôle de navigateur), les PDF redirigés vers l'accueil et les
refus 401/403/429. Ces réponses exigent une relecture ; elles ne provoquent
aucun remplacement automatique. Il vérifie aussi l'inventaire des URL HTTP,
des sources JSON d'Explorer et des références du quiz chargées en JavaScript.

`python scripts/audit-final-links.py --output DOSSIER` effectue séparément des
GET en lecture seule et conserve titres, destinations et signaux de relecture.
`--inventory-only` n'utilise pas le réseau. Le statut `http-response-only`
ne certifie ni la correspondance bibliographique ni la disponibilité du texte
intégral. Les résultats externes doivent être recoupés au navigateur et avec
les identifiants des documents avant toute modification.

## Accueil et chemins de publication

```sh
node scripts/check-home.mjs
node scripts/test-check-home.mjs
node scripts/check-home.mjs --root DOSSIER_DU_SITE --base https://exemple.fr/
```

Sans option, l'accueil doit toujours déclarer sa vraie URL canonique
`https://thot-culture.github.io/Thot/`. `--base` permet de vérifier une fixture
publiée à la racine ; cette option ne transforme pas THOT en site déployable à
la racine, puisque la coque commune conserve ses liens `/Thot/`.

Les liens, scripts, feuilles de style et ressources CSS passent par le même
résolveur. Les URL CSS sont relatives à leur feuille ; paramètres et fragments
ne deviennent pas des noms de fichiers. Les contrôles d'origine, de préfixe,
de chemin lexical et de chemin réel précèdent les lectures. Les fichiers
externes ne sont pas téléchargés. Les chemins POSIX et Windows sont testés ;
le test réel de lien symbolique annonce explicitement un éventuel refus de l'OS.

## Recettes actualisées

- `test-stabilisation.py` compare exactement le sitemap XML aux pages présentes,
  vérifie le retrait des onze anciennes pages, la présence d'Explorer et la
  conservation des 300 questions avec les seuls amendements documentés. La suite
  du quiz remplace l'ancienne égalité binaire du moteur, incompatible avec ses
  corrections de démarrage.
- `test-explorer-reconstruction.py` conserve ses assertions de corpus, médias,
  licences et génération. Ses fixtures utilisent des types MIME déterministes
  pour les images et attendent le rendu par frame avant de mesurer l'Atlas.
  La conservation globale de la livraison du 26 octobre
  reste disponible avec `--historical` ; son échec sur les workflows actuels est
  attendu et ne doit pas être présenté comme une réussite.
- `test-current-checks.py` altère, en copie temporaire, une entrée du sitemap,
  une notice du quiz, un média et une licence, puis exige les échecs correspondants.
  Un cinquième cas contrôle la fixture en l'absence de type MIME WebP système.
  Six autres cas vérifient le texte principal, le JSON-LD, la présence de main,
  la séparation de la coque, le contenu Explorer et l'inventaire de production.
- `test-experience-browser.py` compare la remise à zéro au registre éditorial
  actuel et compte ses vues réelles ; son ancien total de cinq articles est obsolète.

## Navigateurs et anciennes livraisons

Les recettes HTTP existantes restent `audit-final-browser.cjs`,
`run-browser-recipe.py` et `test-publication-integration.py --browser`.
Elles nécessitent les dépendances navigateur déjà déclarées, Playwright Node,
axe-core pour l'audit et un serveur localhost accessible. Les scénarios Python
sur fixtures (`test-experience-browser.py` et les options `--browser` des recettes
d'articles et d'Explorer) n'établissent pas le fonctionnement HTTP.

Les quatre recettes auparavant en échec sont désormais obligatoires dans le lanceur :

- `check-editorial.py` garde la référence `c45c2a1`, les seuls amendements documentés,
  les crédits et les banques. Il compare main avec des exclusions symétriques et
  exige le schéma exact du WebPage ajouté au quiz. Les chemins Git utilisent `/`
  sur tous les OS. La coque commune relève du contrôle indépendant du générateur.
- `test-strategies-static.py` conserve le texte validé, les chapitres, activités,
  sources et empreintes, puis vérifie toute la production contre HEAD.
- `test-explorer-finitions.py --static-only` et
  `test-explorer-recette-finale.py --static-only` vérifient corpus, médias,
  licences et génération, ainsi que la production complète. La recette finale
  garde le contrôle des attributs HTML uniques. Sans `--static-only`, les parcours
  navigateur restent obligatoires ; ce drapeau n'annonce aucune réussite navigateur.

`production_checks.py --revision SHA` compare octet par octet tous les fichiers
servis (150 dans le socle du 5 novembre), avec détection des ajouts et suppressions.
La valeur par défaut HEAD protège la copie de travail contre des changements de
production ; elle ne prétend pas détecter une régression déjà présente dans HEAD.
Les comparaisons éditoriales et les empreintes documentaires gardent leurs socles
indépendants. Le test éditorial optionnel `--head SHA` utilise aussi cette garde
complète, au lieu d'un ancien périmètre de cinq pages antérieur à la coque commune.

La recette `test-preview-http.py` démarre son propre serveur et contrôle réellement
GET/HEAD, MIME, redirections, 404 et la suite HTTP des liens internes. Elle est séparée
du lanceur sans réseau. `run-browser-recipe.py` utilise également un port libre et
exige que les ressources servies correspondent aux fichiers du dépôt.

L'audit sans JS attend `load` : DOMContentLoaded peut précéder les CSS lorsqu'aucun
script ne bloque le parseur. Les assertions de débordement restent inchangées.

## Dépendances de mesure

La CI conserve Playwright 1.62.0, axe-core 4.10.3 et Lighthouse 12.8.2. Aucun paquet
runtime du site n'est ajouté. Installer ces outils dans un préfixe temporaire, puis
exposer son `node_modules` par NODE_PATH, comme dans `audit-final.yml`.
Le script Lighthouse réutilise Playwright pour lancer et fermer Chrome avec un
port CDP libre ; il n'importe plus directement chrome-launcher. Il conserve les
rapports bruts, les réglages mobiles, le poids transféré et un INP explicitement
non mesuré. Le TBT n'est pas une mesure d'INP terrain.

Les workflows décrivent les contrôles prévus. Une modification locale de YAML
ne constitue pas une exécution CI réussie : citer un run consultable avant de
revendiquer une validation Linux/Windows distante.

Un résultat axe sans violation reste un contrôle automatique limité. Il ne
certifie ni un lecteur d'écran réel, ni Safari/Firefox, ni les médias externes,
ni les performances ou les Core Web Vitals en production.
