# THE LAST CLUE

Jeu d'enquête criminelle coopératif à deux joueurs, dans le navigateur.
Référence : `info/THE_LAST_CLUE_Cahier_des_charges_MVP.md`.

## Démarrer

```bash
npm install
cp .env.example .env.local   # facultatif en phase 1 : le mode prototype fonctionne sans
npm run dev                  # http://localhost:5173
npm run build                # vérification TypeScript + build de production
```

## Architecture (phase 1)

| Dossier | Rôle |
|---|---|
| `src/app` | Router (toutes les routes du jeu, écrans réservés), providers |
| `src/styles/globals.css` | Design tokens (palette du cahier §6, typo, mouvement) |
| `src/i18n` | i18next. MVP en français ; l'anglais retombe sur le français. Le contenu des affaires porte ses propres traductions (`LocalizedText`) |
| `src/data/schemas` | Schémas Zod : `case.ts` (public), `caseSecret.ts` (solution, **serveur uniquement**) |
| `src/data/cases/_prototype` | Données fictives de prototype, isolées, sans solution |
| `src/services` | Couche d'accès aux données : `getGateway()` choisit `mock` ou `supabase` (`VITE_DATA_SOURCE`) |
| `src/lib/supabase` | Client Supabase créé à la demande ; `null` tant que non configuré |
| `src/lib/audio` | Ambiance de pluie procédurale (Web Audio) + registre d'effets Howler |
| `src/game/scenes` | Scènes React Three Fiber, chargées à la demande |
| `src/stores` | Zustand : préférences audio, miroir de session |
| `supabase/` | Migrations, Edge Functions, seed (étape 3) |

Règles : la solution d'une affaire n'est jamais importée par le code client ;
les composants n'importent jamais un adaptateur de données directement ;
Three.js n'est chargé qu'avec une scène 3D.

## Outils

`node scripts/shot.mjs <chemin> <sortie.png> [largeur] [full]` : capture du serveur de dev (port 5190) avec erreurs console.
Sous Git Bash, préfixer par `MSYS_NO_PATHCONV=1`.
