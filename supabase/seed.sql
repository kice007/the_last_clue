-- THE LAST CLUE — données initiales
-- ⚠️ Contient la solution de THE LAST LETTER (schéma `private`, jamais exposé au navigateur).

insert into public.cases (id, title, category, difficulty, duration_min, duration_max, summary, published, sort_order)
values (
  'the_last_letter', 'THE LAST LETTER', 'fictional', 'hard', 60, 75,
  '{"fr": "Alexander Whitmore est retrouvé mort dans son bureau, porte fermée à clé. Sa fille avoue l''avoir tué. Trois témoins l''ont vu vivant après."}',
  true, 1
)
on conflict (id) do update set
  title = excluded.title, difficulty = excluded.difficulty, duration_min = excluded.duration_min,
  duration_max = excluded.duration_max, summary = excluded.summary, published = excluded.published;

-- Solution canonique (bible D §9–10). Identifiants alignés sur les données de jeu.
insert into private.case_secret_solutions (case_id, solution)
values ('the_last_letter', $json$
{
  "culprit": "clara_moss",
  "method": "poison",
  "timeOfDeath": "22h30_23h00",
  "motives": ["revenge_past", "protect_someone"],
  "secondaryRole": "non_fatal_fall",
  "decisiveProofs": ["e10_report", "e09_flask", "e06_photo", "e07_ashes", "e05_ledger", "t_l1", "t_l2", "t_i2"],
  "weights": {
    "culprit": 35, "method": 15, "timeOfDeath": 10, "perMotive": 7,
    "secondaryRole": 10, "perProof": 2, "proofsCap": 16, "hintPenalty": 3
  },
  "wrongOutcomes": {
    "isabel_whitmore": "wrong_isabel",
    "nobody": "wrong_accident",
    "constance_whitmore": "wrong_motive_only",
    "victor_lang": "wrong_motive_only"
  },
  "revelation": {
    "solved": {
      "title": { "fr": "Affaire résolue." },
      "opening": { "fr": "Votre rapport tient. Voici ce qui s'est passé cette nuit-là." }
    },
    "fragile": {
      "title": { "fr": "Le bon nom, une démonstration fragile." },
      "opening": { "fr": "Vous avez désigné la bonne personne. Mais un tribunal aurait demandé davantage." }
    },
    "wrong_isabel": {
      "title": { "fr": "Vous avez condamné une jeune femme pour un crime qu'elle n'a pas commis." },
      "opening": { "fr": "Isabel a poussé son père. Elle ne l'a pas tué. La montre, Lucy Vance et le rapport du Dr Graves le disaient." }
    },
    "wrong_accident": {
      "title": { "fr": "Le meurtrier vous remercie." },
      "opening": { "fr": "Ce n'était pas un accident. Le poison était déjà dans les gouttes de 21 h 30." }
    },
    "wrong_motive_only": {
      "title": { "fr": "Un mobile n'est pas une preuve." },
      "opening": { "fr": "Avoir une raison d'en vouloir à Alexander Whitmore ne suffisait pas. Une autre personne avait l'accès, et l'a utilisé." }
    },
    "story": {
      "fr": "Deux lettres, deux gestes. À 19 heures, Alexander Whitmore ordonna qu'on prépare la malle de sa fille pour Thornfield. Dans son tiroir dormait sa confession au Times : en 1878, il avait fait verrouiller les portes d'un atelier de Bradford où quatorze personnes avaient brûlé. Pendant le dîner, l'intendante lut sur le sous-main la liste des familles : Brennan, Ada, 7 ans. Clara Moss s'appelait Clara Brennan. À 21 h 30, elle vida presque tout un flacon de digitaline dans les gouttes de Monsieur. À 21 h 47, Isabel le poussa ; il tomba, se releva, nettoya sa plaie, demanda l'heure à Lucy Vance, s'enferma à clé, et mourut seul vers 22 h 45. À 23 h 06, avec son passe, Clara brûla la liste qui portait son nom et la dentelle qui aurait accusé Isabel."
    },
    "twist": {
      "fr": "Ce que Clara ne savait pas : dans la confession cachetée, Whitmore avait ajouté une ligne. « Une de ces familles vit plus près de moi que je ne l'ai mérité. Je lui demanderai pardon de vive voix, demain. » Dans le registre, il avait souligné deux fois le nom de Clara Brennan, 9 ans. Il savait. Quand les inspecteurs lui ont lu ce post-scriptum, Clara Moss a tout avoué. « Ada avait peur du noir. Lui aussi, peut-être, à la fin. »"
    }
  }
}
$json$::jsonb)
on conflict (case_id) do update set solution = excluded.solution;
