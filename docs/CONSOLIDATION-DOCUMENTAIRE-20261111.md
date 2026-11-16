# Consolidation des accès documentaires — 11 novembre 2026

Cette proposition réunit l’audit local `5da3f4692f7488e376894fab75760d3379029f5d`
et les seules solutions documentaires fiables de la [PR #28](https://github.com/thot-culture/Thot/pull/28),
tête examinée `ba48fe4559cd0c6f5d2116cd307896d47d256e47`.
Le socle est le main actuel `6ec1985043303aa689e66587e35cf69f2e1e56ac`.
La branche d’audit initiale est conservée. Aucun contenu historique, activité,
crédit, licence ou média n’est modifié ; les seuls changements de production
portent sur les bibliographies de cinq articles.

| Ensemble | Décision consolidée |
| --- | --- |
| Roubaix, AFF_001_D_0150, AFF_001_D_0632, AFF_001_D_0759, AFF_001_D_0705 | Reprise des quatre accès au service officiel proposés par #28, avec chaque cote conservée. Les libellés distinguent le service de l’affiche. Les notes n’affirment plus une maintenance temporaire non vérifiée. |
| Roubaix, AFF_001_D_0685 et AFF_001_D_0694 | Conservation des voies de demande ajoutées par l’audit, des références et des limites de consultation. |
| Roubaix, 4H140 (1917) | Conservation du lien direct vers la notice descriptive FranceArchives ; reproduction numérique non confirmée. |
| Autorité, article R421-8 | Conservation du lien direct Légifrance, même version au 20 juin 2026. |
| SIGAR, Quarterly Report to the United States Congress, 30 octobre 2021 | PDF conservé au CyberCemetery de l’université du North Texas ; copie ecoi.net préexistante conservée. Les deux exemplaires ont la même empreinte SHA-256 et comptent 195 pages. |
| Pieuvres, Hanlon et al. (2009), Mäthger et al. (2009), Allen et al. (2014) | Conservation des deux accès intégraux PMC et du PDF de l’université de Pittsburgh, avec DOI d’origine conservés. |
| Plantes, Seltzer et al., eLife 13:RP104700 | Conservation du PDF éditeur de la version définitive du 5 janvier 2026, DOI .3 conservé. |
| Coalition contre Daech, Feuille de route de Paris du 25 juin 2019 | PDF anglais de #28 exclu : il redirige lui aussi vers l’accueil du ministère. Référence américaine et lien historique français conservés, sans promesse d’accès réparé. |
| Contrôle externe | Inventaire des sources dynamiques, titres et destinations, détection des erreurs masquées par HTTP 200 ; aucun refus 401/403/429 ne provoque un remplacement automatique. |

Les quatre renvois de #28 sont intégrés une seule fois. Le manifeste
`docs/audit-final/liens-repares.json` conserve les fragments avant/après exacts,
la provenance et les observations. Il contient dix-sept amendements de cet audit
et de sa consolidation, plus le correctif Oxford antérieur déjà présent dans main.
La comparaison du reste des articles reste stricte, bibliographies comprises.

**Accès restant limités.** Aucune consultation directe des affiches aux six cotes
AFF_001_D_0685, AFF_001_D_0150, AFF_001_D_0632, AFF_001_D_0694,
AFF_001_D_0759 et AFF_001_D_0705 n’est revendiquée. La cote AFF_001_D_0685
reste sans notice individuelle retrouvée. Les deux variantes de la notice
L’Armarium `/document/85546` affichent une erreur Omeka ; le lien de demande
conserve la possibilité de contacter le service. La notice 4H140 ne remplace pas
la lecture des affiches. Pour Paris, les PDF français et anglais rejoignent
l’accueil ; la consultation directe de l’archive américaine n’a pas abouti.
Les autres protections automatiques ou incidents relevés lors de l’audit
restent des limites de vérification et ne prouvent pas une suppression.

**Conflits et conservation de l’atlas.** Une simulation de fusion de #28 avec main
produit trois conflits : `assets/explorer-v2/atlas.js`,
`explorer/atlas/rome-expansion.html` et `scripts/explorer_atlas_view.py`.
La présente proposition conserve ces trois fichiers strictement identiques à main,
ainsi que les données, médias et autres ressources d’Explorer. Les optimisations
plus récentes déjà intégrées, notamment #30, sont ainsi conservées.
Après consolidation, tenter aussi de fusionner #28 provoquerait six conflits :
les trois précédents, les deux articles Roubaix/Puissance et le manifeste des liens.
Ces simulations n’ont pas modifié la copie de travail et #28 n’a pas été fusionnée.

**Vérifications locales de la version consolidée.**

| Contrôle | Résultat |
| --- | --- |
| `node scripts/validate.mjs --python …` | 43/43 commandes réussies, 0 échec ; code consolidé au commit local `2dc50f1c537a917db3f1ab29b4a0557abd03eb41`. |
| `scripts/check-conservation.py --revision origin/main` | Réussi : contenu principal, données structurées, catalogue et questions conservés avec les seuls amendements documentés. |
| `scripts/check-editorial.py` | Réussi : comparaison historique, bibliographies, crédits et catalogue. |
| `scripts/test-preview-http.py` | 4 tests réussis ; 20 pages et 136 URL/ressources vérifiées réellement sous `/Thot/`. |
| `git diff --check` | Réussi. |
| Comparaison des ressources Atlas/Explorer avec main | Aucune différence. |
| Navigateur, aperçu localhost | Références et libellés inspectés dans les cinq articles modifiés ; quatre accès Roubaix présents avec leurs cotes et leurs limites, accès libres conservés, avertissement PDF Paris visible. |
| Navigateur, destinations externes ciblées | Page officielle des Archives municipales lisible ; cote 4H140 et titre/date de l’article R421-8 confirmés. Erreur Omeka et redirection du PDF anglais vers l’accueil reconfirmées. |

Les cinq articles ont été ouverts dans le navigateur intégré, en lecture seule.
Ce contrôle ciblé ne remplace pas une recette visuelle complète sur tous les appareils.
Les PDF et identifiants des accès libres avaient été vérifiés lors de l’audit du même jour ;
ils n’ont pas été changés pendant cette consolidation. Les nouvelles exécutions CI
Linux/Windows et navigateur devront être consultées sur la PR avant intégration.
Un test optionnel de comparaison de révision est signalé « skipped » par la suite
éditoriale ; le contrôle global de production est exécuté séparément. Le cas réel
de lien symbolique annonce EPERM sur cet environnement Windows.

**Procédure d’intégration.**

1. Relire cette PR consolidée sur le main indiqué et attendre ses contrôles GitHub.
2. Si main évolue, remettre cette branche à jour et rejouer les contrôles ; conserver
   les fichiers Atlas/Explorer de main.
3. Ne pas fusionner #28 en plus : ses solutions Roubaix sont reprises ici, son PDF
   anglais n’est pas valide, ses changements d’atlas recouvrent des travaux plus récents.
4. Obtenir l’autorisation explicite du responsable avant toute fusion dans main
   ou publication du site. Après l’intégration autorisée de cette proposition,
   fermer #28 comme remplacée après vérification qu’aucun autre travail n’y reste à reprendre.

Aucune fusion, activation d’auto-fusion ou publication du site n’est effectuée dans
le cadre de cette préparation. La PR #28 reste ouverte et inchangée.

## Réexamen documentaire du 16 novembre 2026

Le réexamen part de `main` `6ec1985043303aa689e66587e35cf69f2e1e56ac`
et de la tête de PR `2c810d283a00bc11a001fb53b8781b2ad1d775d7`.
Les quatre jobs des runs [portable](https://github.com/thot-culture/Thot/actions/runs/43042842110)
et [navigateur](https://github.com/thot-culture/Thot/actions/runs/43042842124)
sont réussis sur cette tête ; l'ancien échec d'installation Linux est résolu.

Les PDF SIGAR UNT et ecoi.net téléchargés de nouveau sont identiques : 195 pages,
SHA-256 `a1c977e911fe0dd6653c87dc65092e44ed741c7ab72ffcf344922be8d64fe672`.
Les deux textes PMC, le PDF Pittsburgh et la version définitive eLife correspondent
aux titres et identifiants cités ; les empreintes des deux derniers PDF sont
inchangées par rapport au manifeste. Chromium confirme R421-8 à la date du
20 juin 2026, la notice FranceArchives 4H140 (1917) et les coordonnées du service
de Roubaix. La notice ne constitue pas une reproduction de l'affiche et les six
cotes restent conservées sans promesse de consultation directe.

Les deux variantes L'Armarium affichent encore une erreur Omeka. Les PDF français
et anglais de Paris redirigent vers l'accueil France Diplomatie. Le titre et la
date du communiqué américain (25 juin 2019) restent indexés, mais son URL affiche
une page `Technical Difficulties`, HTTP 200, avec `Exception: forbidden`.
Cette réponse échappait au signal de relecture du nouvel auditeur : ajout du seul
titre `technical difficulties` à la détection des erreurs HTML, avec un cas de
non-régression. Aucun lien ni contenu de production supplémentaire n'est modifié.

Les cinq tests documentaires passent, y compris sur la réponse américaine réelle.
Les 43 commandes locales avec les versions déclarées, les quatre tests HTTP et
la comparaison éditoriale optionnelle `--head HEAD` ont également réussi avant
ce correctif ciblé. Les cinq articles entiers sont identiques à main après
application des seuls dix-sept fragments documentaires du manifeste ; les autres
fichiers de production sont inchangés. Le lanceur complet a ensuite été relancé
après le correctif : 43/43 commandes réussies. La recette HTTP Chromium contrôle
350 URL, 216 ancres, cinq largeurs, les commandes Atlas et la persistance native
des jeux sans erreur. La CI doit également réussir sur le nouveau commit avant
fusion. Les PR #28 et #35 restent hors intervention.
