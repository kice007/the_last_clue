# Supabase — base de données du jeu

La base est **prête et testée** : `migrations/20261114000000_init.sql` (schéma, sécurité, fonctions) et `seed.sql` (THE LAST LETTER et sa solution privée).

## Tester sans compte

```bash
npm run test:db
```

Cette commande lance un PostgreSQL éphémère (PGlite), applique la migration et les données, puis joue les critères d'acceptation : créer une salle, la rejoindre, refuser un troisième joueur, reconnexion, collecte sans doublon, notes privées, tableau partagé, solution inaccessible, verdict à deux signatures, barème et issues.

## Mise en ligne (à faire une fois, environ 10 minutes)

1. Créer un compte et un projet gratuit sur https://supabase.com. Choisir une région proche (par exemple « Canada (Central) »).
2. **SQL Editor** → coller et exécuter `migrations/20261114000000_init.sql`, puis `seed.sql`.
3. **Authentication → Providers → Email** : laisser activé. Pour un usage à deux, on peut désactiver « Confirm email ».
4. **Project Settings → API** : copier `Project URL` et la clé `anon public` dans `.env.local` :
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_DATA_SOURCE=supabase
   ```
5. Ne jamais copier la clé `service_role` dans le projet.

## Ce que la base garantit

| Règle | Comment |
|---|---|
| Un joueur ne voit que ses sessions | RLS + `is_session_member()` |
| Deux joueurs maximum | `join_session()` verrouille la session dans une transaction |
| Code d'invitation non devinable | 6 signes tirés d'une source cryptographique ; seule l'empreinte SHA-256 est stockée ; valable 30 minutes ; 10 tentatives par tranche de 10 minutes |
| Pièce numérotée une seule fois | `collect_evidence()` est idempotente, avec une contrainte d'unicité |
| Notes privées invisibles du partenaire | Politique RLS sur `visibility` |
| Solution jamais envoyée au navigateur | Schéma `private`, sans droit d'accès pour les joueurs |
| Verdict impossible à truquer | Écriture uniquement via `save_verdict_draft()` / `sign_verdict()` ; le score est calculé côté serveur à la seconde signature |
| Révélation après validation seulement | Le texte n'est copié dans le résultat qu'au moment du verdict |

## Fonctions appelables par le client

`create_session(case)`, `join_session(code)`, `set_ready(session, bool)`, `collect_evidence(session, examinable)`, `record_interrogation(session, node)`, `save_verdict_draft(session, payload)`, `sign_verdict(session)`.

## Plus tard (étape 4)

Mettre en base les données d'interrogatoire (conditions de déblocage), afin que `record_interrogation()` vérifie côté serveur qu'une question est bien accessible.
