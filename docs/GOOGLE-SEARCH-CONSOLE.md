# THOT — Google Search Console

Procédure préparée le 4 novembre 2026 pour **https://thot-culture.github.io/Thot/**. Aucun accès au compte Google ou à ses statistiques n'a été utilisé pendant cette mission. Une page techniquement indexable peut rester non indexée ; ni ce guide, ni la soumission d'un sitemap ne garantissent une indexation, un délai ou un classement.

## 1. Choisir la bonne propriété

Avec votre compte Google, ouvrir [Google Search Console](https://search.google.com/search-console/), puis « Ajouter une propriété ». Choisir **Préfixe de l'URL** et saisir exactement :

```text
https://thot-culture.github.io/Thot/
```

Respecter HTTPS, la majuscule de `Thot` et la barre finale. Cette propriété couvre les URL commençant par ce préfixe, notamment `/Thot/articles/…html`. Une propriété `http://…`, le dépôt `github.com/thot-culture/Thot`, ou une propriété limitée à `/Thot/articles/` aurait un autre périmètre.

La propriété « Domaine » exige une vérification DNS. Le projet n'a pas la maîtrise du DNS de `github.io` ; la propriété avec préfixe est adaptée à cet hébergement. Aucun changement de domaine n'est nécessaire.

## 2. Vérifier la propriété avec la balise HTML

**À faire personnellement dans Google.** Si le site apparaît déjà dans votre sélecteur de propriétés, ouvrir Paramètres → Validation de la propriété et Utilisateurs et autorisations avant de créer une nouvelle méthode. La page d'accueil publiée contient déjà une balise `google-site-verification` réelle. Sa présence ne permet pas de savoir à quel compte elle appartient ni si votre compte est validé.

Si une vérification reste nécessaire :

1. Dans les méthodes de validation, choisir **Balise HTML**.
2. Copier la balise exacte fournie par Google pour votre compte. Ne pas utiliser une valeur d'exemple.
3. Comparer cette balise avec celle du `<head>` de `index.html`. Si elle est déjà présente et publiée, cliquer sur « Valider » dans Google.
4. Si votre balise est différente, la faire ajouter au `<head>` de `index.html` dans une branche et une PR. Conserver la balise existante : elle peut servir à un autre propriétaire autorisé. Ne pas introduire de balise de vérification dans les autres pages sans besoin.
5. Faire relire puis intégrer et publier cette modification par le processus habituel, après autorisation. **La présente mission ne fusionne ni ne déploie cette modification.**
6. Ouvrir l'accueil public, afficher le code source reçu du serveur, puis vérifier que la balise fournie est dans `<head>`. Une balise uniquement présente dans une branche non publiée ne suffit pas.
7. Retourner dans Search Console et cliquer sur « Valider ». Conserver ensuite la balise ; Google peut revérifier la propriété.

Aucune nouvelle balise n'a été créée pendant la mission : le jeton nécessaire doit venir de votre compte. Le générateur de coque et celui des métadonnées d'articles préservent la balise existante de l'accueil.

Une autre méthode possible est le fichier HTML fourni par Google : conserver exactement son nom et son contenu, le placer à la racine du dépôt, puis vérifier l'URL de validation indiquée par Google sous `/Thot/` après publication. N'utiliser cette méthode que si elle est proposée pour la propriété choisie. Aucun fichier fictif n'est fourni ici. Google Analytics et Google Tag Manager ne sont pas nécessaires à cette vérification ; aucun outil de suivi des visiteurs n'a été ajouté.

## 3. Soumettre le sitemap

Dans **Indexation → Sitemaps**, soumettre :

```text
https://thot-culture.github.io/Thot/sitemap.xml
```

Si l'interface préremplit `https://thot-culture.github.io/Thot/`, saisir simplement `sitemap.xml`. Vérifier ensuite la date de lecture et l'état indiqué par Google. Au contrôle HTTP du 4 novembre, ce fichier répond 200 et contient **17 URL canoniques publiques**, dont six articles. La page 404 est exclue.

Ne pas soumettre le fichier GitHub `blob/main/sitemap.xml`, une URL d'aperçu local ou un chemin sans `/Thot/`. Le même sitemap sera actualisé pour les futurs articles ; il n'est pas nécessaire de créer un sitemap par publication ni de le soumettre à nouveau chaque semaine si son URL reste identique et que Google le lit.

Google recherche le robots à **https://thot-culture.github.io/robots.txt**, qui répondait 404 au contrôle. Ce statut signifie ici absence de fichier, pas interdiction générale d'explorer. **`/Thot/robots.txt` ne contrôle pas l'hôte** : son existence et sa mention du sitemap ne remplacent pas la soumission dans Search Console. Ne pas ajouter de règle `Disallow` pour tenter de désindexer une page ; un robot doit pouvoir lire un `noindex` pour le prendre en compte.

## 4. Contrôler les premières pages

Dans la barre **Inspection de l'URL**, coller une URL publique complète. Commencer par :

- `https://thot-culture.github.io/Thot/`
- `https://thot-culture.github.io/Thot/articles/pieuvres-couleur.html`
- `https://thot-culture.github.io/Thot/articles/autrices-pseudonymes.html`
- `https://thot-culture.github.io/Thot/articles/roubaix-1917.html`
- `https://thot-culture.github.io/Thot/articles/evolution-strategies-militaires.html`

Inspecter ensuite Autorité, Puissance américaine et les deux expériences Explorer. Pour chaque page, noter le résultat réel de Google, la dernière exploration et, lorsqu'elles sont disponibles, la canonique déclarée et la canonique sélectionnée par Google. Ces dernières peuvent différer ; ne pas modifier les URL avant de comprendre pourquoi.

Le rapport initial décrit l'état connu de l'index Google. **Tester l'URL publiée** vérifie la version accessible maintenant : contrôler l'autorisation d'exploration/indexation, le chargement, le HTML rendu et la capture mobile. Un test en direct favorable ne signifie pas que la page figure déjà dans l'index. Le test en direct ne prédit pas toujours la canonique que Google sélectionnera.

L'accueil `/Thot/index.html` et `/Thot/` servent le même contenu ; la canonique désigne `/Thot/`. Un signalement d'URL alternative pour `index.html` peut donc être normal. Examiner aussi les URL historiques réellement signalées par Google ; une 404 d'une adresse inventée ne justifie aucune redirection.

## 5. Demander l'indexation

Après publication réelle, inspecter l'URL canonique de l'article important, lancer le test en direct, puis **Demander une indexation** si cette commande est disponible et que les contrôles sont favorables. Cette demande est utile pour un nouvel article ou une révision importante. Elle est limitée par des quotas et ne garantit ni traitement immédiat ni acceptation. Ne pas répéter la demande quotidiennement ; le sitemap et les liens internes assurent la découverte régulière.

Ne pas utiliser une API d'indexation réservée à d'autres types de contenus pour ces articles ordinaires. Les six articles ne nécessitent aucun script de soumission automatique.

## 6. Lire les problèmes d'indexation

Consulter **Indexation → Pages**, puis filtrer par sitemap lorsque possible. La liste ci-dessous explique des états possibles ; elle ne décrit pas des problèmes observés dans le compte THOT, auquel la mission n'a pas accès.

| État rencontré | Vérification utile |
|---|---|
| Détectée, actuellement non indexée | Vérifier disponibilité, lien depuis la bibliothèque, sitemap et intérêt propre de la page ; surveiller l'évolution sans demandes répétées |
| Explorée, actuellement non indexée | Lire la version rendue, les doublons et la valeur documentaire ; un HTTP 200 seul ne suffit pas |
| Autre page avec balise canonique correcte | Comparer à la canonique attendue ; peut être normal pour l'alias `index.html` |
| Exclue par `noindex` | Normal pour la 404 ; anomalie à corriger pour un article publié |
| Introuvable / 404 | Vérifier le lien d'origine ; corriger les liens cassés, rediriger seulement vers un remplacement réellement équivalent si nécessaire |
| Erreur serveur / accès refusé | Vérifier URL, statut réel et déploiement ; un refus d'un fournisseur documentaire externe ne décrit pas forcément THOT |
| Bloquée par robots.txt | Examiner le robots **à la racine de l'hôte** et les détails fournis par Google |

Ne lancer « Valider la correction » qu'après résolution et publication effective. Conserver l'URL, la date, le motif et l'action dans le suivi.

## 7. Suivre la recherche simplement

Chaque semaine, consulter **Performances → Résultats de recherche**, type **Web**, sur les **28 derniers jours complets**, puis comparer aux 28 jours précédents si les données le permettent. Relever clics, impressions, CTR et position moyenne. Examiner les onglets Pages, Requêtes, Appareils et Pays. Garder les mêmes filtres lors des comparaisons ; ajouter une vue France seulement si elle répond au public visé.

Le CTR est clics/impressions, pas une moyenne des CTR de chaque article. La position moyenne agrège des requêtes et des contextes : elle n'est pas un classement fixe. Les requêtes affichées peuvent être incomplètes pour des raisons de confidentialité. Une période trop courte ou très peu d'impressions ne permet pas de conclure qu'un titre est mauvais.

Utiliser [le modèle de suivi](seo/SUIVI-SEO-HEBDOMADAIRE.csv). Laisser les chiffres Google vides tant qu'ils ne sont pas disponibles. Aucun zéro n'a été inventé. Exporter les rapports CSV de votre compte si nécessaire, sans publier les accès Google. Le nombre total de pages connu par Google peut inclure des alias et d'anciennes adresses ; le comparer aux URL canoniques actuelles avec ce contexte.

Mensuellement, vérifier aussi Sitemaps, Signaux Web essentiels (uniquement si Google dispose de données terrain), HTTPS, Actions manuelles et Problèmes de sécurité. Le dernier groupe est une surveillance de routine, pas le signalement d'un incident THOT. Les rapports Article/résultats enrichis peuvent apparaître selon les données détectées ; leur absence ne démontre pas à elle seule un défaut. Tester un article avec [le test des résultats enrichis](https://search.google.com/test/rich-results) après publication, sans attendre de présentation garantie dans Google.

## Vos actions nécessaires

Créer ou ouvrir la propriété avec votre compte, confirmer votre statut de propriétaire, fournir votre vraie balise seulement si celle publiée ne vous valide pas, soumettre le sitemap, inspecter les pages prioritaires et remplir ensuite le suivi avec les données Google. Tout le reste préparé dans le dépôt peut être relu sans connexion à votre compte.

## Références officielles

- [Propriété avec préfixe d'URL](https://support.google.com/webmasters/answer/10432366?hl=fr).
- [Validation de la propriété](https://support.google.com/webmasters/answer/9008080?hl=fr).
- [Inspection de l'URL](https://support.google.com/webmasters/answer/9012289?hl=fr).
- [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview?hl=fr).
- [Emplacement et règles du robots.txt](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec?hl=fr).
