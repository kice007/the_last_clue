// Test de la base THE LAST CLUE sur un PostgreSQL éphémère (PGlite), sans compte Supabase.
// Usage : node supabase/tests/db.test.mjs <chemin vers node_modules contenant @electric-sql/pglite>
// Simule l'environnement Supabase (rôles, auth.uid(), publication Realtime), puis joue
// les critères d'acceptation AC-01 à AC-13 qui relèvent de la base.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const modules = process.argv[2]
const { PGlite } = await import(pathToFileURL(join(modules, '@electric-sql/pglite/dist/index.js')).href)
const { pgcrypto } = await import(pathToFileURL(join(modules, '@electric-sql/pglite/dist/contrib/pgcrypto.js')).href)

const db = new PGlite({ extensions: { pgcrypto } })
let failures = 0
const ok = (cond, label) => {
  console.log(`${cond ? '✓' : '✗'} ${label}`)
  if (!cond) failures++
}
const rejects = async (fn, pattern, label) => {
  try {
    await fn()
    ok(false, `${label} (aucune erreur levée)`)
  } catch (e) {
    ok(pattern.test(e.message), `${label} → « ${e.message} »`)
  }
}

// ——— Environnement Supabase minimal ———
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema extensions;
  create schema auth;
  create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create publication supabase_realtime;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
`)

await db.exec(readFileSync(join(here, '../migrations/20261114000000_init.sql'), 'utf8'))
await db.exec(readFileSync(join(here, '../seed.sql'), 'utf8'))
ok(true, 'migration et données initiales appliquées')

const HALE = '11111111-1111-1111-1111-111111111111'
const REYES = '22222222-2222-2222-2222-222222222222'
const INTRUS = '33333333-3333-3333-3333-333333333333'
await db.exec(`
  insert into auth.users (id, raw_user_meta_data) values
    ('${HALE}', '{"display_name":"Hale"}'), ('${REYES}', '{"display_name":"Reyes"}'), ('${INTRUS}', '{"display_name":"Intrus"}');
`)
const profiles = await db.query('select display_name from public.profiles order by display_name')
ok(profiles.rows.length === 3, 'profils créés automatiquement à l\'inscription')

// Exécute une requête en tant que joueur authentifié, soumis à la RLS.
const as = async (uid, sql, params = []) => {
  await db.exec(`select set_config('test.uid', '${uid}', false); set role authenticated;`)
  try {
    return await db.query(sql, params)
  } finally {
    await db.exec('reset role;')
  }
}

// AC-01 créer une salle
const created = (await as(HALE, `select * from public.create_session('the_last_letter')`)).rows[0]
ok(/^[A-HJ-NP-Z2-9]{6}$/.test(created.invite_code), `AC-01 code d'invitation généré (${created.invite_code})`)
const stored = await db.query('select code_hash from public.game_sessions')
ok(stored.rows[0].code_hash !== created.invite_code && stored.rows[0].code_hash.length === 64, 'AC-01 le code est stocké sous forme d\'empreinte, jamais en clair')

// AC-02 / AC-03 rejoindre, refuser le troisième
const sid = created.session_id
await rejects(() => as(REYES, `select public.join_session('ZZZZZZ')`), /invalide/, 'mauvais code refusé')
const joined = (await as(REYES, `select public.join_session($1) as id`, [created.invite_code.toLowerCase()])).rows[0].id
ok(joined === sid, 'AC-02 le second joueur rejoint avec le bon code (casse indifférente)')
await rejects(() => as(INTRUS, `select public.join_session($1)`, [created.invite_code]), /complète/, 'AC-03 troisième joueur refusé')
const rejoin = (await as(REYES, `select public.join_session($1) as id`, [created.invite_code])).rows[0].id
ok(rejoin === sid, 'AC-10 reconnexion d\'un joueur déjà membre')

// RLS : l'intrus ne voit rien
const intrusSees = await as(INTRUS, 'select * from public.game_sessions')
ok(intrusSees.rows.length === 0, 'RLS : un non-membre ne voit pas la session')

// Prêts → démarrage
let st = (await as(HALE, `select public.set_ready($1, true) as s`, [sid])).rows[0].s
ok(st === 'waiting', 'un seul joueur prêt : la salle attend')
await rejects(() => as(HALE, `select public.collect_evidence($1, 'e03_glass_handkerchief')`, [sid]), /non démarrée/, 'pas de collecte avant le démarrage')
st = (await as(REYES, `select public.set_ready($1, true) as s`, [sid])).rows[0].s
ok(st === 'in_progress', 'deux joueurs prêts : l\'enquête démarre')
const codeAfter = await db.query('select code_hash from public.game_sessions where id = $1', [sid])
ok(codeAfter.rows[0].code_hash === null, 'le code est invalidé au démarrage')

// AC-05 collecte sans doublon, numérotation commune
const n1 = (await as(HALE, `select public.collect_evidence($1, 'e03_glass_handkerchief') as n`, [sid])).rows[0].n
const n1b = (await as(REYES, `select public.collect_evidence($1, 'e03_glass_handkerchief') as n`, [sid])).rows[0].n
const n2 = (await as(REYES, `select public.collect_evidence($1, 'd_chess') as n`, [sid])).rows[0].n
ok(n1 === 1 && n1b === 1 && n2 === 2, 'AC-05 même pièce collectée deux fois → un seul numéro ; numérotation sans trou')
const seenByHale = await as(HALE, 'select examinable_id from public.session_evidence order by number')
ok(seenByHale.rows.length === 2, 'AC-04 les deux joueurs voient le même dossier')

// AC-06 interrogatoires partagés, sans doublon
await as(HALE, `select public.record_interrogation($1, 'Q-L2')`, [sid])
await as(REYES, `select public.record_interrogation($1, 'Q-L2')`, [sid])
const q = await as(REYES, 'select node_id from public.session_interrogations')
ok(q.rows.length === 1, 'AC-06 question enregistrée une fois, visible par le partenaire')

// AC-07 notes privées
await as(HALE, `insert into public.session_notes (session_id, author_id, visibility, body) values ($1, $2, 'private', 'Je soupçonne l''intendante')`, [sid, HALE])
await as(HALE, `insert into public.session_notes (session_id, author_id, visibility, body) values ($1, $2, 'shared', 'La montre s''est arrêtée trop tôt ?')`, [sid, HALE])
const reyesNotes = await as(REYES, 'select body from public.session_notes')
ok(reyesNotes.rows.length === 1 && reyesNotes.rows[0].body.includes('montre'), 'AC-07 le partenaire voit la note commune, pas la note privée')
await rejects(() => as(REYES, `insert into public.session_notes (session_id, author_id, visibility, body) values ($1, $2, 'shared', 'usurpation')`, [sid, HALE]), /row-level security|violates/, 'impossible d\'écrire une note au nom de l\'autre')

// AC-08 tableau partagé
await as(HALE, `insert into public.session_board_cards (session_id, ref, x, y, placed_by) values ($1, 'e03_glass_handkerchief', 120, 80, $2)`, [sid, HALE])
await as(REYES, `insert into public.session_links (session_id, from_ref, to_ref, label, author_id) values ($1, 'e03_glass_handkerchief', 'd_chess', 'rien à voir ?', $2)`, [sid, REYES])
const board = await as(HALE, 'select (select count(*) from public.session_board_cards) as cards, (select count(*) from public.session_links) as links')
ok(Number(board.rows[0].cards) === 1 && Number(board.rows[0].links) === 1, 'AC-08 cartes et liens visibles par les deux')

// AC-11 la solution est inaccessible
await rejects(() => as(HALE, 'select * from private.case_secret_solutions'), /permission denied/, 'AC-11 lecture directe de la solution refusée')
await rejects(() => as(HALE, `select private.score_verdict('{}', '{}', 0)`), /permission denied/, 'AC-11 appel direct du barème refusé')
await rejects(() => as(HALE, `update public.session_verdicts set result = '{"score":100}'`), /permission denied/, 'impossible de forger un résultat')
await rejects(() => as(HALE, `update public.session_evidence set number = 99, collected_by = $1`, [REYES]), /permission denied/, 'impossible de renuméroter une pièce ou d\'en changer l\'auteur')
await as(REYES, `update public.session_evidence set assessment = 'disputed' where examinable_id = 'd_chess'`)
const assessed = await as(HALE, `select assessment from public.session_evidence where examinable_id = 'd_chess'`)
ok(assessed.rows[0].assessment === 'disputed', 'évaluation d\'une pièce modifiable et partagée')
await rejects(() => as(HALE, `update public.game_sessions set status = 'completed'`), /permission denied/, 'impossible de forcer le statut d\'une session')
await rejects(() => as(INTRUS, `insert into public.session_players (session_id, user_id, seat) values ($1, $2, 2)`, [sid, INTRUS]), /permission denied/, 'impossible de s\'ajouter soi-même à une salle')
const reveal = await as(HALE, `select result from public.session_verdicts`)
ok(reveal.rows.length === 0, 'AC-13 aucune révélation avant le verdict')

// AC-12 / AC-13 verdict à deux signatures
const payload = {
  culprit: 'clara_moss', method: 'poison', timeOfDeath: '22h30_23h00',
  motives: ['revenge_past', 'protect_someone'], secondaryRole: 'non_fatal_fall',
  proofs: ['e10_report', 'e09_flask', 't_l1', 'e07_ashes', 'e06_photo', 'd_chess'],
}
await as(HALE, `select public.save_verdict_draft($1, $2)`, [sid, JSON.stringify(payload)])
const first = (await as(HALE, `select public.sign_verdict($1) as r`, [sid])).rows[0].r
ok(first.status === 'awaiting_partner', 'AC-12 une seule signature : le rapport attend le partenaire')
await as(REYES, `select public.save_verdict_draft($1, $2)`, [sid, JSON.stringify(payload)])
const afterEdit = (await as(HALE, 'select signed_by from public.session_verdicts')).rows[0].signed_by
ok(afterEdit.length === 0, 'modifier le rapport efface les signatures')
await as(HALE, `select public.sign_verdict($1)`, [sid])
const final = (await as(REYES, `select public.sign_verdict($1) as r`, [sid])).rows[0].r
ok(final.status === 'validated', 'AC-13 deux signatures : validation par le serveur')
ok(final.score === 94 && final.outcome === 'solved', `barème : ${final.score}/100 attendu 94 (35+15+10+14+10+10), issue « ${final.outcome} »`)
ok(Boolean(final.revelation?.twist?.fr), 'la révélation (récit + retournement) n\'arrive qu\'après validation')
await rejects(() => as(HALE, `select public.save_verdict_draft($1, '{}')`, [sid]), /déjà transmis/, 'rapport non modifiable après transmission')

// Issue alternative : Isabel accusée
const s2 = (await as(HALE, `select * from public.create_session('the_last_letter')`)).rows[0]
await as(REYES, `select public.join_session($1)`, [s2.invite_code])
await as(HALE, `select public.set_ready($1, true)`, [s2.session_id])
await as(REYES, `select public.set_ready($1, true)`, [s2.session_id])
await as(HALE, `select public.save_verdict_draft($1, $2)`, [s2.session_id, JSON.stringify({ culprit: 'isabel_whitmore', method: 'blow', motives: ['inheritance'] })])
await as(HALE, `select public.sign_verdict($1)`, [s2.session_id])
const wrong = (await as(REYES, `select public.sign_verdict($1) as r`, [s2.session_id])).rows[0].r
ok(wrong.outcome === 'wrong_isabel' && /Isabel/.test(wrong.revelation.headline.opening.fr), `mauvais coupable (Isabel) → issue « ${wrong.outcome} » avec son texte`)

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests passent.')
process.exit(failures ? 1 : 0)
