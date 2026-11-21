# THE LAST CLUE — État du projet

## Reprendre ici (2026-11-21, session 11) : pièce Blender dans le jeu

**État : la pièce précalculée s'affiche dans `/prototype/bureau`, mais une dernière passe de calcul reste à faire. Tout est commité et poussé sur main (dce2b8e, 21/11).**

- **Fait** :
  - `tools/blender/bake_study.py` (lancé après `whitmore_study.py` dans la même session Blender) calcule la lumière de la pièce et exporte `public/assets/scenes/whitmore/room.glb` (Draco, environ 10,5 Mo), les lightmaps `lm_room/lm_furniture/lm_small` et le manifeste `src/game/scenes/study/bakedStudy.json`.
  - `src/game/scenes/study/BakedRoom.tsx` affiche la pièce en `MeshBasicMaterial` avec sa lightmap (UV n° 2), avec le vacillement de la lampe et les éclairs.
  - `StudyScene.tsx` remplace `Room` et `Furniture` par `BakedRoom` et `WindowNight` (tone mapping AgX, exposition 2,5).
  - Les lumières en temps réel de `Lighting.tsx` n'éclairent plus que les objets examinables, qui restent à part : survol, contour et examen fonctionnent comme avant.
  - Les positions de `studySlice.ts` sont recalées sur les meubles Sketchfab. Point de vue « fauteuil » recadré. Décodeur Draco dans `public/draco/`. `tsc -b` passe.
- **Commande complète** (environ 12 min, beaucoup de mémoire : fermer la fenêtre Blender et les onglets avant) :
  1. `Y:/downloads/blender/blender.exe -b --factory-startup --python tools/blender/whitmore_study.py --python tools/blender/bake_study.py -- <dossier tmp> none 256`
  2. `python tools/blender/lightmaps_webp.py` (PNG vers WebP)
- **À faire** :
  1. **Relancer le calcul.** Le dernier lancement a été tué par Windows faute de mémoire, en même temps que le serveur de dev. Ce lancement ajoutait le groupe « vc » : la lumière des maillages sculptés très denses (cheminée, tapis, lustre) est stockée dans les couleurs des sommets, parce que leurs UV se découpent en îlots de 1 à 2 px. Le code est prêt dans `bake_study.py` et `BakedRoom.tsx`. Les fichiers de `public/assets/scenes/whitmore/` viennent encore du calcul précédent : la cheminée y est trop sombre.
  2. Vérifier les captures : cheminée, coin du fauteuil (encore sombre, ajouter une lumière d'appoint dans Blender si besoin), exposition générale (le jeu est un peu plus sombre que le rendu Blender).
  3. L'utilisateur teste `npm run dev -- --port 5190`, puis ouvre http://localhost:5190/prototype/bureau.
  4. Plus tard : écran de connexion 02, lobby 03, réglages Supabase (désactiver « Confirm email », vérifier la ligne `cases` the_last_letter).
- **Pièges** :
  - Fusionner les objets par groupe avant le calcul (sinon 26 min au lieu de 42 s).
  - Pas de tuilage automatique (« Error writing tile file »).
  - UV de lumière dépliées objet par objet, cases proportionnelles à √(surface).
  - Ne jamais tuer « blender » par son nom : la fenêtre Blender de l'utilisateur serait fermée aussi.

## Session 10 (2026-11-20)

- Essai d'une scène en vue subjective (parking de centre commercial, 1979) **abandonné et supprimé** à la demande de l'utilisateur : retour à l'affaire THE LAST LETTER (Blackwood Manor, 1908).
- Reste de l'essai : `info/AUDIT_3D.md` (pourquoi le rendu actuel fait « site » et pas « jeu »), valable pour la suite.
- Question en cours : comment obtenir un rendu plus réaliste (piste Sketchfab, scans, éclairage précalculé).
- **Blender 5.3** (portable, `Y:/downloads/blender/blender.exe`, RTX 5060 en OptiX) piloté par script : `tools/blender/whitmore_study.py` reconstruit le bureau de Whitmore (même plan que la scène WebGL, objets Poly Haven, lambris, corniche, fenêtre, rideaux, cheminée, bureau, bibliothèque, tapis procédural) et rend les points de vue en Cycles (`blender -b --factory-startup --python tools/blender/whitmore_study.py -- <sortie> seuil,bureau,cheminee 256`, ~20 s par vue). Pièges : le verre de la lampe Poly Haven bloque la lumière (rendu transparent aux rayons d'ombre), la flamme est à y ≈ 1,08. Constat : la lumière gagne beaucoup, les objets faits par script restent « plastique » → besoin de modèles Sketchfab. Pas encore d'export vers le jeu (lumière précalculée + glTF).
- **Meubles Sketchfab intégrés** (8 GLB CC-BY dans `tools/blender/sketchfab/`, hors git ; crédits dans `docs/ASSET_LICENSES.md`) : bureau, tapis Heriz, cheminée sculptée (marbre appliqué, encastrée dans le conduit), rideaux (voilage retiré), fauteuil capitaine, Chesterfield, bibliothèque, pile de livres. Plateau du bureau à 0,736 m (mesuré par rayon) : les objets posés dessus et ceux de la tablette de cheminée (bord x −2,96, dessus 1,239) ont bougé par rapport à `studySlice.ts`, à reporter dans le jeu. Le Chesterfield bouche le point de vue « fauteuil » : à recadrer. Rendus et comparaison : `tools/blender/rendus/` (hors git).

## Session 9 (2026-11-20)

- **Menu A retenu.** Frames de `tlc.pen` rangées dans l'ordre du parcours (1 Écran titre → 14 Révélation sur une ligne, étiquettes de phase au-dessus ; Options en annexe ; ancienne landing en archive). Le Menu B n'existe plus dans le fichier.
- **Supabase** : la limite de 2 projets gratuits est atteinte sur le compte de l'utilisateur → le projet sera créé sur un autre compte (le sien ou celui de sa compagne, qui l'invite dans l'organisation). Rien à changer dans le code. Elle ne doit pas ouvrir `seed.sql` (solution).
- **Codé** :
  - `/` = **écran titre** (`src/features/title/TitleScreen.tsx`) : lettre et montre en 3D (`LandingStudyScene`), « Entrer au poste », touche Entrée, fondu vers `/office`.
  - `/office` = **bureau de l'inspecteur en 3D** (`src/features/office/OfficeMenuPage.tsx`, scène `src/game/scenes/office/`) : pièce procédurale (carte du comté, avis, diplômes, classeur à tiroir ouvert, lampe de banquier, téléphone chandelier, porte-manteau, suspension, pluie, éclairs). 6 objets-menu (`officeSpots.ts`) : survol = objet soulevé + contour laiton + plaque gravée ; clic = la caméra s'approche puis ouvre. Classeur → `/cases/the_last_letter`, téléphone → panneau « code de la salle » (alphabet des codes Supabase) → `/lobby/:code`, papiers → grisé « Aucune enquête en cours », diplômes → `/history`, lampe → `/options`, porte-manteau → `/`. Navigation au clavier par les plaques (Tab + Entrée).
  - Routes réservées ajoutées : `/cases/:caseId`, `/options`. Ancienne landing supprimée du code (namespace i18n `landing` remplacé par `menu`).
  - Captures : `node scripts/shot-menu.mjs <dossier>` (serveur de dev sur 5190 ; `SETTLE=30000` en rendu logiciel).
- **Provisoire** : nom « Insp. Reyes · Hors ligne » et « Bureau de l'inspecteur Hale » écrits en dur jusqu'aux profils ; la connexion s'intercalera entre l'écran titre et le bureau.
- **Jeu branché sur Supabase** (`VITE_DATA_SOURCE=supabase` dans `.env.local`, clé publishable uniquement) :
  - `src/services/types.ts` : contrat `auth` (inscription, connexion, déconnexion, nom de service), `cases`, `sessions` (create, join, setReady, get, listMine, subscribe), `evidence` (collect, list, subscribe) ; erreurs typées `GatewayError` (`not_authenticated`, `invalid_code`, `room_full`, `rate_limited`, `confirmation_required`…).
  - `src/services/supabase/index.ts` : adaptateur réel (RPC du schéma, Realtime = simple signal de relecture). `src/services/mock/index.ts` : mêmes règles, en local.
  - `src/lib/supabase/database.types.ts` écrit à la main d'après la migration (à tenir à jour).
  - `src/stores/authStore.ts` (démarré dans `main.tsx`). Bureau : nom de l'inspecteur connecté, « Reprendre » actif s'il existe une salle en attente ou une partie en cours, porte-manteau = déconnexion.
  - Vérifié contre le projet en ligne, sans compte : tables présentes, catalogue fermé aux anonymes, RPC refusées sans connexion, erreurs bien traduites. Les parcours connectés restent à tester avec de vrais comptes.
- Supabase côté utilisateur : « Confirm email » encore actif ; `seed.sql` non vérifiable sans compte (vérifier qu'il y a 1 ligne dans `cases`).
- **Ensuite** : dès les clés Supabase → connexion + profil (02), lobby (03), présence du partenaire dans le bureau, « Reprendre » actif quand une session existe ; puis page d'affaire et Options.

## Session 8 (2026-11-14)

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
