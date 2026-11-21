import type { LocalizedText } from '@/data/schemas/common'
import type { ViewId } from '@/stores/investigationStore'

/**
 * Vertical slice — bureau de Whitmore (version D retenue).
 *
 * Tout objet examinable suit le même traitement à l'écran : rien ne distingue une pièce
 * de l'affaire d'un objet du décor. Le champ `kind` est interne (conception, tests) et
 * n'est jamais affiché ; en production, il restera côté serveur.
 * Contenu PUBLIC uniquement : aucune conclusion, aucune solution.
 * Règle : le jeu n'affiche que des FAITS. Les liens, contradictions et interprétations
 * sont posés par les joueurs eux-mêmes (dossier, tableau d'enquête).
 */
export type ExaminableModel =
  | { type: 'evidence'; key: 'glass_handkerchief' | 'ashes' | 'button' | 'ledger' | 'carafe' }
  | { type: 'prop'; id: string; size: number; fit?: 'height' | 'max'; rotation?: number; tilt?: number }

export interface Examinable {
  id: string
  kind: 'case' | 'decor'
  title: LocalizedText
  where: LocalizedText
  description: LocalizedText
  observation: LocalizedText
  view: ViewId
  position: [number, number, number]
  model: ExaminableModel
  /** Rayon de la zone cliquable (m). */
  hit: number
  /** Gros plan ; calculé automatiquement depuis le point de vue s'il est absent. */
  closeUp?: { position: [number, number, number]; target: [number, number, number] }
}

const fr = (s: string): LocalizedText => ({ fr: s })

export const examinables: Examinable[] = [
  // — Bureau —
  {
    id: 'e03_glass_handkerchief',
    kind: 'case',
    title: fr("Verre d'eau rosée et mouchoir"),
    where: fr('Bureau, près de la carafe'),
    description: fr("Un verre à moitié plein d'une eau légèrement teintée de rose. À côté, un mouchoir de lin froissé, marqué de taches brunes et du monogramme A. W."),
    observation: fr("Les taches sont brunes et sèches sur les bords, plus claires au centre. Le verre est à côté de la carafe."),
    view: 'bureau',
    position: [0.42, 0.736, -1.62],
    model: { type: 'evidence', key: 'glass_handkerchief' },
    hit: 0.16,
    closeUp: { position: [0.82, 1.1, -1.18], target: [0.4, 0.8, -1.62] },
  },
  {
    id: 'e05_ledger',
    kind: 'case',
    title: fr('Registre relié de cuir'),
    where: fr('Bureau, ouvert devant le fauteuil'),
    description: fr("Un épais registre de comptabilité, la reliure fatiguée. Sur la page de garde : « Filature Whitmore — Bradford — Personnel, 1878 ». Un ruban marque une page."),
    observation: fr("La page marquée liste les ouvriers de l'atelier de rattachage. Trois noms sont soulignés au crayon : Brennan, Patrick, fileur — Brennan, Ada, 7 ans — Brennan, Clara, 9 ans. Le dernier est souligné deux fois, avec un point d'interrogation dans la marge."),
    view: 'bureau',
    position: [-0.08, 0.737, -1.68],
    model: { type: 'evidence', key: 'ledger' },
    hit: 0.2,
    closeUp: { position: [-0.02, 1.25, -1.28], target: [-0.08, 0.78, -1.7] },
  },
  {
    id: 'd_spectacles',
    kind: 'decor',
    title: fr('Lunettes à monture d’acier'),
    where: fr('Bureau, sur le sous-main'),
    description: fr('Une paire de lunettes de lecture, les branches repliées, posée verres vers le haut.'),
    observation: fr("Branches repliées, verres vers le haut, à côté de l'encrier."),
    view: 'bureau',
    position: [0.22, 0.736, -1.9],
    model: { type: 'prop', id: 'round_spectacles', size: 0.13, fit: 'max', rotation: 0.4 },
    hit: 0.08,
  },
  {
    id: 'd_magnifier',
    kind: 'decor',
    title: fr('Loupe à manche d’ébène'),
    where: fr('Bureau, à côté du registre'),
    description: fr('Une loupe de lecture, lentille épaisse cerclée de laiton.'),
    observation: fr("Posée lentille vers le haut, à une main du registre ouvert."),
    view: 'bureau',
    position: [0.12, 0.736, -1.42],
    model: { type: 'prop', id: 'magnifying_glass_01', size: 0.22, fit: 'max', rotation: 0.8, tilt: -Math.PI / 2 },
    hit: 0.1,
  },
  {
    id: 'd_candlestick',
    kind: 'decor',
    title: fr('Bougeoir de bois tourné'),
    where: fr('Bureau, coin gauche'),
    description: fr('Un bougeoir de noyer, une bougie à demi consumée.'),
    observation: fr("La cire est dure. Une fine poussière couvre la mèche."),
    view: 'bureau',
    position: [-0.74, 0.736, -1.5],
    model: { type: 'prop', id: 'wooden_candlestick', size: 0.26 },
    hit: 0.09,
  },
  {
    id: 'd_carafe',
    kind: 'decor',
    title: fr('Carafe d’eau'),
    where: fr('Bureau, coin droit'),
    description: fr('Une carafe de cristal taillé, à moitié pleine.'),
    observation: fr("L'eau est claire. Le niveau arrive à mi-hauteur."),
    view: 'bureau',
    position: [0.62, 0.736, -1.86],
    model: { type: 'evidence', key: 'carafe' },
    hit: 0.1,
  },
  // — Cheminée —
  {
    id: 'e07_ashes',
    kind: 'case',
    title: fr('Cendres dans le foyer'),
    where: fr('Foyer de la cheminée'),
    description: fr('Sur le feu couvert, une couche de cendres plus claires, encore tièdes. On distingue un fragment de papier épargné par les flammes et un lambeau de dentelle blanche roussi.'),
    observation: fr("Le fragment porte quelques lettres à l'encre : « …nnan, Ada, 7 a… ». La cendre du dessus est encore tiède ; celle du dessous est froide."),
    view: 'cheminee',
    position: [-3.22, 0.045, -0.4],
    model: { type: 'evidence', key: 'ashes' },
    hit: 0.22,
    closeUp: { position: [-2.45, 0.7, -0.28], target: [-3.2, 0.1, -0.4] },
  },
  {
    id: 'd_mantel_clock',
    kind: 'decor',
    title: fr('Pendule de cheminée'),
    where: fr('Manteau de la cheminée'),
    description: fr('Une pendule en placage d’acajou, cadran émaillé.'),
    observation: fr("Elle marche. Elle indique 23 h 41."),
    view: 'cheminee',
    position: [-3.02, 1.239, -0.4],
    model: { type: 'prop', id: 'mantel_clock_01', size: 0.32, rotation: Math.PI / 2 },
    hit: 0.18,
  },
  {
    id: 'd_elephant',
    kind: 'decor',
    title: fr('Éléphant de bois sculpté'),
    where: fr('Manteau de la cheminée'),
    description: fr('Un éléphant de teck, la trompe levée. Une étiquette jaunie sous le socle.'),
    observation: fr("Étiquette sous le socle : « Souvenir de Calcutta, 1889 ». Autour du socle, la poussière dessine un cercle net."),
    view: 'cheminee',
    position: [-3.02, 1.239, 0.22],
    model: { type: 'prop', id: 'carved_wooden_elephant', size: 0.18, rotation: Math.PI / 2 + 0.3 },
    hit: 0.1,
  },
  {
    id: 'd_cigarette_case',
    kind: 'decor',
    title: fr('Étui à cigarettes en argent'),
    where: fr('Manteau de la cheminée'),
    description: fr('Un étui plat en argent guilloché, gravé au revers : « A. W. — Bradford, 1895 ».'),
    observation: fr("Il contient quatre cigarettes. Le cendrier du bureau est vide et propre."),
    view: 'cheminee',
    position: [-2.99, 1.239, -0.8],
    model: { type: 'prop', id: 'cigarette_case', size: 0.11, fit: 'max', rotation: 1.2 },
    hit: 0.07,
  },
  // — Coin du fauteuil —
  {
    id: 'd_chess',
    kind: 'decor',
    title: fr('Échiquier de marqueterie'),
    where: fr('Guéridon, près du fauteuil'),
    description: fr('Un échiquier d’ébène et d’érable, les pièces rangées en position de départ.'),
    observation: fr("Une carte glissée sous le plateau note les coups d'une partie par correspondance. Dernier coup reçu : le 12 novembre."),
    view: 'fauteuil',
    position: [-2.75, 0.62, 1.75],
    model: { type: 'prop', id: 'chess_set', size: 0.4, fit: 'max', rotation: 0.3 },
    hit: 0.22,
  },
  // — Bibliothèque —
  {
    id: 'd_bust',
    kind: 'decor',
    title: fr('Buste de marbre'),
    where: fr('Sur la vitrine'),
    description: fr('Le buste d’un orateur romain, marbre blanc veiné de gris.'),
    observation: fr("Lourd. Ni éclat ni trace sur le marbre. La poussière sur le dessus de la vitrine n'est pas marquée."),
    view: 'bibliotheque',
    position: [3.22, 1.9, -1.0],
    model: { type: 'prop', id: 'marble_bust_01', size: 0.42, rotation: -Math.PI / 2 },
    hit: 0.2,
  },
  {
    id: 'd_horse',
    kind: 'decor',
    title: fr('Cheval cabré en porcelaine'),
    where: fr('Haut de la bibliothèque'),
    description: fr('Une statuette de biscuit blanc, un cheval cabré sur un socle doré.'),
    observation: fr("Une fêlure ancienne au jarret, recollée."),
    view: 'bibliotheque',
    position: [3.22, 2.7, 0.6],
    model: { type: 'prop', id: 'horse_statue_01', size: 0.32, rotation: -Math.PI / 2 },
    hit: 0.16,
  },
  {
    id: 'd_vase',
    kind: 'decor',
    title: fr('Vase de porcelaine bleue'),
    where: fr('Au sol, près de l’horloge'),
    description: fr('Un grand vase blanc et bleu, décor de feuillages.'),
    observation: fr("Vide. L'intérieur est sec."),
    view: 'bibliotheque',
    position: [2.25, 0, -2.6],
    model: { type: 'prop', id: 'antique_ceramic_vase_01', size: 0.55 },
    hit: 0.22,
  },
  // — Sous le bureau —
  {
    id: 'e08_button',
    kind: 'case',
    title: fr('Bouton de nacre'),
    where: fr('Tapis, sous le bureau'),
    description: fr("Un petit bouton de nacre à quatre trous, sous le plateau du bureau."),
    observation: fr("Un bout de fil de soie ivoire est encore noué au dos, rompu net."),
    view: 'tapis',
    position: [-0.08, 0.022, -1.62],
    model: { type: 'evidence', key: 'button' },
    hit: 0.07,
    closeUp: { position: [0.0, 0.16, -1.36], target: [-0.08, 0.0, -1.62] },
  },
]

export const examinableById = Object.fromEntries(examinables.map((e) => [e.id, e])) as Record<string, Examinable>
