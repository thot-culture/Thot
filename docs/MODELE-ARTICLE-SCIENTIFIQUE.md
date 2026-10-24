# THOT — Modèle scientifique et partage des articles

Les cinq articles utilisent des ajouts **HTML statiques** : ils restent lisibles sans JavaScript et ne nécessitent aucun service tiers. La fonction de partage est une amélioration progressive.

## Fichiers de référence

- `assets/article-editorial.json` : textes des repères, renvois numérotés, nature des sources, dates explicites et métadonnées sociales.
- `scripts/update-article-editorial.py` : insertion ou mise à jour des ajouts dans les articles existants. Il ne réécrit pas leur corps ni leurs références.
- `assets/article-editorial.css` : présentation limitée aux nouveaux composants et à la bibliographie des articles qui la chargent.
- `assets/article-share.js` : partage natif, copie du lien canonique et repli manuel.
- `scripts/generate-social-cards.py` et `docs/CARTES-PARTAGE.md` : modèle graphique et génération des cinq PNG sociaux.

## Ajouter ou réviser des repères

Dans `article-editorial.json`, chaque article possède un `slug`, une date `published`, une ancienne date `previous_modified`, des métadonnées `social`, une liste `known`, un titre `discussion_title`, une note `discussion_note`, une liste `discussion` et un dictionnaire `sources` indexé par les ancres existantes `ref1`, `ref2`, etc.

Un point utilise la forme suivante :

```json
{
  "text": "Une affirmation courte, vérifiée dans le document indiqué.",
  "refs": [1]
}
```

Chaque affirmation doit être vérifiée à partir de la source réellement consultée. Une page de catalogue ne vaut pas lecture d’un document ; un résumé scientifique ne vaut pas lecture de l’intégralité d’une étude. Consigner les limites de consultation dans le compte rendu éditorial.

Ne pas publier une formulation encore en attente de vérification. Distinguer observations, interprétations et causalité. Un résultat portant sur une espèce, un échantillon ou un protocole ne doit pas être étendu à tous les cas.

Le second volet peut s’intituler « Ce qui fait débat » lorsqu’une discussion entre chercheurs est documentée. Sinon, choisir « Ce qui reste incertain », « Ce qui reste à comprendre » ou « Ce que les documents ne disent pas », avec une note indiquant qu’aucune controverse précise n’est présentée dans les références mobilisées. Ne pas inventer deux camps pour remplir le composant.

## Qualifier une source sans changer son numéro

Chaque entrée garde son texte, son identifiant et ses liens. Le générateur ajoute un libellé `source-type` :

- `primary` : document, donnée ou recherche empirique originale ; préciser s’il s’agit d’un témoignage, d’une expérience, d’une loi ou d’un communiqué d’acteur.
- `secondary` : analyse, ouvrage ou synthèse ; une étude historique reste secondaire pour les événements qu’elle interprète.
- `complement` : notice, catalogue, dossier pédagogique, presse ou ressource de contexte.
- `mixed` : document décrit par une notice ; conserver explicitement cette médiation.

Une catégorie n’est pas un classement de fiabilité. Un communiqué est primaire pour la position de son auteur, sans démontrer l’adhésion de toutes les personnes concernées. Une recherche originale est primaire en sciences même si elle paraît dans une revue savante.

Une liste optionnelle `open_documents` peut fournir un accès libre au **même document** sans supprimer son DOI ou sa référence académique. Chaque entrée contient `title`, `url` et `ref`. La référence doit être vérifiée avant l’ajout. Ne pas fabriquer de lien d’archive absent.

## Dates : publication, ajout éditorial et validation

Les dates de publication initiale des cinq articles sont reprises des mentions déjà affichées et des données structurées de la version `37f17ee`. Elles ne sont pas calculées à partir de Git.

`editorial_updated` est une date de contenu explicitement choisie. L’intervention du 24 octobre 2026 ajoute des synthèses sourcées et la qualification des références ; son libellé visible précise cette portée. Ce n’est pas une déclaration de relecture intégrale de chaque article ni une date de certification scientifique. Les anciennes dates restent tracées dans les données ; Roubaix conserve aussi son ancien repère dans le bandeau, sous « Version antérieure ».

Une correction de style, de script ou de métadonnée seule ne justifie pas de changer la date éditoriale. Chaque article possède son propre `editorial_updated` ; il peut aussi préciser son propre `editorial_scope`. Pour les interventions futures limitées à un article, changer uniquement sa date et sa portée : ne pas dater les quatre autres comme s’ils avaient été révisés. Les valeurs générales du fichier servent de repli pour les entrées qui ne les déclarent pas.

Si la date initiale d’un futur article est inconnue, utiliser `published: null`, omettre `datePublished` du JSON-LD et conserver l’indication visible « Publication initiale : date non renseignée ». Ne pas remplir une date approximative. Le générateur n’interroge jamais l’horloge ni Git pour la créer.

## Intégration statique et partage

Le bandeau de partage reste utilisable sans JavaScript grâce au lien permanent. Le script révèle ensuite les boutons ; « Partager cet article » apparaît si l’API native existe et « Copier le lien » reste disponible. Une copie n’est annoncée qu’après résolution de l’API. En cas de refus ou d’absence, un champ nommé, en lecture seule, sélectionne l’URL pour la commande Copier de l’appareil.

Le script utilise exclusivement la canonique HTTPS du domaine courant, sous `/Thot/`, sans paramètres ni fragment. Une prévisualisation sous `localhost` conserve le lien permanent mais n’active pas les actions destinées à l’origine publique. Aucun partage n’est déclenché au chargement. Aucun réseau social ni bibliothèque externe n’est chargé.

Les métadonnées Open Graph et Twitter utilisent une image PNG locale publique, un titre fidèle, une description, un texte alternatif et des dimensions 1200 × 630. Le JSON-LD conserve ses informations existantes et utilise cette nouvelle image ; seules `image` et `dateModified` sont mises à jour par le générateur.

Les cartes sont des compositions typographiques et géométriques originales : elles ne représentent pas des photographies historiques. Elles ne sont pas insérées dans le corps des articles ; les lecteurs ne téléchargent pas un nouveau visuel de couverture. Les images, crédits et activités existants restent en place.

## Générer et vérifier

Depuis la racine du dépôt :

```sh
python3 scripts/generate-social-cards.py
python3 scripts/generate-social-cards.py --check
python3 scripts/update-article-editorial.py --write
python3 scripts/update-article-editorial.py --check
python3 scripts/test-article-editorial.py
python3 scripts/check-editorial.py
node scripts/test-article-share.mjs
node scripts/check-site.mjs
```

Le générateur HTML utilise uniquement la bibliothèque standard Python. Le rendu des PNG utilise Pillow et les polices documentées dans `CARTES-PARTAGE.md`, uniquement au développement. Le site reste statique et n’a pas de dépendance supplémentaire à l’exécution.

Pour un nouvel article, conserver le bandeau `.meta`, la canonique, un JSON-LD `Article` et une section `.sources` dont chaque entrée porte une ancre `refN`. Ajouter ses données et sa carte au modèle ; le script exige que toutes les références soient qualifiées. Mettre à jour l’inventaire des pages et les tests pour étendre explicitement leur périmètre.

Avant publication, exécuter aussi les suites existantes. Après le succès du workflow GitHub Pages, utiliser `scripts/check-published.py` pour vérifier les pages et leurs ressources réelles. Les tests DOM simulés et les contrôles statiques ne remplacent pas les essais au clavier, au lecteur d’écran et aux largeurs 320, 390, 768 et 1440 px dans un vrai navigateur.
