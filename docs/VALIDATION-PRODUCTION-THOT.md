# THOT — Validation finale du site en production

Date : 4 novembre 2026, Europe/Paris. Site contrôlé : <https://thot-culture.github.io/Thot/>.

## 1. Version réellement publiée

Le commit de production contrôlé est **`d0fd73035d42f860e0f4568aa510009986c38635`**. Au début de la recette, `main` et ce commit sont identiques, sans commit supplémentaire ni fichier divergent.

- [PR #24](https://github.com/thot-culture/Thot/pull/24) fusionnée dans la branche #23 : `6c9bc7cf912e1c889694c2c91a014457486cf979`.
- [PR #23](https://github.com/thot-culture/Thot/pull/23) fusionnée dans la branche #22 : `c01370a64e1878a08e2cdef1bef98a28fbfc957e`.
- [PR #22](https://github.com/thot-culture/Thot/pull/22) fusionnée dans `main` : `d0fd73035d42f860e0f4568aa510009986c38635`.
- [GitHub Pages, exécution 41833764759](https://github.com/thot-culture/Thot/actions/runs/41833764759) : terminée avec succès ; étapes build, deploy et report-build-status réussies.
- [Vérification portable du même SHA](https://github.com/thot-culture/Thot/actions/runs/41833765488) : réussie.

Les **18 réponses HTML publiques** ont été téléchargées : HTTP 200 et comparaison octet par octet identique à `git show` sur ce commit. Le contrôle complémentaire des **96 URL locales de ressources** — CSS, JavaScript, images, médias Explorer, notices, durées, sitemap et robots, y compris les ressources CSS référencées — obtient HTTP 200 et des octets identiques au commit. Aucun ajout technique imprévu n'a été constaté.

Le site a été visité dans le véritable navigateur intégré, depuis ses URL HTTPS publiques. Les essais de publication ci-dessous ont utilisé une autre origine, `http://127.0.0.1:8879/Thot/`, dans une copie temporaire. Les résultats locaux ne sont pas présentés comme des contrôles de production.

L'utilisateur a ensuite explicitement autorisé le déploiement sans nouvelle demande. Ce rapport peut donc être intégré par une PR documentaire et publié par le processus GitHub Pages existant. Le SHA ci-dessus désigne la version du site auditée ; un éventuel commit d'intégration documentaire ne change pas ses fichiers applicatifs. Son résultat de déploiement doit être vérifié séparément après la fusion, sans annoncer par anticipation qu'il a réussi.

## 2. Les 18 pages et les cinq largeurs

Chaque page a été ouverte à **320, 390, 768, 1024 et 1440 px**, hauteur 900 px. Les 90 combinaisons disposent d'une capture du premier écran. Les planches aux cinq largeurs ont été examinées. L'ibis, la marque, la palette, les en-têtes et pieds de page restent cohérents avec le rôle de chaque page. Un H1 par page ; aucun débordement horizontal de document détecté.

| Page relative à `/Thot/` | HTTP public | 320 / 390 / 768 / 1024 / 1440 | Indexable techniquement |
|---|---|---|---|
| `index.html` et accueil `/Thot/` | 200 | OK / OK / OK / OK / OK | Oui, canonique `/Thot/` |
| `bibliotheque.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `explorer.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `notre-methode.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `quiz.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `quiz-autrices.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `mentions-legales.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `confidentialite.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `contact.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `404.html` | 200 pour le fichier explicite | OK / OK / OK / OK / OK | Non, `noindex` volontaire |
| `articles/autorite.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `articles/autrices-pseudonymes.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `articles/evolution-strategies-militaires.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `articles/pieuvres-couleur.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `articles/puissance-etats-unis.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `articles/roubaix-1917.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `explorer/atlas/rome-expansion.html` | 200 | OK / OK / OK / OK / OK | Oui |
| `explorer/enquetes/mer-aral.html` | 200 | OK / OK / OK / OK / OK | Oui |

Une URL inexistante a réellement répondu **404**, distinctement de l'accès direct au fichier `404.html`. Les valeurs de largeur de document inférieures de 15 px au viewport correspondent à la place réservée à la barre de défilement, pas à un contenu coupé.

## 3. Essais fonctionnels en production

Les essais détaillés ont principalement été conduits à 390 px. Le parcours bibliothèque → article, le curseur des pieuvres et un dialogue documentaire de l'Atlas ont aussi été exercés à 1440 px. Les cinq formats ont été contrôlés sur les 18 pages ; cela ne signifie pas que chaque chemin de chaque activité a été rejoué 90 fois.

| Domaine | Résultat réellement observé |
|---|---|
| Navigation | Menu mobile des 18 pages : ouverture, fermeture par Échap, restitution du focus. Navigation de bureau visible dans les captures. Liens de bibliothèque vers les articles fonctionnels. |
| Bibliothèque | Six cartes ; six filtres avec les effectifs attendus ; recherche multi-mots et insensible à la casse ; état sans résultat ; retour aux six cartes. |
| Quiz libre | Partie de cinq questions menée jusqu'au score, aux explications et à l'écran de résultat. Record présent après rechargement. |
| Défi quotidien | Cinq questions, résultat, statut « Défi déjà joué » et score du jour restaurés après rechargement. |
| Autrices | Activité indépendante et activité intégrée : mauvaise association expliquée, cinq associations correctes, bilan et remise à zéro. Pause documentaire également manipulée. |
| Autorité | Neuf réactions des trois situations avec explications ; trois scènes Décode ; remise à zéro. |
| Pieuvres | Curseur au clavier de 0 à 100 puis retour à 0 ; sept mécanismes sélectionnables ; couche iridophores masquée puis réaffichée. |
| États-Unis | Trois cas, étapes de chronologie au clavier et tableau comparatif de quatre lignes. |
| Roubaix | Huit dates ; chargement de l'affiche originale ; contrôles des repères documentaires ; retour à la vue entière. |
| Stratégies militaires | Tous les états des trois modules et trois notices documentaires au clavier. |
| Atlas | Huit périodes ; comparaison ; zoom et déplacement ; Rome, Carthage et Cannes ; quatre fiches de personnages et leurs parcours complets ; quatre documents ; agrandissement, Échap et restitution du focus. |
| Aral | Onze pièces ouvertes et ajoutées ; une relation d09 ↔ d06 ; quatre rôles de preuves ; hypothèse, conclusion et bilan ; vues carte/liste et rangement. |
| Sauvegarde Aral | Après rechargement : onze pièces, relation et note, quatre rôles, hypothèse, texte libre et bilan restaurés visiblement. Remise à zéro de la recette, état vierge après rechargement. |
| Isolation | La remise à zéro Aral conserve le score du défi quotidien. |
| Compléments | Quatorze termes de glossaire dans les articles concernés : ouverture au clavier, Échap et fermeture ; détails visibles dépliables ; copie de lien avec message utilisateur dans les cinq articles équipés. |

Aucune exception JavaScript ni erreur de console n'a été remontée dans les lectures effectuées pendant ces parcours et le chargement des illustrations. La console du navigateur ne constitue pas un enregistreur exhaustif de tous les événements réseau ; les vérifications HTTP indépendantes complètent ce contrôle.

### Illustrations et services externes

Un défilement effectif des pages d'accueil, de bibliothèque, des six articles et de l'Atlas a déclenché les images différées : toutes les images de ces pages ont une largeur naturelle non nulle. Les six images photographiques/satellitaires des pièces Aral ont aussi été ouvertes dans leurs dialogues et décodées, notamment 2000, 2014, poussières, barrage et photographie de 1964. Les autres pièces sont des cartes, graphiques et fiches de lecture.

Le contrôle HTTP initial porte sur **95 URL de ressources directement référencées**, locales et externes. Une seule a renvoyé **429** : la miniature Wikimedia `Camouflage_octopus.jpg` de 960 px. La même photographie s'est chargée dans le navigateur, avec largeur naturelle 960 px, et une capture en conserve la preuve. Les autres photographies Wikimedia des articles se sont également affichées. Ce résultat confirme une dépendance externe susceptible de limitations temporaires ; il ne justifie pas d'annoncer que toutes les requêtes externes ont réussi, ni une image durablement cassée en production. Aucun remplacement éditorial ni copie de photographie n'a été effectué.

## 4. SEO technique de la version publique

- **17 URL indexables** attendues, présentes une seule fois dans le sitemap public ; la page 404 reste exclue volontairement.
- Les 17 pages possèdent titre HTML, description, canonique et données structurées valides ; pas de titre ou description dupliqué dans cet inventaire, pas de `noindex` ou de directive Googlebot involontaire, ni d'en-tête `X-Robots-Tag` bloquant observé.
- Les six articles possèdent chacun un bloc `Article`, un auteur, un titre éditorial, les dates explicites de publication et de mise à jour, `mainEntityOfPage` et une image concordant avec la notice. Les dates et signatures sont aussi présentes dans le corps de page.
- Les métadonnées Open Graph/Twitter et leurs images ont été vérifiées ; les cartes sociales des six articles sont locales, lisibles et en 1200 × 630. Les ressources publiques locales contrôlées correspondent aux fichiers du commit.
- `sitemap.xml` répond 200. Les `lastmod` des six articles correspondent aux dates de révision déclarées, sans recalcul à la date de recette.
- `robots.txt` sous `/Thot/` répond 200 et annonce le sitemap. Le fichier à la racine du domaine répond 404 : il ne bloque pas le crawl. Le site de projet ne maîtrise pas ce fichier de racine ; aucun chantier supplémentaire n'est ouvert pour cela.
- **La balise Google Search Console est présente dans l'accueil publié et a été conservée à l'identique.** Sa valeur n'est pas reproduite dans ce rapport.
- Les contrôles statiques portent sur 18 pages, **879 liens et ressources internes**, 53 blocs/fichiers de scripts et 17 JSON-LD. Les ancres et chemins internes ne présentent pas d'erreur détectée. Ils sont corroborés par l'identité des HTML publics, les requêtes de ressources et les parcours navigateur ; il ne s'agit pas de 879 clics manuels.

Le vérificateur SEO du dépôt termine avec **0 erreur et 0 avertissement** sur les mêmes HTML et médias que ceux servis publiquement. Les descriptions sont les balises fournies aux moteurs : Google peut choisir un autre extrait. Aucune donnée de Search Console n'a été consultée ; **le nombre réellement indexé n'est pas connu**. Aucune promesse de classement ou d'extrait enrichi n'est faite.

## 5. Deux publications fictives, exclusivement en copie temporaire

`scripts/test-publication-integration.py` a été relancé sur une copie complète jetable. Il publie successivement `recette-temporaire-1` et `recette-temporaire-2`, sans push, sans PR de contenu et sans accès en écriture à la production.

| Contrôle | Article fictif 1 | Article fictif 2 |
|---|---|---|
| Page HTML et notice | OK | OK |
| Title, description, canonique, Article, dates et image sociale | OK | OK |
| Bibliothèque | 7 articles | 8 articles |
| Sitemap | 18 URL | 19 URL |
| Temps de lecture réel | 725 mots, 4 minutes | 725 mots, 4 minutes |
| Images, références et liens locaux | OK | OK |
| Conservation des six anciens articles | Octets identiques | Octets identiques |
| Conservation du premier article fictif après le second | Sans objet | Octets identiques |
| Réexécution des générateurs | Idempotente | Idempotente |

Une autre copie de recette a ensuite été ouverte dans le véritable navigateur à **390 et 1440 px** pour chacun des deux articles. La bibliothèque contient huit cartes, chaque recherche isole le bon article, la carte ouvre sa page, les métadonnées sont présentes, l'image se décode, la durée s'affiche et le lien `#ref1` atteint la référence. Aucun débordement observé. Les deux copies temporaires ont été supprimées après contrôle ; le serveur d'aperçu a été arrêté. Aucun fichier fictif n'a été ajouté au dépôt de publication.

Les générateurs existants suffisent à éviter les mises à jour répétées de la bibliothèque et du sitemap. Ils ne rédigent pas intégralement un article : **une source HTML, une notice JSON et les médias restent à préparer** pour chaque publication.

## 6. Non-régression et limites

Environnement local : Windows, Python 3.12.14, Node 24.22.1, Pillow 13.0.0 ; la CI conserve ses versions déclarées. Les tests locaux ne sont pas prétendus exécutés avec le Pillow 12.3.0 épinglé dans le dépôt.

- Les cinq contrôles de génération en mode vérification passent : éditorial, synchronisation, durées, Explorer et coque commune.
- Publication : 9 tests réussis ; SEO : 12 tests réussis.
- Éditorial : 7 tests réussis, 1 contrôle optionnel de comparaison de révisions ignoré sans `--head` ; cette exclusion n'est pas comptée comme un succès.
- Les onze suites `scripts/test-*.mjs`, `check-site.mjs`, `check-home.mjs`, la portabilité et la conservation au SHA de départ passent.
- Le clone de référence est resté propre avant l'ajout du présent rapport.

La recette publique utilise des viewports simulés dans un vrai navigateur. Elle ne remplace pas un téléphone physique, Safari, Firefox, un lecteur d'écran, une mesure de performance terrain ou une nouvelle expertise historique/scientifique de chaque source. La persistance a été éprouvée au rechargement et entre parcours de pages ; cette session ne revendique pas un redémarrage complet du processus du navigateur.

## 7. Problèmes, corrections et réserves

**Aucun défaut technique bloquant confirmé ne nécessite de correction applicative.** Aucun code de fonctionnement, design, architecture, contenu d'article, métadonnée de vérification ou configuration de publication n'a été modifié pendant cette validation.

Réserves conservées :

1. Wikimedia peut limiter certaines requêtes : 429 vu par l'outil HTTP, photographie affichée dans le navigateur. Surveiller en cas de récurrence ; envisager alors une copie locale documentée avec droits et crédit, dans une PR ciblée.
2. La page publique « Informations légales — éléments à compléter » indique déjà des informations d'éditeur incomplètes ; la page contact n'annonce pas de canal éditorial privé. Ces données doivent être fournies et validées par l'éditeur. Aucun nom, statut, adresse ni canal n'est inventé. Le présent rapport ne vaut pas validation juridique.
3. L'indexation effective reste à vérifier dans Search Console. L'absence d'accès ne remet pas en cause les 17 URL techniquement indexables contrôlées.
4. Le début du guide historique de publication décrit encore les PR comme non intégrées. Le socle réellement vérifié est désormais `main` ; utiliser la procédure ci-dessous. La mise à jour de cette introduction est une amélioration documentaire facultative.

Les deux futurs articles demandés restent **non publiés** : « Le lac qui a été englouti en quelques heures — La catastrophe du lac Peigneur en 1980 » et « Comment Rome a-t-elle survécu à la défaite de Cannes ? ».

## 8. Procédure hebdomadaire réutilisable

Cadence éditoriale : **un article le mardi, un le vendredi**. Aucun planificateur automatique ni nouvelle fonctionnalité n'est requis. Chaque publication reste relue et livrée par PR.

### A. Transmettre un dossier éditorial

Pour chaque sujet, transmettre :

- le texte final, ses sections, les citations et la date de publication souhaitée ;
- les sources avec URL/DOI, pages ou passages utiles et limites d'interprétation ;
- les illustrations avec fichier, légende, alt, auteur, date, licence et notice d'origine ; préciser les images générées ;
- la signature, les éventuelles mises à jour et un à trois liens pertinents vers les contenus THOT ;
- une carte sociale locale en 1200 × 630, ou les éléments permettant de la préparer.

Instruction réutilisable : « Prépare l'article [titre] pour le [mardi/vendredi, date] sur une branche issue de main. Utilise le texte, les sources et les images fournis. Prépare une PR testée, avec captures mobile/ordinateur et droits des médias. Utilise les générateurs THOT ; conserve les anciens contenus. Signale les faits ou droits non vérifiés. » Une mission de préparation de PR ne doit pas être assimilée automatiquement à une autorisation de publier chaque futur article.

### B. Préparer trois entrées, puis générer

1. Partir de `origin/main` à jour sur une branche `article/<slug>` ; noter le SHA du socle. Ne pas travailler directement sur `main`.
2. Créer `articles/<slug>.html`, avec un seul H1, texte, références `refN`, légendes et structure commune. Retirer les anciens scripts et données propres à un article utilisé comme modèle.
3. Ajouter une seule entrée dans `assets/article-editorial.json` : `layout: authored`, titre éditorial exact, SEO, dates réelles, auteur, carte sociale, catégories et sources. Ajouter les médias sous `assets/`.
4. Exécuter, dans cet ordre :

```sh
python scripts/update-article-editorial.py --write
python scripts/sync-publication.py --write
python scripts/update-reading-times.py
python scripts/site_chrome.py
```

La bibliothèque, son total, le sitemap, les métadonnées et les durées sont produits à partir de ces entrées. L'accueil reste une sélection « À la une » ; aucune obligation de le retoucher à chaque article. Ne pas modifier les dates des articles précédents.

### C. Vérifier et livrer une PR prête à relire

```sh
python scripts/update-article-editorial.py --check
python scripts/sync-publication.py --check
python scripts/update-reading-times.py --check
python scripts/build-explorer-reconstruction.py --check
python scripts/site_chrome.py --check
python scripts/test-publication.py
python scripts/test-publication-integration.py
python scripts/check-seo.py
python scripts/test-seo.py
python scripts/test-article-editorial.py
python scripts/test-portabilite.py
python scripts/check-conservation.py --revision SHA_DU_SOCLE
node scripts/check-site.mjs
node scripts/check-home.mjs
git diff --check
```

Lancer les onze suites `scripts/test-*.mjs` via le workflow existant. Ouvrir l'aperçu avec `python scripts/preview.py` sous `/Thot/`, vérifier recherche, filtre, page, références, illustrations et navigation aux cinq largeurs. Conserver quelques captures et relever la console. Vérifier que le diff contient seulement l'article, ses médias, sa notice et les sorties attendues. La PR doit résumer le sujet, les sources, les droits, les essais et les points restant à relire. Attendre les vérifications Linux/Windows et la relecture éditoriale.

### D. Publication et contrôle public

Lorsque la publication de l'article est autorisée, fusionner sa PR par le processus du dépôt, attendre **le succès du déploiement GitHub Pages au bon SHA**, puis ouvrir son URL publique. Vérifier la nouvelle carte, l'image, les références, le sitemap et l'absence d'erreur console. Une PR verte seule ne prouve pas la mise en ligne. Garder les URL des articles stables et documenter une révision significative avec sa vraie date.

Pour la transition : préparer d'abord le dossier Peigneur, puis celui sur Rome après Cannes. Leur rédaction et leur vérification documentaire appartiennent aux prochaines missions éditoriales, pas à cette recette.

## 9. Preuves conservées

Le dossier de livraison `preuves-production` contient notamment les 90 captures des premiers écrans, les cinq planches, les captures de résultat de quiz, d'Aral, du document de Roubaix et d'Hannibal, les deux articles fictifs aux deux formats, les résultats HTTP/empreintes, l'inventaire SEO, les essais fonctionnels, les images réellement décodées, la simulation de deux publications et la preuve de suppression. Les fichiers JSON distinguent origine publique et origine localhost. Ils sont livrés avec ce rapport dans l'archive de preuves ; les données fictives ne sont conservées qu'en captures et résultats, pas comme pages publiables.

## THOT EST-IL PRÊT POUR DEUX PUBLICATIONS HEBDOMADAIRES ?

**OUI AVEC RÉSERVES.** Les 18 pages publiques, les cinq largeurs, les parcours essentiels, le SEO technique et deux publications fictives successives ont été vérifiés avec succès. Aucun chantier technique supplémentaire n'est nécessaire pour démarrer la cadence mardi/vendredi. Les réserves portent sur la disponibilité des services d'images externes, les informations d'éditeur encore incomplètes, l'indexation réelle non consultée et les limites de cette recette navigateur. Chaque prochain article doit conserver sa relecture factuelle, documentaire et iconographique avant publication.
