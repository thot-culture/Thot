# COMPTE RENDU POUR CHATGPT — THOT

Date : 23 octobre 2026. Page : accueil, `index.html`.
Branche de travail **locale** : `work/audit-accueil`.

## Périmètre et conservation

L’intervention concerne uniquement l’accueil. Le code initial a été récupéré depuis
`thot-culture/Thot` via le connecteur GitHub et conservé sur la branche locale `main`
(instantané `93dd85f`). Aucun changement n’a été envoyé à GitHub ni publié sur le
site public. Les travaux antérieurs concernant le quiz sont isolés sur la branche
locale `work/audit-global-en-attente` et ne font pas partie de cette livraison.

HTML examiné : `index.html`. CSS examiné : `assets/site.css` et
`assets/decouverte.css`. JavaScript examiné : `assets/site-home.js` et
`assets/decouverte.js`. Les destinations des liens de l’accueil ont été lues pour
vérifier leur existence et leurs ancres ; cela ne constitue pas un audit des autres
pages. Textes, articles, références, crédits photographiques et images d’origine
sont conservés. La comparaison automatique des textes HTML avant/après passe.

## Bugs identifiés et corrections

1. **Navigation mobile sans JavaScript** : les règles existantes masquent les liens
   sous 711 px et montrent un bouton inerte lorsque le script ne fonctionne pas.
   L’accueil affiche désormais ses liens par défaut. Le menu ne devient repliable
   qu’après l’installation de ses gestionnaires JavaScript (`data-menu-ready`).
2. **Grille large écran** : le CSS commun impose trois colonnes dès 1080 px alors
   que l’accueil contient quatre cartes. Une surcharge limitée à l’accueil conserve
   une grille de deux colonnes au-dessus de 710 px et une colonne en dessous.
   Le résultat visuel reste à confirmer dans un navigateur.
3. **Menu dans une fenêtre basse** : absence de hauteur maximale et de défilement.
   Ajout de `max-height` fondé sur `vh` puis `dvh`, et de `overflow-y: auto`.
   La correction CSS est présente ; le cas paysage/zoom reste à vérifier visuellement.
4. **Images en échec** : ajout d’un message court dans la zone de l’image, avec la
   description originale accessible aux aides techniques. L’image cassée est
   masquée ; le lien vers l’article, le titre et les crédits restent présents.
   Les échecs survenus avant l’initialisation sont aussi pris en charge.

## Améliorations

- Fermeture du menu par clic extérieur et lorsque le focus quitte l’en-tête.
- Réinitialisation du menu au changement de breakpoint. Lors du passage au mobile,
  un focus situé dans la navigation qui va être masquée revient au bouton Menu.
- Conservation de la fermeture par Échap, avec restitution du focus au bouton.
- `tabindex="-1"` sur le contenu principal pour permettre une destination explicite
  du lien d’évitement, sans ajouter d’étape à la tabulation normale.
- Commentaire obsolète sur les banques de questions remplacé par un commentaire
  décrivant les scripts réellement utilisés par l’accueil.
- Aucun framework, aucune dépendance ni nouveau service externe.

## Fichiers de la livraison

- `index.html` : classe de page, chargement de la feuille propre à l’accueil,
  destination du lien d’évitement, commentaire.
- `assets/site-home.js` : navigation et repli des images.
- `assets/home.css` : nouveau fichier ; tous les sélecteurs sont limités à
  `.home-page`. Il est chargé uniquement par `index.html`.
- `scripts/check-home.mjs` : contrôles statiques de l’accueil.
- `scripts/test-home.mjs` : tests comportementaux sans dépendance.
- `docs/AUDIT-ACCUEIL.md` : présent compte rendu et progression.

**Conséquences sur les autres pages : aucune modification de leurs fichiers ni des
ressources qu’elles utilisent.** `assets/site-home.js` est chargé uniquement par
l’accueil. `assets/site.css`, `assets/decouverte.css` et `assets/decouverte.js`
restent inchangés.

## Tests et résultats

Commandes exécutées avec succès :

```sh
node scripts/check-home.mjs
node scripts/test-home.mjs
node --check assets/site-home.js
git diff --check
```

- Contrôles statiques : **33 liens et ressources internes**, **2 scripts**, existence
  des ancres de destination, IDs uniques, références ARIA, textes alternatifs,
  langue, titre unique de niveau 1, description, viewport, URL canonique et cohérence
  avec l’URL Open Graph. Les **5 articles** de l’accueil sont inclus dans le tirage.
- Tests JavaScript dans un **DOM simulé**, sans navigateur : ouverture/fermeture,
  Échap et focus, clic extérieur, sortie du focus, clic sur un lien, changements
  de viewport simulés, ancien `matchMedia.addListener`, année du pied de page,
  erreurs d’images différées ou déjà survenues et absence de repli dupliqué.
- Tirage surprise existant : chacun des 5 articles peut être tiré, pas de répétition
  immédiate, respect de `/Thot/`, fonctionnement lorsque le stockage est refusé,
  respect des clics avec modificateurs et du clic milieu.
- Comparaison du texte de l’accueil avec l’instantané d’origine : **identique**.
- Les liens et ressources ne sont vérifiés que dans les fichiers locaux. Les
  réponses HTTP et la disponibilité des services externes ne sont pas validées.

## Limites et points restant à vérifier

**Le contrôle visuel ordinateur/mobile n’a pas pu être effectué.** Chromium quitte
immédiatement le sandbox avec `setsockopt: Operation not permitted` / `SIGTRAP`.
Les deux tentatives d’accès supplémentaire nécessaires au navigateur ont été
interrompues. Aucun résultat de capture d’écran, Lighthouse, Core Web Vitals,
lecteur d’écran ou navigateur réel n’est revendiqué. Les tests de viewport sont
des tests de logique JavaScript, pas de rendu responsive.

Deux images de l’accueil restent hébergées sur Wikimedia : pieuvre et George Eliot.
Leur disponibilité et leur poids réseau actuel ne sont pas vérifiés. Le repli est
testé en simulation. Les images locales sont présentes ; aucun téléchargement ou
remplacement d’image n’a été effectué. Les métadonnées SEO existantes sont
conservées ; l’indexation Google n’est pas vérifiée.

Recommandations : ouvrir l’accueil à 320, 390, 768 et 1440 px ; tester une fenêtre
basse, le zoom à 200 %, le clavier et JavaScript désactivé ; bloquer une image pour
contrôler son repli ; effectuer ensuite une mesure Lighthouse. Envisager une copie
locale des deux images externes, avec les mêmes crédits et licences, si leur poids
ou leur disponibilité le justifie. Aucun changement éditorial n’est proposé.

## Consultation du résultat

Livraison : `/workspace/THOT-accueil-audit.zip` et
`/workspace/THOT-accueil.patch`. Extraire l’archive puis ouvrir `Thot/index.html`
dans un navigateur pour consulter l’accueil. Les autres pages sont incluses dans
leur état initial uniquement afin que les liens puissent fonctionner. Les deux
images externes demandent une connexion Internet. Ouvrir ainsi l’accueil ne
modifie pas le site public.

Pour une prévisualisation HTTP sur son propre ordinateur :

```sh
cd Thot
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000/`. La prévisualisation locale n’a pas été lancée
avec succès dans l’environnement de cet audit.

## Progression

L’état « Vérifiée et corrigée » ci-dessous concerne le code et les tests locaux
décrits plus haut. La validation visuelle de l’accueil reste en attente.

| Page | État |
| --- | --- |
| Accueil — `index.html` | Vérifiée et corrigée |
| Bibliothèque — `bibliotheque.html` | À vérifier |
| Notre méthode — `notre-methode.html` | À vérifier |
| Quiz — `quiz.html` | À vérifier |
| Jeu des autrices — `quiz-autrices.html` | À vérifier |
| Autorité — `articles/autorite.html` | À vérifier |
| Autrices — `articles/autrices-pseudonymes.html` | À vérifier |
| Pieuvres — `articles/pieuvres-couleur.html` | À vérifier |
| États-Unis — `articles/puissance-etats-unis.html` | À vérifier |
| Roubaix — `articles/roubaix-1917.html` | À vérifier |

Arrêt à l’accueil. Aucune page suivante ne doit être traitée sans accord explicite
de l’utilisateur. Toute correction supplémentaire demandée sur l’accueil doit être
réalisée avant de proposer la suite.

## Mise à jour supplémentaire

Une passe de recherche, navigation mobile et clavier complète cette version.
Les changements propres à cette page, les fichiers et les tests sont détaillés
dans [AMELIORATIONS-NAVIGATION-LECTURE.md](AMELIORATIONS-NAVIGATION-LECTURE.md).
La livraison courante est `THOT-site-ameliore.zip` ; aucune publication effectuée.
