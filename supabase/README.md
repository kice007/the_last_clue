# Supabase — à configurer à l'étape 3

Rien n'est encore créé. Étapes manuelles prévues :

1. Créer un projet sur https://supabase.com (région proche des joueurs).
2. Récupérer `Project URL` et la clé `anon` → `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), puis `VITE_DATA_SOURCE=supabase`.
3. Installer la CLI (`npx supabase login`, `npx supabase link --project-ref <id>`).
4. Appliquer les migrations (`supabase/migrations`) : tables du cahier §8.1, RLS sur toutes les tables, solutions dans un schéma privé.
5. Déployer les Edge Functions (création/jonction de salle, verdict).
6. Générer les types : `npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`.

La clé `service_role` reste dans les secrets des Edge Functions, jamais dans `.env.local` du front.
