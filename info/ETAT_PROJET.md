# THE LAST CLUE — État du projet

## Reprendre ici (2026-11-14, fin de session 8)

- **Jeu privé** (l'utilisateur et sa compagne) : pas de marketing. La landing devient un **écran titre** (« Entrer au poste ») ; tout le reste demande un compte, y compris la page d'affaire.
- Nouvelle structure : écran titre → connexion → **menu de jeu** → **page de l'affaire** → lobby → briefing → enquête. Plusieurs enquêtes prévues.
- Maquettes ajoutées dans `tlc.pen` (x = 20800 à 27200) : 00 Écran titre, **Menu A** (bureau de l'inspecteur, objets cliquables en relief), **Menu B** (menu 2D classique), Options (son / affichage / commandes / langue / compte), page « Affaire — THE LAST LETTER ». L'ancienne landing est renommée « archive ».
- **En attente : choix entre Menu A et Menu B.**
- Routes à prévoir : `/office` (menu), `/cases/:caseId` (page d'affaire).

## Session 7

- **Règle de conception : le jeu n'affiche que des faits.** Aucune contradiction ni interprétation automatique ; les joueurs notent les contradictions, posent les liens et évaluent les pièces. Appliquée aux maquettes 05–12, au prototype 3D (fiches « Détails » factuelles dans `studySlice.ts`) et à la bible (§0).
- 05 Quartier général : objets cliquables en relief (chevalet + tableau, pile de dossiers, éventail de photographies, téléphone ; images IA détourées), état de survol (objet soulevé, halo laiton, plaque gravée). À coder plus tard comme une scène 3D, à la manière du bureau.
- 10 Tableau d'enquête refait pour le glisser-déposer : tiroir « À épingler », carte en cours de déplacement, lien tiré à la souris et nommé par le joueur, curseur du partenaire, modes Déplacer / Relier / Hypothèse / Effacer, chronologie à remplir.
- Landing revue : accroche de la version D, vrais portraits des suspects, nouvelle section « La scène », plus aucun nombre de preuves affiché. Lobby revu : manoir sous la pluie, places en cartes d'inspecteur, affaire « Difficile · 60 à 75 min ».
- À reporter dans le code de la landing (encore l'ancienne version) après validation.

## Session 6

- Bible D **validée** par l'utilisateur.
- **Maquettes des écrans de jeu dans `info/tlc.pen`** (x = 6400 à 19200, y = 0) : 04 Briefing, 05 Quartier général (bibliothèque), 06 Scène de crime (3D + fiche d'examen), 07 Dossier des preuves, 08 Fiches des personnages, 09 Interrogatoire (Clara), 10 Tableau d'enquête, 11 Verdict, 12 Révélation. Nouveau composant `HUD / Top`. Portraits IA (Pencil Generate, un à la fois) : victime, Clara, Isabel, Constance, Victor, Lucy, Rose, Graves.
- Ensuite : validation des maquettes → étape 2 multijoueur (Supabase) → chambre de l'intendante en 3D.

## Session 5

- **Bible de l'affaire D écrite** : `info/scenarios/D_bible.md` (chronologie canonique, 8 personnages, 12 pièces + éléments de contexte, 19 objets ordinaires avec rôle, ~35 questions et confrontations, contradictions, chemin de déduction, verdict et barème, texte de la révélation). Les 4 points ont été tranchés (§13) pour maximiser le suspense ; structure en 5 retournements (§14), 2 événements scénarisés (Constance exige l'arrestation d'Isabel ; Clara accuse Victor) et un retournement final (Whitmore savait). En attente de relecture.
- Ensuite : maquettes Pencil des écrans de jeu → multijoueur (Supabase) → chambre de l'intendante en 3D.

## Session 4

- Retour utilisateur : bureau et ambiance validés ; objets pas assez « polis » ; veut pouvoir examiner des objets **sans lien avec l'affaire** pour faire durer le suspense.
- Fait : 15 objets examinables (4 de l'affaire D : E03, E05 registre, E07, E08 ; 11 objets ordinaires : lunettes, loupe, bougeoir, carafe, pendule, éléphant, étui à cigarettes, échiquier, buste, cheval de porcelaine, vase) — catalogue dans `src/data/cases/_prototype/studySlice.ts` (`kind` interne, jamais affiché).
- Règle de jeu : aucun indice visuel ne distingue une preuve d'un objet ordinaire ; numéro de pièce attribué seulement à la mise au dossier ; plus de compteur « / 12 ».
- 7 points de vue (ajout : fauteuil, bibliothèque). Modèles Poly Haven supplémentaires (31 assets CC0 au total). Registre, carafe en cristal, bureau aux arêtes adoucies, dos de livres reliés.
- Page de comparaison des assets (dev uniquement) : `/prototype/assets`.
- Caméra : déplacement **uniquement par les points de vue fixes** (le double-clic pour s'approcher a été essayé puis retiré à la demande de l'utilisateur) ; **clic maintenu + glisser** = rotation de la tête (gauche/droite, haut/bas limité à ±38°) ; un point de vue du menu ramène au cadrage fixe. Un glisser n'ouvre jamais un objet. Tests : `node scripts/test-camera.mjs <dossier>` (serveur de dev requis).

## Session 3

- **Version D retenue.** Caméra : **points de vue fixes** (choix utilisateur).
- **Preuve 3D (vertical slice) faite** : `/prototype/bureau` (lancer `npm run dev`). Bureau de Whitmore en 3D : pièce complète, 15 modèles + 7 textures Poly Haven CC0 (`docs/ASSET_LICENSES.md`), 5 points de vue (seuil, bureau, cheminée, fenêtre, sous le bureau), 3 pièces examinables de la version D (E03 verre et mouchoir, E07 cendres, E08 bouton de nacre) avec fiche d'examen et objet rotatif, dossier local, ambiance procédurale pluie + feu + horloge, post-production (bloom, vignettage, grain, contour au survol), éclairs.
- Captures : `node scripts/shot-study.mjs <dossier>` (serveur de dev sur le port 5190).
- **Suite proposée** : validation de la DA 3D par l'utilisateur → bible de l'affaire D → maquettes Pencil des écrans de jeu en surimpression → étape 2 multijoueur.
- Limites connues : cheminée encore simple (pas de flammes), pas de corps (choix : emporté avant l'arrivée des inspecteurs), assets non optimisés (46 Mo, à compresser).

## Session 2

- Version D « Les Deux Lettres » (fusion B + C) écrite à la demande : `info/scenarios/D_les_deux_lettres.md`. **Version D retenue par l’utilisateur.**
- Maquette `info/tlc.pen` commencée et enregistrée : design system (variables, palette, typo, 10 composants réutilisables), 01 Landing, 02 Identification, 03 Lobby privé. Images IA : hero (`generated.png`) et silhouette de suspect (`generated-1.png`).
- **En attente : validation de la direction artistique** avant les écrans de jeu (briefing, bureau, scène, preuves, suspects, tableau, verdict/révélation).
- Les rôles des quatre suspects affichés sur la landing (famille, personnel, invité, associé) sont provisoires et devront suivre le scénario retenu.

## Session 1

**Fait**
- Trois versions de l'affaire THE LAST LETTER : `info/scenarios/` (A Le Second Manteau, B L'Heure empruntée, C Le Pacte du silence + README comparatif). **En attente du choix de l'utilisateur.** Recommandation : A.
- Phase 1 du code : Vite 8 + React 19 + TS 7 + Tailwind 4 + R3F 9 + i18next + Zustand + Zod + Supabase client (inactif). Toutes les routes réservées. Landing provisoire avec scène 3D procédurale (enveloppe cachetée + montre). `npm run build` OK.

**En attente**
- Choix du scénario → écrire la bible complète de l'affaire retenue (questions, plan des lieux, révélation).
- Maquette Pencil `info/tlc.pen` (fichier vide) : l'utilisateur doit l'ouvrir dans Pencil. Écrans : landing, auth, lobby, briefing, bureau, scène, preuves, suspects, tableau, verdict/révélation. La landing codée sera réalignée sur la maquette validée.
- Étape 3 : Supabase (voir `supabase/README.md`).

**Décisions**
- MVP 100 % français, architecture i18n prête pour l'anglais ; THE LAST CLUE et noms propres en anglais.
- Données fictives de prototype isolées dans `src/data/cases/_prototype`, servies par `src/services/mock`.
- Pas de flèche dans les boutons texte.
