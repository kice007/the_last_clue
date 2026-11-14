# Données de prototype — NE PAS UTILISER EN PRODUCTION

Ces données sont fictives et neutres. Elles servent uniquement à faire tourner
les écrans pendant les phases 1 à 2, avant que l'affaire définitive soit choisie
(voir `info/scenarios/`) et avant la configuration de Supabase.

- Elles sont chargées **seulement** par l'adaptateur `src/services/mock`.
- Elles ne contiennent **aucune solution** : la solution ne vit jamais dans le code client.
- Elles seront supprimées quand `VITE_DATA_SOURCE=supabase` sera actif.
