-- THE LAST CLUE — schéma initial (étape 2 : multijoueur)
-- Principes (cahier des charges §7–9) :
--   * PostgreSQL est la source de vérité ; Realtime ne fait que notifier.
--   * RLS sur toutes les tables exposées ; un joueur ne voit que ses sessions.
--   * Deux joueurs maximum par session, contrôlé dans une transaction.
--   * Les solutions vivent dans le schéma `private`, jamais exposé à l'API.
--   * Les actions sensibles passent par des fonctions SECURITY DEFINER.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Profils
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  created_at timestamptz not null default now()
);

-- Profil créé automatiquement à l'inscription (nom de service passé dans les métadonnées).
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'Inspecteur'));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogue des affaires (métadonnées publiques)
-- ---------------------------------------------------------------------------
create table public.cases (
  id text primary key check (id ~ '^[a-z0-9_]+$'),
  title text not null,
  category text not null check (category in ('fictional', 'historical')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  duration_min int not null,
  duration_max int not null,
  summary jsonb not null,           -- LocalizedText
  published boolean not null default false,
  sort_order int not null default 0
);

-- Solutions : serveur uniquement.
create table private.case_secret_solutions (
  case_id text primary key references public.cases (id) on delete cascade,
  solution jsonb not null          -- coupable, méthode, heure, mobiles, rôles, preuves décisives, barème, révélations
);

-- ---------------------------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------------------------
create type public.session_status as enum ('waiting', 'ready', 'in_progress', 'completed', 'abandoned');

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  case_id text not null references public.cases (id),
  created_by uuid not null references public.profiles (id),
  status public.session_status not null default 'waiting',
  code_hash text unique,           -- empreinte du code d'invitation, jamais le code en clair
  code_expires_at timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table public.session_players (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  seat smallint not null check (seat in (1, 2)),
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id),
  unique (session_id, seat)
);

create table private.join_attempts (
  user_id uuid not null,
  attempted_at timestamptz not null default now()
);
create index on private.join_attempts (user_id, attempted_at);

-- Appartenance (utilisée par toutes les politiques RLS).
create function public.is_session_member(p_session uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.session_players sp
    where sp.session_id = p_session and sp.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Progression partagée
-- ---------------------------------------------------------------------------
create table public.session_evidence (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  examinable_id text not null,
  number int not null,              -- « Pièce n° » : ordre de mise au dossier
  collected_by uuid not null references public.profiles (id),
  collected_at timestamptz not null default now(),
  assessment text not null default 'to_verify'
    check (assessment in ('to_verify', 'disputed', 'corroborated', 'refuted')),
  primary key (session_id, examinable_id),
  unique (session_id, number)
);

create table public.session_interrogations (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  node_id text not null,            -- Q-xx / X-xx / EV-xx (bible §5)
  triggered_by uuid not null references public.profiles (id),
  triggered_at timestamptz not null default now(),
  primary key (session_id, node_id)
);

create table public.session_unlocks (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  unlock_id text not null,          -- ex. « armoire_pharmacie », « tiroir_bureau », « E10 »
  unlocked_by uuid not null references public.profiles (id),
  unlocked_at timestamptz not null default now(),
  primary key (session_id, unlock_id)
);

create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  visibility text not null check (visibility in ('shared', 'private')),
  target_ref text,                  -- pièce, personnage, réplique… (facultatif)
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_board_cards (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  ref text not null,                -- pièce, témoignage, personne, hypothèse
  x real not null,
  y real not null,
  placed_by uuid not null references public.profiles (id),
  updated_at timestamptz not null default now(),
  primary key (session_id, ref)
);

create table public.session_links (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  from_ref text not null,
  to_ref text not null,
  label text check (char_length(label) <= 120),
  author_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  check (from_ref <> to_ref)
);

create table public.session_timeline (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  ref text not null,
  minute_of_day int not null check (minute_of_day between 0 and 1439),
  placed_by uuid not null references public.profiles (id),
  primary key (session_id, ref)
);

create table public.session_verdicts (
  session_id uuid primary key references public.game_sessions (id) on delete cascade,
  payload jsonb not null,           -- coupable, méthode, heure, mobiles, rôle d'Isabel, preuves, explication
  signed_by uuid[] not null default '{}',
  hints_used int not null default 0,
  submitted_at timestamptz,
  result jsonb                      -- rempli par le serveur après validation
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.game_sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.session_evidence enable row level security;
alter table public.session_interrogations enable row level security;
alter table public.session_unlocks enable row level security;
alter table public.session_notes enable row level security;
alter table public.session_board_cards enable row level security;
alter table public.session_links enable row level security;
alter table public.session_timeline enable row level security;
alter table public.session_verdicts enable row level security;

-- Profils : chacun lit le sien et ceux de ses partenaires de session ; modifie le sien.
create policy "profil lisible" on public.profiles for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.session_players a
    join public.session_players b on a.session_id = b.session_id
    where a.user_id = auth.uid() and b.user_id = profiles.id
  )
);
create policy "profil modifiable" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Catalogue : affaires publiées, lecture seule.
create policy "catalogue" on public.cases for select to authenticated using (published);

-- Sessions et joueurs : lecture par les membres. Écritures uniquement via les fonctions.
create policy "session lisible" on public.game_sessions for select to authenticated
  using (public.is_session_member(id));
create policy "joueurs lisibles" on public.session_players for select to authenticated
  using (public.is_session_member(session_id));

-- Progression : lecture par les membres ; écritures via les fonctions (numérotation, déblocages).
create policy "preuves lisibles" on public.session_evidence for select to authenticated
  using (public.is_session_member(session_id));
create policy "évaluation modifiable" on public.session_evidence for update to authenticated
  using (public.is_session_member(session_id)) with check (public.is_session_member(session_id));
create policy "interrogatoires lisibles" on public.session_interrogations for select to authenticated
  using (public.is_session_member(session_id));
create policy "déblocages lisibles" on public.session_unlocks for select to authenticated
  using (public.is_session_member(session_id));

-- Notes : communes visibles par les deux, privées par leur auteur seulement (AC-07).
create policy "notes lisibles" on public.session_notes for select to authenticated using (
  public.is_session_member(session_id) and (visibility = 'shared' or author_id = auth.uid())
);
create policy "notes créées" on public.session_notes for insert to authenticated
  with check (public.is_session_member(session_id) and author_id = auth.uid());
create policy "notes modifiées" on public.session_notes for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "notes supprimées" on public.session_notes for delete to authenticated
  using (author_id = auth.uid());

-- Tableau et chronologie : édition commune par les membres.
create policy "cartes" on public.session_board_cards for all to authenticated
  using (public.is_session_member(session_id))
  with check (public.is_session_member(session_id) and placed_by = auth.uid());
create policy "liens lisibles" on public.session_links for select to authenticated
  using (public.is_session_member(session_id));
create policy "liens créés" on public.session_links for insert to authenticated
  with check (public.is_session_member(session_id) and author_id = auth.uid());
create policy "liens supprimés" on public.session_links for delete to authenticated
  using (public.is_session_member(session_id));
create policy "chronologie" on public.session_timeline for all to authenticated
  using (public.is_session_member(session_id))
  with check (public.is_session_member(session_id) and placed_by = auth.uid());

-- Verdict : lecture par les membres ; rédaction et signatures via les fonctions.
create policy "verdict lisible" on public.session_verdicts for select to authenticated
  using (public.is_session_member(session_id));

-- ---------------------------------------------------------------------------
-- Fonctions serveur
-- ---------------------------------------------------------------------------

-- Code d'invitation : 6 signes, alphabet sans caractères ambigus, source cryptographique.
create function private.new_invite_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(6);
  code text := '';
begin
  for i in 0..5 loop
    code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return code;
end $$;

create function private.hash_code(p_code text) returns text
language sql immutable set search_path = '' as $$
  select encode(extensions.digest(upper(trim(p_code)), 'sha256'), 'hex');
$$;

-- Créer une salle (AC-01). Renvoie l'identifiant et le code en clair, une seule fois.
create function public.create_session(p_case text)
returns table (session_id uuid, invite_code text)
language plpgsql security definer set search_path = '' as $$
declare
  v_code text;
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  if not exists (select 1 from public.cases c where c.id = p_case and c.published) then
    raise exception 'affaire inconnue';
  end if;
  loop
    v_code := private.new_invite_code();
    exit when not exists (select 1 from public.game_sessions g where g.code_hash = private.hash_code(v_code));
  end loop;
  insert into public.game_sessions (case_id, created_by, code_hash, code_expires_at)
  values (p_case, auth.uid(), private.hash_code(v_code), now() + interval '30 minutes')
  returning id into v_id;
  insert into public.session_players (session_id, user_id, seat) values (v_id, auth.uid(), 1);
  return query select v_id, v_code;
end $$;

-- Rejoindre avec un code (AC-02, AC-03). Verrou sur la session : jamais plus de deux joueurs.
create function public.join_session(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_session public.game_sessions;
  v_count int;
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;

  -- limite : 10 tentatives par tranche de 10 minutes
  if (select count(*) from private.join_attempts a
      where a.user_id = auth.uid() and a.attempted_at > now() - interval '10 minutes') >= 10 then
    raise exception 'trop de tentatives, réessayez plus tard';
  end if;
  insert into private.join_attempts (user_id) values (auth.uid());

  select * into v_session from public.game_sessions g
  where g.code_hash = private.hash_code(p_code)
  for update;

  if v_session.id is null or v_session.code_expires_at < now() or v_session.status <> 'waiting' then
    raise exception 'code invalide ou expiré';
  end if;

  if exists (select 1 from public.session_players sp where sp.session_id = v_session.id and sp.user_id = auth.uid()) then
    return v_session.id;            -- déjà membre : reconnexion
  end if;

  select count(*) into v_count from public.session_players sp where sp.session_id = v_session.id;
  if v_count >= 2 then raise exception 'la salle est complète'; end if;

  insert into public.session_players (session_id, user_id, seat) values (v_session.id, auth.uid(), 2);
  return v_session.id;
end $$;

-- Statut « prêt » ; la partie démarre quand les deux joueurs sont prêts.
create function public.set_ready(p_session uuid, p_ready boolean) returns public.session_status
language plpgsql security definer set search_path = '' as $$
declare
  v_ready int;
  v_status public.session_status;
begin
  if not public.is_session_member(p_session) then raise exception 'accès refusé'; end if;
  perform 1 from public.game_sessions where id = p_session for update;
  update public.session_players set ready = p_ready
  where session_id = p_session and user_id = auth.uid();

  select count(*) filter (where ready) into v_ready from public.session_players where session_id = p_session;
  select status into v_status from public.game_sessions where id = p_session;

  if v_status in ('waiting', 'ready') then
    v_status := case when v_ready = 2 then 'in_progress'::public.session_status else 'waiting' end;
    update public.game_sessions
    set status = v_status,
        started_at = case when v_status = 'in_progress' then coalesce(started_at, now()) else started_at end,
        code_hash = case when v_status = 'in_progress' then null else code_hash end
    where id = p_session;
  end if;
  return v_status;
end $$;

-- Mettre une pièce au dossier (AC-05) : idempotent, numérotation sans trou ni doublon.
create function public.collect_evidence(p_session uuid, p_examinable text) returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_number int;
begin
  if not public.is_session_member(p_session) then raise exception 'accès refusé'; end if;
  perform 1 from public.game_sessions where id = p_session and status = 'in_progress' for update;
  if not found then raise exception 'enquête non démarrée'; end if;

  select number into v_number from public.session_evidence
  where session_id = p_session and examinable_id = p_examinable;
  if v_number is not null then return v_number; end if;

  select coalesce(max(number), 0) + 1 into v_number from public.session_evidence where session_id = p_session;
  insert into public.session_evidence (session_id, examinable_id, number, collected_by)
  values (p_session, p_examinable, v_number, auth.uid());
  return v_number;
end $$;

-- Enregistrer une question ou une confrontation (AC-06). La validation des conditions
-- de déblocage se fera ici quand les données de l'affaire seront en base (étape 4).
create function public.record_interrogation(p_session uuid, p_node text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_session_member(p_session) then raise exception 'accès refusé'; end if;
  insert into public.session_interrogations (session_id, node_id, triggered_by)
  values (p_session, p_node, auth.uid())
  on conflict do nothing;
end $$;

-- Rédiger le rapport : toute modification efface les signatures.
create function public.save_verdict_draft(p_session uuid, p_payload jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_session_member(p_session) then raise exception 'accès refusé'; end if;
  if exists (select 1 from public.session_verdicts where session_id = p_session and submitted_at is not null) then
    raise exception 'rapport déjà transmis';
  end if;
  insert into public.session_verdicts (session_id, payload, signed_by)
  values (p_session, p_payload, '{}')
  on conflict (session_id) do update set payload = excluded.payload, signed_by = '{}';
end $$;

-- Signer ; à la seconde signature, le serveur compare à la solution privée (AC-12, AC-13).
create function public.sign_verdict(p_session uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_verdict public.session_verdicts;
  v_case text;
  v_solution jsonb;
  v_result jsonb;
begin
  if not public.is_session_member(p_session) then raise exception 'accès refusé'; end if;

  select * into v_verdict from public.session_verdicts where session_id = p_session for update;
  if v_verdict.session_id is null then raise exception 'aucun rapport rédigé'; end if;
  if v_verdict.submitted_at is not null then return v_verdict.result; end if;

  if not (auth.uid() = any (v_verdict.signed_by)) then
    v_verdict.signed_by := v_verdict.signed_by || auth.uid();
    update public.session_verdicts set signed_by = v_verdict.signed_by where session_id = p_session;
  end if;

  if cardinality(v_verdict.signed_by) < 2 then
    return jsonb_build_object('status', 'awaiting_partner');
  end if;

  select case_id into v_case from public.game_sessions where id = p_session;
  select solution into v_solution from private.case_secret_solutions where case_id = v_case;
  v_result := private.score_verdict(v_verdict.payload, v_solution, v_verdict.hints_used);

  update public.session_verdicts set submitted_at = now(), result = v_result where session_id = p_session;
  update public.game_sessions set status = 'completed', completed_at = now() where id = p_session;
  return v_result;
end $$;

-- Barème générique, piloté par la solution (bible D §9). Le texte de révélation
-- n'est copié dans le résultat qu'à ce moment-là.
create function private.score_verdict(p_payload jsonb, p_solution jsonb, p_hints int) returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  w jsonb := p_solution -> 'weights';
  v_score int := 0;
  v_parts jsonb := '{}';
  v_proofs int := 0;
  v_motives int := 0;
  v_motive text;
  v_outcome text;
begin
  if p_payload ->> 'culprit' = p_solution ->> 'culprit' then
    v_score := v_score + (w ->> 'culprit')::int;
    v_parts := v_parts || jsonb_build_object('culprit', (w ->> 'culprit')::int);
  end if;
  if p_payload ->> 'method' = p_solution ->> 'method' then
    v_score := v_score + (w ->> 'method')::int;
    v_parts := v_parts || jsonb_build_object('method', (w ->> 'method')::int);
  end if;
  if p_payload ->> 'timeOfDeath' = p_solution ->> 'timeOfDeath' then
    v_score := v_score + (w ->> 'timeOfDeath')::int;
    v_parts := v_parts || jsonb_build_object('timeOfDeath', (w ->> 'timeOfDeath')::int);
  end if;
  for v_motive in select jsonb_array_elements_text(coalesce(p_payload -> 'motives', '[]')) loop
    if p_solution -> 'motives' ? v_motive then v_motives := v_motives + (w ->> 'perMotive')::int; end if;
  end loop;
  v_score := v_score + v_motives;
  v_parts := v_parts || jsonb_build_object('motives', v_motives);
  if p_payload ->> 'secondaryRole' = p_solution ->> 'secondaryRole' then
    v_score := v_score + (w ->> 'secondaryRole')::int;
    v_parts := v_parts || jsonb_build_object('secondaryRole', (w ->> 'secondaryRole')::int);
  end if;
  select count(*) * (w ->> 'perProof')::int into v_proofs
  from jsonb_array_elements_text(coalesce(p_payload -> 'proofs', '[]')) e(ref)
  where p_solution -> 'decisiveProofs' ? e.ref;
  v_proofs := least(v_proofs, (w ->> 'proofsCap')::int);
  v_score := v_score + v_proofs - p_hints * (w ->> 'hintPenalty')::int;
  v_parts := v_parts || jsonb_build_object('proofs', v_proofs, 'hints', -p_hints * (w ->> 'hintPenalty')::int);
  v_score := greatest(v_score, 0);

  v_outcome := case
    when p_payload ->> 'culprit' = p_solution ->> 'culprit' and v_score >= 80 then 'solved'
    when p_payload ->> 'culprit' = p_solution ->> 'culprit' then 'fragile'
    else coalesce(p_solution -> 'wrongOutcomes' ->> (p_payload ->> 'culprit'), 'wrong')
  end;

  return jsonb_build_object(
    'status', 'validated',
    'score', v_score,
    'parts', v_parts,
    'outcome', v_outcome,
    'revelation', jsonb_build_object(
      'headline', p_solution -> 'revelation' -> v_outcome,
      'story', p_solution -> 'revelation' -> 'story',
      'twist', p_solution -> 'revelation' -> 'twist'
    )
  );
end $$;

-- Droits sur les tables (défense en profondeur, en plus de la RLS) :
-- ce qui passe par les fonctions serveur n'est pas modifiable directement par le client.
revoke insert, update, delete on public.cases, public.game_sessions, public.session_players,
  public.session_evidence, public.session_interrogations, public.session_unlocks,
  public.session_verdicts, public.profiles
  from anon, authenticated;
-- Exceptions limitées à une colonne : l'évaluation d'une pièce, son propre nom de service.
grant update (assessment) on public.session_evidence to authenticated;
grant update (display_name) on public.profiles to authenticated;
revoke all on all tables in schema public from anon;
grant select on public.cases to anon;

-- Droits d'exécution : seules les fonctions prévues pour le client sont appelables.
revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function public.create_session(text), public.join_session(text), public.set_ready(uuid, boolean),
  public.collect_evidence(uuid, text), public.record_interrogation(uuid, text),
  public.save_verdict_draft(uuid, jsonb), public.sign_verdict(uuid), public.is_session_member(uuid)
  from public, anon;
grant execute on function public.create_session(text), public.join_session(text), public.set_ready(uuid, boolean),
  public.collect_evidence(uuid, text), public.record_interrogation(uuid, text),
  public.save_verdict_draft(uuid, jsonb), public.sign_verdict(uuid), public.is_session_member(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime : notification des changements persistés (jamais seule source de vérité)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table
  public.game_sessions, public.session_players, public.session_evidence,
  public.session_interrogations, public.session_unlocks, public.session_notes,
  public.session_board_cards, public.session_links, public.session_timeline,
  public.session_verdicts;
