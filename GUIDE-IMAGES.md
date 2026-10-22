# Images et droits — standard THOT

## Principe de publication

Les articles THOT illustrent les faits avec des photographies, cartes, œuvres, documents ou graphiques contextualisés. Les images ne constituent pas automatiquement des preuves du passage qu'elles accompagnent. Ne jamais faire passer une image de 1910 ou de 1915 pour un document de 1917.

**Source prioritaire :** Wikimedia Commons, en vérifiant la notice individuelle et son indication de droits. On peut aussi rechercher dans Europeana, Openverse et d'autres collections à condition d'examiner les conditions de chaque objet. La simple accessibilité en ligne ne vaut pas permission de reproduction. Pour les fonds municipaux ou les documents de Gallica, lire les conditions de réutilisation propres à la bibliothèque. Ne pas réutiliser les scans d'archives sur la seule base d'une citation de provenance.

**Préférence :** domaine public identifié ou CC0 ; puis CC BY avec attribution ; CC BY-SA après vérification des conditions de partage. Écarter les images sans statut clair, ou demander une autorisation. Un résultat de recherche peut être incorrect : relire la notice et la légende avant publication.

## Procédure pour chaque nouveau sujet

1. Trouver des images ayant un rapport vérifiable au sujet.
2. Pour chaque image, consulter la notice originale, vérifier auteur, date, lieu et droits ; choisir une image autorisée.
3. Ajouter une seule fiche dans `assets/illustrations.json` avec le lien direct, la notice, une légende prudente, la provenance et la licence.
4. Placer à l'endroit pertinent de l'article : `<div data-thot-image="identifiant-de-la-fiche"></div>`.
5. Ajouter dans l'article le chargement de `../assets/article-media.js` avec `defer`. Le style vient de `../assets/article.css`.
6. Vérifier l'affichage sur ordinateur et mobile et que les liens de crédit fonctionnent. Les images externes peuvent disparaître : conserver le lien vers la notice d'origine et prévoir, si besoin, un hébergement local autorisé.

Le système affiche automatiquement l'image, son contexte, sa date, son crédit et sa licence. Il ne choisit **pas automatiquement** une illustration dans des résultats aléatoires : la sélection exige une vérification éditoriale pour éviter les contresens historiques et les licences ambiguës.

## Vignettes de l’accueil et de la bibliothèque

Les cartes et les suggestions de lecture utilisent trois copies locales, redimensionnées et compressées en WebP. Les crédits visibles renvoient aux notices originales :

| Fichier dans `assets/images/` | Document et provenance | Statut indiqué dans la notice |
| --- | --- | --- |
| `autrices-nadar.webp` | Nadar, portraits de George Sand, 1864 ; BnF, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:George_Sand_-_portraits.jpg) | Domaine public |
| `roubaix-gambetta.webp` | Carte postale ELD, boulevard Gambetta à Roubaix, avant 1919 ; numérisation Claude Villetaneuse, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ELD_-_ROUBAIX_-_Boulevard_Gambetta.JPG) | Domaine public |
| `puissance-afghanistan.webp` | Cpl. Dustin D. March / U.S. Marine Corps, camp Shorabak, 30 mars 2014 ; [DVIDS, photo 1211203](https://www.dvidshub.net/image/1211203/afghan-national-army-soldiers-lead) | Public domain, selon la notice DVIDS |

Les vignettes conservent les proportions originales ; leur affichage peut être recadré par CSS. La carte de Roubaix porte le repère du sujet « 1917 », mais la date de l’image est explicitement donnée comme antérieure à 1919. Lors de l’ajout d’un article, placer sa carte dans la grille, renseigner sa durée estimée et conserver le crédit de sa vignette. Sur l’accueil, mettre la publication la plus récente à la une. Les liens portant `data-discovery-path` alimentent le bouton « Surprends-moi » ; chaque destination ne compte qu’une fois.

## Cas Roubaix 1917

Trois documents libres sont intégrés : une carte postale de la ville antérieure à 1919, un avis de rassemblements daté du 12 mai 1915, et une photographie d'atelier textile de 1910. **Aucun n'est présenté comme une photographie prise en 1917.** Les trois autres affiches originales conservées par les Archives municipales de Roubaix restent seulement liées vers L’Armarium tant que les droits de copie ne sont pas confirmés.
