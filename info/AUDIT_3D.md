# Audit 3D — 20 novembre 2026

## 1. Pourquoi l'existant ne fait pas « jeu 3D »

Fichiers audités : `game/scenes/study/*` (bureau de Whitmore, `/prototype/bureau`), `game/scenes/office/*` (menu A, `/office`), `game/scenes/LandingStudyScene.tsx` (écran titre), `game/camera/CameraDirector.tsx`, `game/interactions/*`. Les fichiers `DetectiveOffice.tsx` et `CrimeScene.tsx` cités dans la demande n'existent pas dans ce dépôt.

| Constat | Effet sur le joueur |
|---|---|
| **Caméra sur rails** : 7 points de vue fixes + rotation de la tête au clic maintenu (bureau), cadrage fixe avec parallaxe (menu), travelling scripté (titre). Aucun déplacement libre. | On regarde une scène, on ne s'y trouve pas. C'est une illustration qu'on fait pivoter. |
| **Interface posée sur la 3D** : plaques HTML, panneaux latéraux, repères qui « respirent », contour lumineux au survol. | La lecture devient « site web avec un fond 3D ». Le contour lumineux signale ce qui est cliquable : c'est une aide d'interface, pas un geste de jeu. |
| **Géométrie primitive** : murs, bureau, classeur, téléphone, porte-manteau construits en boîtes, cylindres et tours (`RoundedBox`, `LatheGeometry`). Seuls quelques meubles viennent de Poly Haven. | Silhouettes simples et répétitives, échelle parfois douteuse (pardessus en cône). |
| **Textures dessinées au canevas** (carte, diplômes, avis, dossiers) à côté de textures PBR réelles. | Mélange de rendus : certaines surfaces « peintes » détonnent à côté du bois photoréaliste. |
| **Pièces de 6 × 5 m à 7 × 6 m** | Pas de profondeur de champ réelle, rien à explorer. |
| **Éclairage** correct mais concentré sur une lampe et une lune ; pas d'occlusion ambiante. | Les objets « flottent » un peu : peu de contact avec le sol. |
| **Audio** procédural (pluie, feu, horloge) sans lien avec la position du joueur. | Pas de sensation d'espace. |

Ce qui est sain et conservé : l'architecture R3F (scènes chargées à la demande, `Suspense`, `WebGLGuard`), le chargeur PBR (`usePbr`), le chargeur de modèles (`Prop`), le post-traitement mesuré, le moteur audio procédural, la règle « faits seulement ».

> Une tranche « parking 1979 » en vue subjective a été codée le 20/11 puis supprimée (retour à l'affaire THE LAST LETTER). Seul ce constat est conservé.
