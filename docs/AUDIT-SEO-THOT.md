# Audit SEO THOT — 4 novembre 2026

## 1. Conclusion et périmètre

**OUI, AVEC RÉSERVES : la version publique est techniquement explorable et indexable.** Aucun blocage SEO général n'a été constaté. Les 17 pages canoniques indexables répondent 200, sans `noindex` ni en-tête `X-Robots-Tag` d'exclusion observé ; le sitemap contient ces 17 URL. Cela **ne prouve pas leur indexation dans Google**, ne garantit aucun classement et n'explique pas à lui seul une éventuelle faible audience. Aucun accès Search Console, donnée de recherche ou mesure INP terrain n'a été utilisé.

L'audit distingue la production, `main`, les propositions #22/#23 et les corrections SEO non publiées. Les contenus et fonctionnalités sont préservés. La mission ne fusionne aucune PR et ne déploie rien.

Livrables associés : [configuration Search Console](GOOGLE-SEARCH-CONSOLE.md), [stratégie éditoriale et maillage](STRATEGIE-SEO-THOT.md), [guide de publication actualisé](../GUIDE-PUBLICATION-ARTICLES.md), [suivi hebdomadaire vierge de données Google](seo/SUIVI-SEO-HEBDOMADAIRE.csv).

## 2. État des branches et version réellement publiée

État vérifié par l'API GitHub et les réponses HTTP pendant cette mission ([relevé GitHub](seo/etat-github-20261104.json)) :

| Référence | État constaté | Révision |
|---|---|---|
| `main` | Branche principale, dernière publication Pages réussie examinée | `86ee7cbb27172262eca3648afe51cb7d2a81eab8` |
| [PR #22](https://github.com/thot-culture/Thot/pull/22) | Ouverte, en brouillon, non fusionnée ; base `main` | `c7b62ad61c5ddabc63c61560175a55c85ec80200` |
| [PR #23](https://github.com/thot-culture/Thot/pull/23) | Ouverte, en brouillon, non fusionnée ; base branche #22 | `2cae9b575b70f58c14c75ff1a9ca11cc213ca101` |
| Travail SEO | Branche `work/seo-indexation-20261104`, créée depuis #23 | Base explicite : SHA de #23 ci-dessus |

Le [déploiement Pages 40740217773](https://github.com/thot-culture/Thot/actions/runs/40740217773) est réussi sur le SHA de `main`. **Les corps des 18 réponses HTML publiques sont identiques octet par octet à ce `main`**, et non aux branches #22/#23. La comparaison n'est donc pas une supposition fondée sur le seul état des PR. Les correctifs de stabilisation décrits dans l'audit final ne sont pas encore tous présents sur le site public.

La proposition SEO doit cibler la branche #23 pour éviter de mélanger son diff aux précédents. Après intégration des dépendances, actualiser sa base et relancer les contrôles avant toute publication autorisée.

## 3. Contrôle HTTP, indexabilité et ressources

[Photographie HTTP publique complète](seo/etat-public-20261104.json) : date UTC, révisions comparées, empreintes SHA-256, statuts, redirections, en-têtes, métadonnées, titres, sources JSON-LD et ressources. Les valeurs des balises de validation Google ne sont pas recopiées.

| URL ou groupe | Résultat réel |
|---|---|
| Les 17 URL canoniques indexables | HTTP 200, pas de redirection de ces URL vers une autre page |
| `/Thot/404.html` | HTTP 200 pour le fichier explicite ; `noindex`, hors sitemap |
| `/Thot/seo-page-inexistante-20261104.html` | Véritable HTTP 404 |
| `/Thot` | Redirection vers `/Thot/`, puis 200 ; chaîne précise conservée dans le JSON |
| `/Thot/index.html` et `/Thot/` | 200, même accueil ; canonique vers `/Thot/` |
| `/Thot/sitemap.xml` | 200, XML valide, exactement 17 canoniques actuelles |
| `/Thot/robots.txt` | 200 ; fichier du sous-projet, **pas le robots de l'hôte** |
| `https://thot-culture.github.io/robots.txt` | 404 : absence du fichier, aucune interdiction générale déduite |
| Ressources HTML et images Open Graph examinées | 95 URL contrôlées, toutes HTTP 200 |

Google lit le robots à la racine de l'hôte. La mention de sitemap dans celui du projet ne suffit pas pour sa découverte par ce mécanisme. La soumission explicite dans Search Console est adaptée ; il n'est pas nécessaire de créer un dépôt d'hébergement à la racine de l'hôte pour rendre THOT indexable.

Les URL `.html` sont stables et lisibles ; aucune migration de slug ou redirection n'a été introduite. Une 404 d'une URL inventée est attendue. Les URL historiques éventuellement connues de Google restent à examiner dans Search Console, sans inventer de redirections.

## 4. Inventaire des pages publiques

Pour chacune des 17 pages indexables : titre HTML présent et distinct, meta description présente et distincte, un H1 principal, canonique attendue, `og:url` aligné et JSON-LD parsable. La 404 est contrôlée séparément. Le détail de chaque title, description, H1 et type Schema.org est dans le relevé public et dans [l'inventaire de la branche](seo/inventaire-branche.json).

| Page sous `/Thot/` | Fonction / contenu réel | HTTP | Indexabilité déclarée |
|---|---|---|---|
| `/` | Accueil THOT | 200 | Oui |
| `bibliotheque.html` | Six articles, recherche et filtres | 200 | Oui |
| `articles/autorite.html` | Réactions face à l'autorité | 200 | Oui |
| `articles/autrices-pseudonymes.html` | Brontë, Eliot, Sand et noms de plume | 200 | Oui |
| `articles/pieuvres-couleur.html` | Couleur, chromatophores, muscles et signaux | 200 | Oui |
| `articles/puissance-etats-unis.html` | Moyens et résultats de la puissance américaine | 200 | Oui |
| `articles/roubaix-1917.html` | Vie sous l'occupation et corpus documentaire | 200 | Oui |
| `articles/evolution-strategies-militaires.html` | Armes, tactiques et logistique | 200 | Oui |
| `explorer.html` | Entrée vers les deux expériences | 200 | Oui |
| `explorer/atlas/rome-expansion.html` | Atlas de l'expansion romaine | 200 | Oui |
| `explorer/enquetes/mer-aral.html` | Enquête documentaire Aral | 200 | Oui |
| `quiz.html` | Quiz général et défi quotidien | 200 | Oui |
| `quiz-autrices.html` | Jeu des pseudonymes | 200 | Oui |
| `notre-methode.html` | Méthode éditoriale | 200 | Oui |
| `contact.html` | Corrections et contact | 200 | Oui |
| `mentions-legales.html` | Informations d'éditeur explicitement partielles | 200 | Oui |
| `confidentialite.html` | Stockage local et requêtes de médias | 200 | Oui |
| `404.html` | Page de secours | 200 à cette adresse explicite | Non : `noindex` |

Aucune autre page HTML publique n'est présente dans les révisions inventoriées. L'alias d'accueil `index.html` n'est pas compté comme une dix-huitième URL indexable distincte. Les thèmes d'articles diffèrent ; aucun doublon intégral d'article n'a été constaté. Cela ne remplace pas le rapport de canoniques sélectionnées par Google.

## 5. Métadonnées, contenu et données structurées

Les six articles déclarent `Article`, avec headline cohérent avec le H1, auteur « La rédaction THOT », dates, image représentative et `mainEntityOfPage`. Les signatures et dates sont affichées. Les références `refN` sont présentes et correspondent aux notices du registre. L'accueil déclare `WebSite`, les autres pages indexables `WebPage`. Les expériences sont des pages pédagogiques : aucun balisage `Article`, FAQ ou avis artificiel n'a été ajouté pour viser un résultat enrichi.

Les auteurs restent ceux réellement indiqués ; aucun expert, profil personnel, identifiant professionnel ou auteur fictif n'est créé. Les dates ne sont pas remplacées par celle de l'audit. Les descriptions structurées existantes et les champs documentaires sont conservés. Le JSON-LD des articles est sémantiquement identique au socle #23, ce que contrôle la conservation.

Toutes les balises `<img>` publiques examinées ont un attribut alt. Des images décoratives possèdent volontairement `alt=""` ; les titres SVG décrivent des cartes/illustrations et ne doivent pas être confondus avec le `<title>` HTML. La pertinence de chaque description ne se certifie pas par une simple présence d'attribut. Six pages n'avaient pas `og:image:alt` : ajout sûr depuis les visuels et légendes existants, via la coque commune pour conserver les sources des pages Explorer. Cette omission ne bloquait pas l'indexation.

Un saut H2→H4 existe dans les panneaux de la frise militaire. Il est signalé comme avertissement mineur, non comme blocage Google. Il n'est pas corrigé ici afin de préserver le contenu et les gabarits d'activité sans élargir la mission ; une correction sémantique devra être relue et testée spécifiquement.

La validité syntaxique et les contrôles locaux Schema.org ne constituent pas une validation par le test Google des résultats enrichis. Ce test et l'Inspection d'URL sont à exécuter sur les pages publiées selon le guide Search Console.

## 6. Liens internes, sources et fiabilité

La bibliothèque lie les six articles ; Explorer lie les deux expériences. Les menus et pieds de page relient les pages de service. **Aucune page indexable n'est orpheline.** Avant cette proposition, l'article militaire reçoit un lien depuis une seule page (bibliothèque), l'Atlas depuis une seule page (Explorer). Ce n'est pas un défaut d'explorabilité, mais une occasion de proposer des prolongements thématiques utiles.

La [stratégie](STRATEGIE-SEO-THOT.md) décrit les correspondances réelles : Rome/organisation militaire, moyens/résultats politiques, occupation/documents, autrices/pseudonymes, eau/milieux et signaux biologiques. Les liens proposés ne sont pas annoncés comme déjà présents. Les recommandations existantes et les textes sont conservés ; aucun module supplémentaire n'est créé.

Le contrôle HTTP externe a réellement interrogé **214 URL** à partir des pages de la branche, des illustrations et des références du quiz : **192 réponses 200, 15 réponses 403, 2 réponses 401, 2 réponses 503, 2 réponses 404 attendues et 1 échec réseau**. [Résultats détaillés](seo/liens/http-links.json). Les deux 404 sont le robots de l'hôte et une page volontairement inconnue. 403/401 peuvent être une protection automatique, 503 une indisponibilité ; ils ne prouvent pas une source inexistante. Les notices et sources sensibles doivent être ouvertes et relues par un humain.

Les 155 URL externes distinctes des liens HTML publics (après retrait des fragments) ont été rapprochées de ce relevé : 154 y sont couvertes. La seule ancienne adresse supplémentaire est celle d'Oxford pour George Eliot. Elle est encore publiée sur `main` ; son contrôle échoue dans cet environnement ([preuve et limite](seo/lien-production-oxford.json)). La même ressource à `https://writersinspire.org/content/george-eliot-0` répond 200 dans le relevé, et sa correction documentée est déjà dans #23. Ne pas confondre cette correction non publiée avec l'état public.

L'article Puissance américaine contient une actualité iranienne datée d'octobre 2026 : sa fraîcheur doit être relue avant promotion. Les informations légales restent partielles et la voie de contact doit être validée par l'éditeur. Ce sont des sujets de crédibilité et de maintenance, pas des pénalités Google démontrées. Aucun fait historique ou scientifique n'est réécrit pour ajouter des mots-clés.

## 7. Performances et mobile

L'audit final avait mesuré six gabarits en laboratoire avec Lighthouse 12.8.2, dans l'aperçu local non compressé : accueil 99/LCP 1,81 s ; Autorité 96/2,72 s ; Pieuvres 93/3,20 s ; Atlas 74/4,46 s ; Aral 91/3,45 s ; quiz 93/2,61 s. Ces mesures sont celles du rapport antérieur, pas des mesures de la production actuelle ni une certification des Core Web Vitals.

Vérifications nouvelles :

- GET réel sur l'Atlas public avec `Accept-Encoding: gzip` : **144 808 octets transférés pour 605 959 octets décompressés**, `Content-Encoding: gzip`, cache annoncé `max-age=600`. [Relevé](seo/atlas-transfert-public.json). Le poids décompressé ne doit pas être présenté comme son transfert public réel.
- Tentative Lighthouse sur l'Atlas HTTPS public : échec `INSECURE_DOCUMENT_REQUEST` / confiance du certificat du proxy dans Chromium. **Aucun score public exploitable.** Les GET Python avec validation TLS réussissent ; cet échec ne démontre pas un certificat invalide sur le site. [Trace](seo/atlas-public-lighthouse.json).
- Nouveau passage froid local **Lighthouse 13.6.0**, Chromium **155.0.8059.79**, mobile simulé, réseau simulé et ralentissement CPU ×4 : **performance 74, LCP 4,49 s, CLS 0, TBT 7 ms, SEO 100**. [Données](seo/atlas-local-lighthouse.json). Le corps HTTP local a été comparé au fichier de la branche avant mesure. Serveur local non compressé ; un seul passage, versions différentes de l'audit précédent : pas de conclusion chiffrée d'amélioration ou de régression entre ces deux laboratoires.
- Recette Chromium réelle : **18 pages × 5 largeurs = 90 vues**, 320/390/768/1024/1440 px, aucun débordement ou exception détecté, menus clavier/tactile simulé, Échap/focus, états et commandes Atlas, sauvegarde Aral avec redémarrage, quiz conservé. Repli sans JavaScript vérifié à 320 px sur quatre gabarits. [Rapport](seo/navigateur/recette-site.json).

Le HTML de l'Atlas incorpore une géométrie SVG volumineuse. Les contrôles montrent déjà des mises à jour regroupées par frame. Lighthouse local ne détecte pas de JavaScript inutilisé significatif ; environ 10 Ko de CSS potentiellement inutilisé sont signalés, sans gain LCP estimé dans ce passage. Ne pas supprimer ces styles sans tester les états interactifs qu'un parcours initial ne visite pas.

Les ressources publiques contrôlées comprennent un portrait des sœurs Brontë externe d'environ 2,19 Mo ; sa présence en chargement différé limite son effet sur le premier écran, mais son transfert peut peser sur la lecture. Une copie WebP adaptée, avec droits/crédits et original documentaire conservés, peut être étudiée après mesure ciblée. Aucune recompression ni modification de document scientifique/cartographique n'est faite dans cette PR.

Ordre recommandé : mesurer l'Atlas publié avec PageSpeed Insights/Lighthouse depuis un environnement sans ce problème de proxy ; consulter les données terrain lorsqu'elles existent ; cibler ensuite le coût réellement dominant. Une réutilisation de géométries SVG identiques ou un chargement différé de documents hors écran peut être étudié séparément avec comparaison visuelle, sans simplifier les frontières ni retirer les explications statiques. Aucun chantier cartographique n'est requis pour rendre le site indexable.

**Pas de donnée INP ni de LCP/CLS terrain disponible ici.** TBT n'est pas INP. Aucun téléphone physique, Safari, Firefox ou lecteur d'écran n'a été utilisé pendant cette mission SEO.

## 8. Défauts et risques confirmés, proportionnés

Aucun P0 ni P1 SEO bloquant n'a été confirmé.

| Niveau | Constat / reproduction | Conséquence | Traitement |
|---|---|---|---|
| P2 maintenance | `update-article-editorial.py` retournait les pages `authored` sans produire les métadonnées ; title/description/auteur devaient être coordonnés à la main | Risque de métadonnées périmées en copiant un article, pas preuve d'un défaut sur les six articles actuels | Notice unique complétée avec les valeurs réelles ; génération et contrôle communs, tests d'un nouvel article |
| P2 maintenance | `sync-publication.py` ajoutait une URL sans reprendre sa date éditoriale, et conservait les `lastmod` existants sans vérifier les révisions d'articles | Donnée facultative moins précise ; aucune interdiction d'indexation | Reprise des dates explicites des articles, sans horloge ni réécriture des autres pages |
| P3 métadonnées | `og:image:alt` absent sur Explorer et ses deux expériences, Contact, Confidentialité et Mentions légales | Description de partage moins complète, pas blocage Google | Corrigé dans `site_chrome.py`, pages régénérées depuis leurs sources |
| P3 structure | Article militaire : panneau H4 suivant un H2 | Hiérarchie moins régulière pour la lecture assistée | Avertissement conservé, correction spécifique ultérieure |
| P2 à mesurer | Atlas : LCP froid local 4,49 s, géométrie volumineuse | Peut limiter l'expérience mobile ; ampleur publique non établie | Compression publique vérifiée ; mesure publique recommandée avant optimisation |
| P2 éditorial | Informations légales partielles ; actualité Iran à relire ; accès documentaire externe variable | Confiance et entretien du contenu | Actions humaines explicites ; pas d'identité ou de faits inventés |
| P3 maillage | Article militaire et Atlas reliés chacun depuis une seule page ; recommandations parfois très générales | Moins de prolongements thématiques pour le lecteur | Cartographie et routine documentées ; aucune page orpheline |

L'absence de données Search Console n'est pas classée comme panne : le compte n'a pas été autorisé. Elle empêche de diagnostiquer une indexation réelle ou les causes de performance dans Google. Les dates manquantes du sitemap, l'absence du robots racine et un title long ne sont pas transformés artificiellement en obstacles d'indexation.

## 9. Corrections livrées et publication future

Le registre existant `assets/article-editorial.json` reçoit `headline`, `seo.title`, `seo.description` et `author` pour les six articles, repris à l'identique des documents existants. `social`, dates, sources et médias existants restent utilisés.

Le générateur éditorial existant produit désormais title/description/canonique et un bloc `Article` s'il manque ; il met en cohérence headline, auteur, image, URL et dates sans toucher le corps. Les pages `authored` reçoivent aussi leurs métadonnées de partage depuis `social`. Les champs documentaires existants du JSON-LD et sa description sont conservés. **Un modèle copié doit perdre son ancien bloc Article avant génération** pour ne pas conserver son ancien sujet. La nouvelle validation détecte les contradictions, pas le sens de toutes les propriétés documentaires.

Le synchroniseur existant continue à ajouter la carte de bibliothèque, à compter les articles et à compléter le sitemap ; il reprend maintenant les dates éditoriales des articles. Les cartes déjà présentes gardent leur texte, leur image et leurs crédits : lors d'une révision, leur cohérence reste une relecture ciblée. L'accueil n'a pas besoin d'être modifié deux fois par semaine.

`check-seo.py` vérifie les 18 pages et refuse les métadonnées absentes/dupliquées, canoniques hors préfixe, articles noindex, incohérences de notice et de dates visibles, références internes cassées, médias locaux absents, sitemap incomplet et pages orphelines. Le H2→H4 est un avertissement, distinct d'une erreur. Les workflows existants exécutent ce contrôle et `test-seo.py` sur les propositions. Aucun test préexistant n'a été désactivé.

Travail récurrent : un article HTML, sa notice JSON et ses médias ; quatre commandes de génération, contrôles, relecture et PR. Le [guide pratique](../GUIDE-PUBLICATION-ARTICLES.md) détaille ces étapes. Le suivi Google reste une action du propriétaire, sans script publicitaire ni collecte de visiteurs.

## 10. Tests réellement exécutés

| Vérification | Résultat |
|---|---|
| API GitHub : #22, #23 et derniers runs main | Brouillons ouverts/non fusionnés ; Pages sur `86ee7cb…` |
| `audit-seo-public.py --output docs/seo/etat-public-20261104.json` | 18 HTML publics 200 et identiques à main ; ressources contrôlées 200 ; autres statuts section 3 |
| Relecture indépendante du relevé public | 17 titres/descriptions distincts, H1 uniques, canoniques et og:url cohérents, JSON-LD présent, pas de noindex, sitemap exactement égal aux 17 URL |
| `check-seo.py --output docs/seo/inventaire-branche.json` | 18 pages, 0 erreur, 1 avertissement H2→H4 |
| `test-seo.py` | 12 tests réussis : génération et idempotence, H1 contradictoire, noindex, préfixe perdu, page orpheline, ancre/média absent, description dupliquée, date visible manquante, omission du sitemap, dimensions d'image, sûreté JSON-LD et distinction des titres HTML/SVG |
| `test-publication.py` | 8 tests réussis, dont ajout/idempotence et dates explicites du sitemap |
| `test-article-editorial.py` | 7 tests réussis, 1 contrôle historique optionnel non exécuté (mode `--head`), annoncé comme tel |
| `test-portabilite.py` | Réussi sous Linux, encodage limité simulé et chemins avec espaces ; aucune exécution Windows locale prétendue |
| `update-article-editorial.py --check`, `sync-publication.py --check`, `update-reading-times.py --check`, `build-explorer-reconstruction.py --check`, `site_chrome.py --check` | Sorties cohérentes et génération idempotente |
| `check-conservation.py --revision 2cae9b575b70f58c14c75ff1a9ca11cc213ca101` | Contenus principaux, JSON-LD, illustrations et questions conservés |
| `node scripts/check-site.mjs`, `check-home.mjs`, onze suites `test-*.mjs` | Réussis ; vérifications statiques/DOM simulé distinguées du navigateur |
| `run-browser-recipe.py` avec Playwright 1.64.1 et Chromium système 155.0.8059.79 | 90 vues réussies ; Atlas, menus, clavier et sauvegarde native Aral réussis |
| `audit-final-links.py` | 214 requêtes réellement faites ; résultats mixtes détaillés section 6, pas « tous les liens valides » |
| Lighthouse Atlas public / local | Public inexploitable ; local 74/100, métriques et limites section 7 |
| `git diff --check` | Contrôlé avant commit ; aucune erreur de whitespace |

Des erreurs intermédiaires ont été corrigées et les contrôles concernés relancés : encodage déclaré manquant dans les nouveaux scripts, fixture de test incomplète, ordre d'insertion de métadonnée dans le générateur Explorer. Aucun test n'a été désactivé pour les résoudre. Les anciens tests historiques en échec décrits par l'audit final ne sont pas présentés comme nouvellement réussis ni supprimés.

Les résultats GitHub Actions propres à la PR SEO devront être consultés sur son SHA ; ne pas confondre les anciens runs #23 avec cette nouvelle validation. Le bilan final de la mission indique les runs réellement terminés.

## 11. Reproduire et limites

```sh
git fetch origin
python scripts/audit-seo-public.py --output work/seo-public.json
python scripts/check-seo.py
python scripts/test-seo.py
python scripts/test-publication.py
python scripts/update-article-editorial.py --check
python scripts/sync-publication.py --check
python scripts/update-reading-times.py --check
python scripts/build-explorer-reconstruction.py --check
python scripts/site_chrome.py --check
python scripts/check-conservation.py --revision 2cae9b575b70f58c14c75ff1a9ca11cc213ca101
```

Le contrôle public nécessite le réseau, les dépendances de `requirements-tools.txt` et les trois références distantes ; la validation locale n'utilise pas le réseau. Le relevé des ressources couvre les références directes HTML et Open Graph, pas tous les imports transitifs de CSS/JS ; la recette navigateur complète les contrôles locaux. Une réponse 200 ne certifie ni la pertinence scientifique d'une source ni l'absence de message d'erreur dans son contenu.

Aucune preuve d'indexation Google, analyse complète des résultats de recherche, donnée de backlinks, mesure de volume, propriété Google vérifiée au nom de l'utilisateur, inspection Googlebot réelle ou audit juridique n'est revendiquée. Les tests navigateur automatisés et deux captures représentatives ne constituent pas une certification WCAG ou un essai sur téléphone physique. Les scores Lighthouse restent des mesures de laboratoire.

## 12. Les cinq réponses opérationnelles

1. **Prêt pour l'indexation ?** Oui techniquement, avec les réserves ci-dessus ; l'état réel dans l'index reste à lire dans Google.
2. **Qu'est-ce qui limite la visibilité ?** Aucun blocage général constaté. Les facteurs à travailler sont la mesure absente ici, des prolongements thématiques à renforcer, la qualité/actualisation des contenus et une performance Atlas à mesurer publiquement. Leur effet sur le classement n'est pas quantifié.
3. **Action personnelle Google ?** Ouvrir la propriété de préfixe exacte, vérifier le propriétaire/balise réelle, soumettre le sitemap et inspecter les articles prioritaires. Suivre [le tutoriel](GOOGLE-SEARCH-CONSOLE.md).
4. **Deux articles par semaine ?** Réutiliser HTML + notice unique + médias, lancer les générateurs et contrôles, relire en PR, puis vérifier la publication autorisée. Bibliothèque et sitemap suivent automatiquement.
5. **Cinq actions prioritaires ?** Valider Search Console ; soumettre le sitemap et inspecter les pages ; intégrer les PR relues dans leur ordre de dépendance ; appliquer le maillage pertinent ; tenir la publication documentée et le suivi régulier.
