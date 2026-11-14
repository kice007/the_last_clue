# THE LAST CLUE — Avancement et suite

> Jeu d'enquête criminelle coopératif à deux, dans le navigateur. Projet **privé**, joué par deux personnes.
> Mise à jour : 14 novembre 2026.
> Journal détaillé, session par session : `info/ETAT_PROJET.md`.

---

## 1. Où on en est

### Décisions prises

| Sujet | Décision |
|---|---|
| Première affaire | **THE LAST LETTER, version D « Les Deux Lettres »** (fusion des versions B et C). Bible complète validée : `info/scenarios/D_bible.md` |
| Langue | Tout en français ; architecture i18n prête pour l'anglais. Le titre et les noms propres restent en anglais |
| Caméra 3D | Points de vue fixes (7 dans le bureau) + rotation de la tête au clic maintenu. Pas de double-clic |
| Règle de jeu | **Le jeu n'affiche que des faits.** Aucune contradiction ni interprétation automatique : les joueurs notent les contradictions, relient les pièces et évaluent les preuves eux-mêmes |
| Preuves | Rien ne distingue une vraie preuve d'un objet ordinaire. Une pièce est numérotée seulement quand un joueur la met au dossier. Le nombre de vraies preuves n'est jamais révélé |
| Suspense | 5 retournements, 2 événements scénarisés, un dernier retournement dans la révélation (bible §13–14) |
| Difficulté | Difficile, 60 à 75 minutes, indices facultatifs payants (après 12 minutes sans progrès, −3 points chacun) |
| Accès | Jeu privé : écran titre, puis **compte obligatoire pour tout le reste** |
| Structure | Écran titre → connexion → menu de jeu → page de l'affaire → lobby → briefing → enquête. Plusieurs affaires prévues |
| Assets 3D | Poly Haven (CC0), listés dans `docs/ASSET_LICENSES.md` |

### Ce qui existe

**Conception (`info/`)**
- Cahier des charges et catalogue d'assets d'origine.
- 4 versions de l'affaire (`info/scenarios/A_…`, `B_…`, `C_…`, `D_…`) et la **bible de la version D** : chronologie minute par minute, 8 personnages, pièces et objets ordinaires avec leur rôle, environ 35 questions et confrontations, contradictions, chemin de déduction, verdict et barème, texte de la révélation.

**Maquettes (`info/tlc.pen`, Pencil)**
- Design system : palette, typographie, composants réutilisables (boutons, fiches, présence, répliques, champ, barre du haut de jeu).
- Écrans : 00 Écran titre · 02 Identification · 03 Lobby privé · 04 Briefing · 05 Quartier général (objets cliquables en relief) · 06 Scène de crime · 07 Dossier des preuves · 08 Fiches des personnages · 09 Interrogatoire · 10 Tableau d'enquête (glisser-déposer) · 11 Verdict · 12 Révélation · **Menu A** (bureau de l'inspecteur) · **Menu B** (menu classique) · Options · Page d'affaire THE LAST LETTER.
- L'ancienne landing « vitrine » est gardée comme archive.
- Les images IA des maquettes (`info/generated*.png|webp`) servent à la maquette uniquement. Leurs conditions d'utilisation sont à revalider avant d'en garder une dans le jeu.

**Code (phase 1 et prototype 3D)**
- Vite 8 + React 19 + TypeScript + Tailwind 4 + React Three Fiber + Zustand + Zod + i18next. Le client Supabase est prêt mais inactif ; les données de prototype sont isolées dans `src/data/cases/_prototype`.
- Toutes les routes du cahier existent, avec des écrans réservés pour celles qui ne sont pas encore construites.
- **`/prototype/bureau`** : le bureau de Whitmore en 3D.
  - Pièce complète, éclairage cinématique, pluie, éclairs, ambiance sonore.
  - 7 points de vue et rotation à la souris.
  - 15 objets examinables : 4 de l'affaire, 11 ordinaires.
  - Fiche d'examen avec l'objet qui tourne, dossier local.
- `/prototype/assets` (développement uniquement) : planche de comparaison des modèles.
- Scripts : `scripts/shot.mjs` et `scripts/shot-study.mjs` (captures), `scripts/test-camera.mjs` (test des gestes), `scripts/fetch-polyhaven.mjs` (téléchargement des assets).
- `npm run build` passe.

---

## 2. Décision en attente

- **Menu A** (bureau de l'inspecteur, objets cliquables en relief) **ou Menu B** (menu 2D classique) ? Recommandation : A.

---

## 3. La suite, dans l'ordre

### Étape 2 — Multijoueur (Supabase)
1. Créer un projet Supabase gratuit. C'est à faire par toi : URL et clé `anon` à mettre dans `.env.local`. Voir `supabase/README.md`.
2. Migrations : profils, sessions, joueurs d'une session (maximum 2), pièces découvertes, interrogatoires, notes (communes et privées), liens du tableau, verdicts. **RLS sur toutes les tables**, solutions dans un schéma privé.
3. Connexion et profil d'inspecteur (écran 02).
4. Salle privée : code d'invitation, lobby, présence, statut « prêt » (écran 03).
5. Synchronisation des pièces du bureau 3D entre deux navigateurs, sans doublon, avec reprise après rechargement.

### Étape 3 — Structure de navigation
6. Écran titre, menu de jeu (A ou B), Options (préférences par joueur), page d'affaire (`/office`, `/cases/:caseId`).
7. Reporter dans le code la nouvelle structure (la landing codée est encore l'ancienne version).

### Étape 4 — Enquête complète
8. Données de l'affaire D au format des schémas : personnages, questions, conditions, pièces, faits.
9. Briefing (04), quartier général en 3D (05), dossier des preuves (07), fiches (08).
10. Moteur d'interrogatoire déterministe (09) : questions, confrontations, déblocages, événements scénarisés.
11. Tableau d'enquête en glisser-déposer (10), synchronisé.
12. Deuxième lieu en 3D : la chambre de l'intendante (armoire à pharmacie, photographie, carnet des ordres…).
13. Verdict à deux signatures validé côté serveur (Edge Function), puis révélation et barème (11, 12).
14. Indices facultatifs (téléphone du quartier général).

### Étape 5 — Finitions
15. Portraits définitifs des personnages et visuels sous licence claire.
16. Sons sourcés (pluie, feu, papier, horloge), en complément de l'audio procédural.
17. Optimisation des assets (compression glTF, textures KTX2 ; 70 Mo aujourd'hui).
18. Tests à deux sur deux ordinateurs (critères AC-01 à AC-14 du cahier des charges).
19. Déploiement (Vercel).

---

## 4. Lancer le projet

```bash
npm install
npm run dev          # http://localhost:5173 — prototype 3D : /prototype/bureau
npm run build
```

> ⚠️ **Spoilers** : `info/scenarios/` contient la solution de l'affaire. Si le dépôt est public, ou si ta partenaire y a accès, elle peut la lire.
