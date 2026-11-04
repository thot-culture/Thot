# GUIDE-PUBLICATION-ARTICLES

Compléments : [Search Console](docs/GOOGLE-SEARCH-CONSOLE.md), [stratégie et maillage](docs/STRATEGIE-SEO-THOT.md), [audit SEO](docs/AUDIT-SEO-THOT.md). Les automatismes décrits nécessitent l'intégration des PR de stabilisation et de préparation SEO ; ils ne sont pas encore disponibles sur `main` au 4 novembre 2026.

Intégration préparée : **#24 → branche #23 → branche #22 → `main`**, après autorisation explicite et vérification des nouveaux checks à chaque étape. Voir le [bilan de stabilisation](docs/BILAN-STABILISATION-THOT.md).

Publier deux articles par semaine sur THOT en conservant les URL, la présentation et les sources. Ce guide décrit le site statique actuel ; aucun CMS n'est nécessaire.

## 1. Préparer un article et sa branche

Partir de la branche intégrée la plus récente. Tant que les PR #22, #23 et [#24 (SEO)](https://github.com/thot-culture/Thot/pull/24) ne sont pas intégrées, les automatismes de ce guide se trouvent sur `work/seo-indexation-20261104` : utiliser cette base pour une PR dépendante, ou attendre leur intégration pour partir de `main`. Ne pas publier une branche de travail par erreur.

```sh
git status --short
git fetch origin
git switch -c article/mon-sujet origin/main
python -m pip install -r requirements-tools.txt
```

Les commandes supposent que la stabilisation et la préparation SEO sont intégrées à main ; avant cela, remplacer `origin/main` par `origin/work/seo-indexation-20261104`. Ne jamais écraser des modifications locales ou forcer un push. Python 3.12 et Node 22 sont les versions de la CI.

Choisir un slug durable, en minuscules, chiffres et tirets, par exemple `histoire-imprimerie`. L'URL publique sera `https://thot-culture.github.io/Thot/articles/histoire-imprimerie.html`. Une fois publiée, conserver cette URL.

## 2. Écrire le fichier source

Créer `articles/histoire-imprimerie.html`. Les six articles existants sont des sources HTML, pas les sorties d'un générateur intégral d'articles. Utiliser leur structure commune comme référence : en-tête, lien d'évitement, présentation, `main`, article `id="texte-article"`, sommaire, sources et pied de page. Retirer les activités et scripts propres au modèle repris ; ne pas conserver de texte, d'identifiants ou de crédit sans rapport avec le nouveau sujet.

Conserver les feuilles communes et utiliser `../assets/article.css`. Faire générer la coque commune par `site_chrome.py` à l'étape 6. Ne pas copier manuellement les en-têtes générés dans plusieurs pages.

Renseigner dans le HTML :

- Un H1 ; H2 pour les grandes sections, H3 pour leurs subdivisions.
- La langue `fr`, le viewport, le lien d'évitement vers le main.
- Dates de publication et de mise à jour visibles et lisibles. Ne pas inventer une date pour améliorer le SEO.

Renseigner une seule fois dans la notice JSON (étape 3) le titre SEO, la description, le titre éditorial exact du H1, l'auteur, les dates et l'image sociale. `update-article-editorial.py --write` produit le title, la description, la canonique, Open Graph/Twitter et le bloc `Article` manquant. Il conserve les champs documentaires du JSON-LD existant et sa description si elle est déjà présente. Si le modèle copié contient un ancien bloc `Article`, le retirer avant génération pour éviter de conserver des propriétés propres au sujet précédent (`about`, `keywords`, `articleSection`, description…). Ne pas garder un ancien bloc WebPage décrivant l'article modèle.

Les chemins `../assets/…` conviennent depuis `articles/`. La navigation commune utilise `/Thot/…`. Tester sous /Thot/, pas seulement par double-clic sur le fichier.

## 3. Ajouter la notice éditoriale

Ajouter une entrée dans `assets/article-editorial.json`. Ne pas modifier les dates des anciens articles.

Pour un nouvel article dont les encadrés et le partage sont écrits directement dans son HTML, utiliser `layout: "authored"`, comme l'article militaire. Le vérificateur contrôle ses dates, ses références, sa canonique et son image sociale ; il ne fabrique pas son contenu.

Exemple de structure, à compléter avec les vraies données :

```json
{
  "slug": "histoire-imprimerie",
  "layout": "authored",
  "published": "2026-11-10",
  "editorial_updated": "2026-11-10",
  "editorial_scope": "Première publication.",
  "headline": "Comment l’imprimerie a-t-elle transformé la circulation des livres ?",
  "seo": {
    "title": "Imprimerie : comment les livres ont changé d’échelle | THOT",
    "description": "Une explication documentée de la fabrication et de la circulation des livres imprimés, avec des sources et leurs limites."
  },
  "author": {
    "@type": "Organization",
    "name": "La rédaction THOT"
  },
  "social": {
    "title": "Un titre court et fidèle à l’article",
    "description": "Une description précise de la question traitée.",
    "image": "assets/images/histoire-imprimerie-social.png",
    "alt": "Description réelle de l’illustration sociale."
  },
  "sources": {
    "ref1": {
      "kind": "secondary",
      "label": "Source secondaire · synthèse historique"
    }
  },
  "catalogue": {
    "category": "histoire",
    "label": "Histoire",
    "keywords": "imprimerie livre diffusion techniques",
    "credit": "Crédit exact de l’image et licence ; notice documentée."
  }
}
```

Les dates, titres et médias de cet exemple sont des exemples à remplacer avant publication. `headline` doit être exactement le H1 (espaces normalisés) ; `seo.title` peut être plus court, sans déformer le sujet. `author` doit correspondre à la signature visible et réelle ; un auteur individuel peut utiliser `Person`. `social.image` est l'image représentative utilisée dans le partage et Schema.org ; le visuel affiché dans l'article garde ses propres dimensions, crédit et alt. Catégories reconnues : `histoire`, `geographie`, `sciences`, `arts`, `sciences-humaines`. Les mots-clés facilitent la recherche interne, ils ne sont pas une balise SEO.

Le champ `catalogue` permet au synchroniseur de créer la carte de bibliothèque. Les cartes existantes conservent leurs textes et crédits. L'image sociale doit être locale, en 1200 × 630 ; sa création et ses droits restent un travail éditorial. Le générateur historique de cartes sociales ne crée pas automatiquement une composition pour chaque nouveau sujet.

Les cinq anciens articles sans `layout: authored` utilisent une autre forme de notice, avec `known`, `discussion`, qualification des sources et blocs générés. Ne pas convertir ces articles pour ajouter un nouveau texte.

## 4. Images, sources et animations

Placer les médias dans un dossier identifiable de `assets/`. Préférer WebP pour les photos affichées ; garder un original documentaire séparé si nécessaire, chargé seulement à l'agrandissement. Donner width/height, un alt décrivant l'information utile, une légende, l'auteur, la date, la licence et un lien vers la notice. Une illustration décorative peut avoir `alt=""`. Une image générée doit être annoncée comme telle.

Réutiliser les classes communes pour une image documentaire responsive (remplacer chemin, description et crédit) :

```html
<figure class="thot-illustration">
  <div class="thot-illustration-photo">
    <img src="../assets/mon-image.webp" width="1200" height="630"
         alt="Description de l’information utile" loading="lazy" decoding="async">
  </div>
  <figcaption class="thot-illustration-caption">Légende, auteur, date, source et licence.</figcaption>
</figure>
```

Ne pas utiliser `loading="lazy"` si cette image constitue le visuel principal du premier écran. Les dimensions doivent être celles du fichier réel.

Éviter de dépendre du chargement d'une photographie externe de plusieurs mégaoctets. L'image principale visible immédiatement ne doit pas être lazy ; les images suivantes : `loading="lazy" decoding="async"`. Viser quelques centaines de Ko par image affichée, sans rendre un document illisible.

Chaque référence citée dans le texte doit viser un identifiant réel, par exemple `href="#ref1"` et `<li id="ref1">`. La liste des refN du HTML doit correspondre exactement à la notice. Distinguer document consulté, notice de catalogue et interprétation ; vérifier les URL dans un navigateur. Un DOI valide ou un HTTP 200 ne prouve pas que la source confirme le passage.

Une animation est facultative. Conserver une explication statique complète, un contrôle clavier, un état initial lisible et une réduction des mouvements. Réutiliser un module existant si adapté ; sinon CSS/JS local minimal, différé et propre à l'article. Ne pas lancer de boucle permanente hors écran. Les valeurs saisies par le lecteur doivent passer par `textContent`, jamais par `innerHTML`. Aucun script distant n'est nécessaire pour une animation pédagogique simple.

## 5. Bibliothèque, accueil et sitemap

Ne pas ajouter une carte manuellement dans plusieurs fichiers. Le synchroniseur ajoute les articles manquants à la bibliothèque, actualise le total statique et complète le sitemap. Il refuse les notices oubliées, les doublons et les suppressions implicites. Il ne réécrit pas les crédits des cartes existantes.

Le sitemap reprend désormais `editorial_updated` pour le `lastmod` des articles. Déclarer la vraie date de publication et une modification seulement lors d'une révision significative ; jamais la date du lancement du script. Les autres pages gardent leurs dates explicites. L'absence de `lastmod` n'est pas un blocage d'indexation.

Ajouter un à trois liens dans le texte ou les recommandations lorsque des correspondances réelles existent (voir la stratégie). La bibliothèque assure le premier lien entrant de tout nouvel article ; ajouter un lien depuis un ancien article est utile si son contexte s'y prête. Aucun lien forcé pour remplir un quota.

L'accueil reste une sélection éditoriale, libellée « À la une ». Il n'est pas nécessaire de le modifier deux fois par semaine : tous les articles sont accessibles dans la bibliothèque. Son bouton surprise choisit parmi les articles de l'accueil ; celui de la bibliothèque choisit parmi toutes ses cartes.

Changer l'article à la une est un choix éditorial facultatif : image, titre, description, lien, date et durée doivent être cohérents. Ne pas utiliser « Dernière publication » pour une sélection non automatiquement triée.

## 6. Régénérer dans le bon ordre

Depuis la racine du dépôt :

```sh
python scripts/update-article-editorial.py --write
python scripts/sync-publication.py --write
python scripts/update-reading-times.py
python scripts/site_chrome.py
```

Si les sources Explorer ont aussi été modifiées : lancer d'abord `python scripts/build-explorer-reconstruction.py`, puis la coque commune. Ne jamais retoucher directement les trois pages Explorer générées pour y faire une correction qui appartient à leur source.

Examiner le diff : seuls l'article, ses médias/notice et les sorties attendues doivent évoluer. Les durées sont estimées à 210 mots/min, hors sources et activités facultatives ; ce ne sont pas des promesses de temps de lecture.

## 7. Vérifier avant la PR

```sh
python scripts/sync-publication.py --check
python scripts/update-article-editorial.py --check
python scripts/update-reading-times.py --check
python scripts/build-explorer-reconstruction.py --check
python scripts/site_chrome.py --check
python scripts/test-publication.py
python scripts/test-publication-integration.py
python scripts/check-seo.py
python scripts/test-seo.py
python scripts/test-portabilite.py
node scripts/check-site.mjs
node scripts/check-home.mjs
python scripts/test-article-editorial.py
git diff --check
```

Exécuter aussi les onze suites `scripts/test-*.mjs` ; le workflow de vérification les lance. Si une activité existante a changé, lancer sa recette navigateur.

Avant modification, noter le SHA du socle. Pour vérifier que les anciens articles, quiz et corpus n'ont pas été altérés :

```sh
python scripts/check-conservation.py --revision SHA_DU_SOCLE
```

Ce contrôle protège les articles déjà présents au socle ; le nouvel article nécessite sa propre relecture. Les anciens scripts de conservation fixés à des commits historiques restent dans le dépôt. Le rapport d'audit documente leurs échecs préexistants : ne pas supprimer leurs assertions, ni annoncer qu'ils passent si ce n'est pas le cas.

## 8. Recette dans le navigateur

```sh
python scripts/preview.py
```

Ouvrir `http://127.0.0.1:8765/Thot/`. Contrôler :

1. Le nouvel article est dans la bibliothèque, trouvable par titre/mots-clés et dans le bon filtre.
2. La carte, la page, les dates et la durée concordent ; aucun brouillon ou texte du modèle ne reste visible.
3. Les images apparaissent, gardent leurs proportions et leurs crédits.
4. Le sommaire, toutes les citations, les recommandations et les boutons fonctionnent.
5. À 320, 390, 768, 1024 et 1440 px, aucun contenu n'est coupé ; les tableaux larges défilent dans leur conteneur.
6. Au clavier, le focus reste visible ; Échap ferme les menus et dialogues et rend le focus à la commande.
7. Sans JavaScript, le texte et les sources restent lisibles ; avec réduction des animations, l'article reste utilisable.
8. La console ne montre pas d'exception ; pas de ressource locale 404.

La recette automatisée complète nécessite les dépendances navigateur et axe documentées dans le workflow d'audit. Un test DOM simulé ne remplace pas cette vérification.

## 9. Proposer, puis publier selon le processus du dépôt

Créer une PR en brouillon avec le problème traité, le contenu ajouté, les médias et leurs droits, les tests exécutés et les limites. Attendre les vérifications Linux/Windows et relire le rendu. Une CI verte ne valide pas les faits historiques ou scientifiques : faire la relecture éditoriale avant fusion.

La fusion et la publication restent une décision distincte. Le présent audit n'autorise ni n'effectue leur exécution. Avant une publication décidée ultérieurement, préserver le commit publié dans une branche backup, vérifier que main n'a pas changé et utiliser le processus GitHub Pages établi.

Après un déploiement effectivement réussi, vérifier l'URL publique, la bibliothèque, le sitemap, les images et les interactions. `scripts/check-published.py` comporte des références historiques : consulter son aide et son périmètre avant de le considérer comme contrôle des 18 pages ou d'une nouvelle publication. Ne pas confondre push Git, succès d'une PR et déploiement réussi.

## Routine hebdomadaire

Pour chacun des deux articles : une source HTML, une notice éditoriale et les médias documentés ; génération et contrôles ; recette /Thot/ ; PR et relecture. Tous les mois : liens bibliographiques, erreurs de console, disponibilité des images et dépendances de test. Après un changement de design ou de module partagé : recette sur les 18 pages.
