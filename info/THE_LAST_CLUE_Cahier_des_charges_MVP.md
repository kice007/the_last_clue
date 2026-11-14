**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

# **THE LAST CLUE** 

### **CAHIER DES CHARGES • MVP** 

_Two detectives. One truth. Every clue matters._ 

|**TYPE DE PRODUIT**|Jeu d'enquête criminelle coopératif en ligne|
|---|---|
|**PLATEFORME**|Navigateur desktop — deux ordinateurs|
|**DIRECTION ARTISTIQUE**|Realistic Cinematic / thriller policier|
|**PÉRIMÈTRE**|MVP jouable avec affaires fictives et historiques|



##### **OBJECTIF DU DOCUMENT** 

Définir la vision, les fonctionnalités, les règles de gameplay, l'architecture technique, les données, la sécurité, les critères de validation et le plan de réalisation de THE LAST CLUE. 

Version 1.0  |  13 novembre 2026  |  Document de référence projet 

THE LAST CLUE  •  Cahier des charges MVP  •  1 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

## **Sommaire** 

- 1. Présentation et vision du produit 

- 2. Objectifs, public cible et périmètre MVP 

- 3. Expérience utilisateur et parcours de jeu 

- 4. Fonctionnalités détaillées 

- 5. Règles de gameplay et conception des enquêtes 

- 6. Direction artistique et expérience audiovisuelle 

- 7. Architecture technique 

- 8. Modèle de données et synchronisation 

- 9. Sécurité, confidentialité et fiabilité 

- 10. Structure du projet 

- 11. Planning de réalisation 

- 12. Tests et critères d'acceptation 

- 13. Risques, arbitrages et évolutions 

- Annexe A. Exemple de première affaire 

- Annexe B. Prompt initial pour Claude Code 

## **1. Présentation et vision du produit** 

THE LAST CLUE est un jeu d'investigation criminelle coopératif, accessible depuis un navigateur web. Deux joueurs incarnent des inspecteurs chargés de résoudre ensemble des affaires complexes. 

L'expérience combine exploration d'environnements 3D, consultation de dossiers, collecte de preuves, interrogatoires scénarisés, déduction collaborative et accusation finale. 

##### **PROMESSE DU JEU** 

Les joueurs ne répondent pas à un simple quiz : ils enquêtent, confrontent leurs interprétations, relient les indices et construisent une explication argumentée avant de découvrir la solution canonique. 

#### **1.1 Principes fondateurs** 

- Coopération réelle : deux navigateurs distincts partagent la même progression d'enquête. 

- Déduction avant révélation : le coupable et la solution ne sont pas exposés au client pendant l'enquête. 

- Enquêtes cohérentes : chaque affaire possède une chronologie, des mobiles, des alibis et une solution définis. 

- Immersion : la 3D sert l'exploration et l'atmosphère, sans rendre l'interface inutilement complexe. 

- Contenu extensible : les affaires sont décrites par des données séparées du moteur du jeu. 

- Véracité historique : les faits documentés, les décisions judiciaires, les controverses et les éléments de reconstitution sont distingués. 

#### **1.2 Catégories d'affaires** 

|**Catégorie**|**Description**|**Règle éditoriale**|
|---|---|---|
|Historical Cases|Affaires criminelles réelles documentées.|Ne pas présenter comme prouvés les<br>éléments contestés. Citer les sources et<br>expliquer les limites des archives.|
||f|Le coupable, le mobile, la méthode, la<br>i|
|Fictional Cases|Affaires originales conçues pour le jeu.|chronologie et les indices sont définis avant<br>publication.|



THE LAST CLUE  •  Cahier des charges MVP  •  2 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

Une affaire historique non résolue peut éventuellement apparaître dans un mode dédié, mais elle ne doit pas recevoir artificiellement un coupable officiel. Le jeu doit alors présenter plusieurs hypothèses et expliquer l'absence de conclusion définitive. 

## **2. Objectifs, public cible et périmètre MVP** 

#### **2.1 Objectifs** 

- Permettre à deux joueurs de créer ou rejoindre une session privée. 

- Faire vivre une enquête complète de 45 à 60 minutes environ. 

- Proposer un bureau d'enquête et au moins une scène de crime interactive en 3D. 

- Permettre la collecte, l'examen et la mise en relation de preuves. 

- Proposer des interrogatoires à choix avec réponses conditionnelles déterministes. 

- Permettre une accusation commune et une révélation expliquée. 

- Persister les actions essentielles pour éviter la perte de progression. 

#### **2.2 Public cible et plateforme** 

Le MVP vise prioritairement deux adultes jouant ensemble sur ordinateur, chacun dans son navigateur. La cible technique est un navigateur moderne compatible WebGL. Le mobile peut afficher certaines interfaces, mais l'expérience principale est desktop. 

#### **2.3 Périmètre fonctionnel** 

|**Priorité**|**Fonctionnalités**|
|---|---|
|P0 — indispensable|Landing page, authentification ou identité joueur,<br>création/rejoindre une salle, lobby, sélection/briefing d'affaire,<br>bureau 3D, scène 3D, collecte de preuves, dossiers suspects,<br>interrogatoires, tableau partagé, verdict, révélation, persistance et<br>reconnexion.|
||Historique des affaires, indices optionnels, difficulté, statistiques,|
|P1 — après première version|meilleure personnalisation des avatars, deuxième enquête,<br>amélioration des environnements.|
||Matchmaking public, grand nombre de joueurs, économie/achats,<br>f|
|P2 — hors MVP|éditeur d'affaires, génération IA libre des dialogues, monde ouvert,<br>application mobile native.|



##### **ARBITRAGE MVP** 

La priorité est une enquête complète et fiable. Un environnement 3D limité mais soigné vaut mieux qu'un grand décor inachevé. Le MVP doit être testable à deux sur deux ordinateurs. 

## **3. Expérience utilisateur et parcours de jeu** 

#### **3.1 Parcours global** 

1. Accueil : le joueur découvre l'identité du jeu et lance l'accès à l'enquête. 

2. Identification : connexion ou création d'un profil d'inspecteur. 

3. Lobby : création d'une salle privée ou saisie d'un code d'invitation. 

4. Synchronisation : le deuxième joueur rejoint; présence et statut prêt sont visibles. 

THE LAST CLUE  •  Cahier des charges MVP  •  3 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

5. Sélection : les joueurs choisissent une affaire disponible. 

6. Briefing : présentation du contexte, de la victime, du lieu et des premiers éléments. 

7. Investigation : exploration, collecte, analyse, interrogatoires et tableau de déduction. 

8. Délibération : les joueurs discutent et préparent le rapport final. 

9. Verdict : les deux joueurs approuvent et soumettent une accusation commune. 

10. Révélation : le jeu compare la conclusion à la solution canonique et explique les indices. 

#### **3.2 Liste des écrans** 

|**Écran**|**Contenu / rôle**|**Priorité**|
|---|---|---|
|Landing page|Univers visuel, slogan, accès au jeu,<br>contrôle audio.|P0|
|Authentification|Connexion, inscription, persistance de<br>session.|P0|
|Profil inspecteur|Nom affiché et avatar simple.|P0|
|Lobby|Créer/rejoindre salle, code, présence,<br>statut prêt.|P0|
|Sélection d'affaire|Titre, catégorie, difficulté, durée, résumé et<br>sources historiques.|P0|
|Briefing|Victime, contexte, lieu, date, circonstances<br>et objectifs.|P0|
|Bureau 3D|Hub central avec accès aux dossiers,<br>tableau et lieux.|P0|
|Scène de crime 3D|Exploration et objets interactifs.|P0|
|Inventaire des preuves|Liste, filtres, détails et statuts.|P0|
|Dossiers suspects|Identité, lien avec la victime, déclarations et<br>éléments associés.|P0|
|Interrogatoires|Questions, réponses, présentation de<br>preuves et contradictions.|P0|
|Tableau d'enquête|Cartes, liens, hypothèses, notes et<br>chronologie.|P0|
|Verdict final|Coupable, mobile, méthode, chronologie et<br>preuves justificatives.|P0|
|Révélation|Solution, comparaison, score et<br>explication.|P0|
|Historique|Enquêtes terminées et résultats.|P1|



## **4. Fonctionnalités détaillées** 

#### **4.1 Session coopérative en ligne** 

Un joueur crée une salle privée. Le serveur génère un code d'invitation non prévisible. Le deuxième joueur saisit ce code et rejoint la session. Une salle contient au maximum deux joueurs. 

- Statuts : waiting, ready, in_progress, completed, abandoned. 

- Chaque joueur possède un identifiant de profil et un statut de présence. 

- Le démarrage exige deux joueurs présents et prêts. 

- Les actions communes sont persistées côté serveur. 

- Le joueur qui recharge la page retrouve la session et sa progression. 

- Une déconnexion temporaire ne supprime ni la salle ni les preuves collectées. 

THE LAST CLUE  •  Cahier des charges MVP  •  4 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

#### **4.2 Bureau d'enquête 3D** 

Le bureau est le hub central. Pour le MVP, privilégier une scène fixe ou à déplacement limité, avec caméra contrôlée et objets interactifs. 

- Bureau, lampe, ordinateur, téléphone, armoire d'archives et tableau d'enquête. 

- Cliquer sur un objet ouvre un panneau ou une scène fonctionnelle. 

- L'ordinateur donne accès aux dossiers et aux rapports. 

- Le tableau ouvre l'espace de déduction. 

- Les archives donnent accès aux documents disponibles. 

#### **4.3 Scène de crime 3D** 

La scène de crime utilise une caméra contrôlable, un éclairage lisible et des points d'interaction repérables. Le joueur peut examiner un objet, ouvrir une vue rapprochée et décider de l'ajouter au dossier. 

|**Propriété**|**Description**|
|---|---|
|id|Identifiant unique de l'objet / preuve.|
|position|Coordonnées dans la scène 3D.|
|title|Nom lisible de l'élément.|
|description|Description accessible après inspection.|
|category|Physique, documentaire, numérique ou témoignage.|
|importance|Principale ou secondaire, sans forcément l'afficher au joueur.|
|discoveryState|Non découvert, découvert, collecté.|
|relatedEntities|Suspects, lieux ou événements associés.|



Les interactions utilisent les événements de pointeur/raycasting de React Three Fiber. Un objet découvert doit être ajouté une seule fois à la progression commune, même si les deux joueurs le sélectionnent presque simultanément. 

#### **4.4 Système de preuves** 

|**Catégorie**|**Exemples**|
|---|---|
|Physique|Objet, empreinte, trace, arme, vêtement.|
|Documentaire|Lettre, contrat, facture, article, note manuscrite.|
|Numérique|Message, appel, historique, fichier.|
|Témoignage|Déclaration, déposition, réponse d'interrogatoire.|



Chaque preuve possède un détail consultable : nom, description, origine, date ou heure si connue, statut d'analyse, liens possibles et éventuelles limites d'interprétation. 

Statuts proposés : collectée, à vérifier, contestée, corroborée, réfutée. Le statut représente l'évaluation des enquêteurs et ne doit pas être confondu avec une vérité automatique du scénario. 

#### **4.5 Suspects et témoins** 

Un personnage comprend une identité, une biographie, son lien avec la victime, son mobile potentiel, son alibi, sa déclaration initiale et les informations qu'il peut révéler. Les témoins sont modélisés séparément des suspects, même si le moteur d'interrogatoire est commun. 

THE LAST CLUE  •  Cahier des charges MVP  •  5 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

#### **4.6 Moteur d'interrogatoire** 

Le moteur est déterministe. Les questions, conditions, réponses et révélations sont préécrites dans les données de l'affaire. L'IA générative ne doit pas modifier la vérité de l'affaire. 

- Afficher une déclaration initiale. 

- Proposer les questions disponibles selon la progression. 

- Permettre de présenter une preuve à un personnage. 

- Déclencher une réponse conditionnelle si la preuve et les prérequis sont réunis. 

- Enregistrer les questions posées et les informations débloquées. 

- Synchroniser l'état d'interrogatoire entre les joueurs. 

#### **4.7 Tableau d'investigation** 

- Ajouter des cartes de preuve, suspect, témoin, lieu et événement. 

- Créer des liens entre deux cartes avec un libellé ou un type de relation. 

- Ajouter des hypothèses et des notes communes. 

- Conserver des notes privées propres à chaque joueur. 

- Afficher une chronologie d'événements. 

- Synchroniser les modifications en temps réel. 

Le tableau ne doit pas valider automatiquement toutes les relations. Il sert à matérialiser le raisonnement des joueurs. 

#### **4.8 Verdict et révélation** 

Le rapport final comprend le coupable présumé, le mobile, la méthode, la chronologie, les preuves justificatives et une explication libre. Les deux joueurs doivent approuver le rapport avant sa soumission. 

Le serveur vérifie que la session est autorisée à soumettre un verdict et compare la réponse avec la solution privée. La révélation n'est rendue disponible qu'après cette validation. 

La révélation explique la solution, les éléments décisifs, les indices manqués, les fausses pistes et les éventuelles limites historiques. Le score récompense la qualité de la déduction et non uniquement le choix du bon nom. 

## **5. Règles de gameplay et conception des enquêtes** 

#### **5.1 Structure d'une affaire** 

|**Élément**|**Contenu attendu**|
|---|---|
|Métadonnées|Identifiant, titre, catégorie, difficulté, durée, résumé, localisation.|
|Victime|Identité, biographie, circonstances connues.|
|Personnages|Suspects et témoins, relations, déclarations et alibis.|
|Lieux|Environnements, scènes et points d'interaction.|
|Preuves|Indices principaux et secondaires, origine et liens.|
|Interrogatoires|Questions, réponses, prérequis, contradictions et déblocages.|
|Chronologie|Événements datés et niveau de certitude.|
|Solution|Coupable, mobile, méthode, séquence et explication.|
|Sources|Références, statut des faits, incertitudes et droits d'utilisation.|



#### **5.2 Cohérence et validation narrative** 

- La solution canonique doit être écrite avant les dialogues et les indices. 

THE LAST CLUE  •  Cahier des charges MVP  •  6 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

- Chaque indice important doit avoir une fonction dans la résolution. 

- Les alibis et déclarations doivent être compatibles avec la chronologie. 

- Les contradictions doivent être explicables et accessibles par une action de jeu. 

- Les fausses pistes ne doivent pas rendre la solution arbitraire. 

- Le rapport de révélation doit démontrer la solution à partir d'éléments accessibles aux joueurs. 

#### **5.3 Première affaire proposée : THE LAST LETTER** 

Affaire fictive située à Blackwood Manor, une demeure privée. Alexander Whitmore, propriétaire de 58 ans, est retrouvé mort dans son bureau lors d'une réception privée. Quatre suspects et deux témoins ont des informations contradictoires sur les derniers déplacements de la victime. 

La proposition est un point de départ narratif. Avant intégration, il faut écrire le dossier complet : identité du coupable, mobile, méthode, chronologie, alibis, huit indices principaux, quatre indices secondaires, dialogues, contradictions et solution canonique. 

|**Contenu cible**|**Quantité**|
|---|---|
|Victime|1|
|Suspects|4|
|Témoins|2|
|Indices principaux|8|
|Indices secondaires|4|
|Questions d'interrogatoire|Environ 20|
|Lieux explorables|2|
|Événements de chronologie|Environ 8|
|Solution canonique|1|



#### **5.4 Affaires historiques : exigence documentaire** 

Chaque affaire historique doit comporter un dossier de provenance. Les sources primaires ou institutionnelles sont privilégiées lorsque disponibles : archives judiciaires, rapports officiels, documents d'époque, bibliothèques et institutions reconnues. 

- Étiqueter chaque information : fait documenté, conclusion judiciaire, témoignage rapporté, hypothèse ou reconstruction de gameplay. 

- Ne pas présenter une personne comme coupable si le dossier historique ne permet pas de l'établir. 

- Indiquer les controverses, révisions ou limites de l'enquête. 

- Respecter les droits d'auteur des photographies, documents et textes réutilisés. 

- Ne pas reproduire de contenu graphique inutile; maintenir une approche respectueuse des victimes. 

## **6. Direction artistique et expérience audiovisuelle** 

#### **6.1 Identité visuelle** 

|**Rôle**|**Couleur**|**Utilisation**|
|---|---|---|
|Background|#101316|Fond principal, scènes sombres.|
|Surface|#1C2228|Panneaux, cartes, menus.|
|Accent|#C7A36A|Or vieilli, boutons importants, détails.|
|Danger|#B84A43|Alertes, contradictions, erreurs.|
|Texte|#D7D4CA|Texte principal et documents.|



THE LAST CLUE  •  Cahier des charges MVP  •  7 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

#### **6.2 Typographie et style** 

Titres : Cinzel ou Cormorant Garamond. Interface : Inter ou Manrope. Documents et métadonnées : IBM Plex Mono. L'interface doit rester lisible et contrastée, même dans les scènes sombres. 

#### **6.3 Audio et animation** 

- Ambiance de pluie, ventilation ou horloge discrète. 

- Sons de papier, tiroirs, clics et découverte d'indice. 

- Musique d'ambiance sobre, contrôlable indépendamment des effets. 

- Transitions de panneaux, mise en évidence des objets et animations de révélation. 

- Prévoir des contrôles de volume et un mode silencieux. 

Les effets visuels ne doivent pas masquer les informations importantes. Les animations doivent respecter les performances et les préférences d'accessibilité. 

## **7. Architecture technique** 

#### **7.1 Stack recommandée** 

|**Couche**|**Technologie**|**Responsabilité**|
|---|---|---|
|Frontend|React + Vite + TypeScript|Application web et navigation.|
|3D|Three.js + React Three Fiber + Drei|Scènes, caméra, éclairage, raycasting.|
|Styles|Tailwind CSS|Interface et responsive.|
|État client|Zustand|État d'interface et état temporaire.|
|Animation|GSAP + Framer Motion|Animations 3D et UI.|
|Backend|Supabase|Services backend managés.|
|Base de données|PostgreSQL|Persistance des sessions et données.|
|Temps réel|Supabase Realtime|Diffusion des événements et présence.|
|Authentification|Supabase Auth|Identité et session utilisateur.|
|Logique sécurisée|Supabase Edge Functions / fonctions SQL|Création de salle, adhésion, verdict et<br>accès secret.|
|Audio|Howler.js|Lecture et contrôle audio.|
|Validation|Zod|Validation des données.|
|Hébergement|Vercel|Déploiement frontend.|



#### **7.2 Architecture logique** 

PLAYER 1 BROWSER                         PLAYER 2 BROWSER React + Three.js + Zustand              React + Three.js + Zustand |                                         | +------------- HTTPS / Realtime ---------+ | SUPABASE BACKEND 

+-----------------+----------------------+ |                 |                      | Auth             PostgreSQL              Realtime |                 |                      | +----------- Edge Functions ------------+ | Validation des actions sensibles 

THE LAST CLUE  •  Cahier des charges MVP  •  8 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

PostgreSQL est la source de vérité pour la progression persistante. Realtime diffuse les changements. Le client ne doit pas être considéré comme autorité pour les règles métier ou les secrets. 

#### **7.3 Principes d'architecture** 

- Le frontend gère l'affichage et les interactions, mais ne décide pas seul des actions sensibles. 

- Le contenu public d'une affaire est séparé de sa solution confidentielle. 

- Les composants UI ne contiennent pas directement les règles narratives. 

- Le moteur d'enquête consomme des données typées et validées. 

- Les événements temps réel sont persistés et idempotents. 

- Les environnements 3D sont chargés à la demande. 

## **8. Modèle de données et synchronisation** 

#### **8.1 Tables principales** 

|**Table**|**Rôle**|**Accès / remarque**|
|---|---|---|
|profiles|Profils joueurs|Utilisateur connecté; champs publics<br>limités.|
|cases|Catalogue des affaires|Métadonnées publiques uniquement.|
|case_evidence|Preuves d'une affaire|Contenu d'enquête public autorisé.|
|case_suspects|Suspects et témoins|Informations de personnage.|
|case_questions|Questions et scripts|Données nécessaires aux dialogues;<br>contrôler les conditions sensibles.|
|case_secret_solutions|Solutions canoniques|Accès serveur uniquement avant révélation.|
|game_sessions|Sessions privées|Créateur, affaire, statut, code hashé ou<br>protégé.|
|session_players|Joueurs d'une session|Maximum deux; contrôle d'appartenance.|
|session_evidence|Preuves découvertes|État partagé et horodatage.|
|session_interrogations|Progression dialogues|Questions posées et informations<br>débloquées.|
|session_notes|Notes privées ou communes|Champ de visibilité et auteur.|
|session_connections|Relations du tableau|Nœuds reliés, type de lien et auteur.|
|session_verdicts|Rapports finaux|Soumissions, approbations et résultat.|



#### **8.2 Synchronisation des événements** 

|**Événement**|**Effet côté partenaire**|
|---|---|
|evidence_collected|La preuve apparaît dans son inventaire.|
|suspect_questioned|Le dossier d'interrogatoire est actualisé.|
|note_created / note_updated|La note commune est mise à jour.|
|connection_created|Le lien apparaît sur le tableau.|
|player_ready|Le statut du lobby change.|
|verdict_approved|L'approbation du joueur est visible.|
|case_completed|L'accès à la révélation est ouvert.|



THE LAST CLUE  •  Cahier des charges MVP  •  9 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

#### **8.3 Règles de persistance** 

- Enregistrer les actions importantes avant de confirmer leur réussite à l'interface. 

- Utiliser des identifiants uniques et des contraintes pour éviter les doublons. 

- Recharger l'état complet depuis la base à la reconnexion. 

- Utiliser Realtime comme mécanisme de notification, pas comme unique stockage. 

- Prévoir des horodatages serveur et une gestion des conflits pour les modifications simultanées. 

#### **8.4 Exemple de structure TypeScript** 

type CaseCategory = "historical" | "fictional"; type Difficulty = "easy" | "medium" | "hard"; interface InvestigationCasePublic { id: string; title: string; category: CaseCategory; difficulty: Difficulty; introduction: string; location: string; incidentDate?: string; victim: Victim; suspects: Suspect[]; witnesses: Witness[]; evidence: Evidence[]; interrogations: InterrogationScript[]; timeline: TimelineEvent[]; historicalSources?: HistoricalSource[]; } // Ne jamais inclure la solution privée dans le payload public. interface CaseSecretSolution { caseId: string; culpritId: string; motive: string; method: string; explanation: string; requiredEvidenceIds: string[]; } 

## **9. Sécurité, confidentialité et fiabilité** 

#### **9.1 Principes de sécurité** 

- Activer Row Level Security sur toutes les tables exposées au client. 

- Vérifier côté serveur qu'un utilisateur appartient à la session concernée. 

- Limiter une salle à deux joueurs avec une contrainte transactionnelle côté base. 

- Générer les codes d'invitation avec une source cryptographiquement sûre. 

- Ne jamais intégrer la clé Supabase service_role dans le frontend. 

- Conserver la solution canonique dans un schéma ou une table non accessible au rôle client. 

- Vérifier côté serveur l'état de la session et les deux approbations avant révélation. 

- Limiter les tentatives de codes et les actions sensibles. 

- Ne pas faire confiance aux identifiants ou statuts envoyés par le navigateur. 

THE LAST CLUE  •  Cahier des charges MVP  •  10 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

#### **9.2 Gestion des secrets** 

Le navigateur ne reçoit pas la solution pendant l'enquête. Une fonction serveur vérifie le verdict et autorise la révélation lorsque les conditions sont réunies. Les politiques RLS doivent être testées avec des comptes joueurs distincts. 

#### **9.3 Variables d'environnement** 

VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= # Secrets serveur uniquement : ne jamais préfixer par VITE_ SUPABASE_SERVICE_ROLE_KEY= 

Les noms exacts des secrets serveur dépendront de la configuration de déploiement Supabase. Le fichier .env.example ne doit contenir aucune vraie clé. 

THE LAST CLUE  •  Cahier des charges MVP  •  11 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

## **10. Structure du projet** 

the-last-clue/ ├── public/ │└── assets/ │ ├── environments/ │ ├── textures/ │ ├── models/ │ ├── audio/ │ └── images/ ├── src/ │├── app/                  # Router et providers │├── components/ ││├── ui/ ││├── layout/ ││├── evidence/ ││├── suspects/ ││└── investigation/ │├── features/ ││├── auth/ ││├── lobby/ ││├── multiplayer/ ││├── investigation/ ││├── interrogations/ ││├── evidence-board/ ││└── verdict/ │├── game/ ││├── engine/ ││├── scenes/ ││├── objects/ ││├── interactions/ ││└── camera/ │├── data/ ││├── cases/ ││└── schemas/ │├── hooks/ │├── lib/ │├── stores/ │├── types/ │└── utils/ ├── supabase/ │├── migrations/ │├── functions/ │└── seed.sql ├── .env.example ├── package.json ├── tsconfig.json └── vite.config.ts 

## **11. Planning de réalisation** 

Le planning ci-dessous est un ordre de réalisation et non une garantie de durée. Le temps réel dépendra des assets 3D disponibles, de la configuration Supabase et des corrections nécessaires. 

**Phase** 

**Travaux Livrable / validation** 

THE LAST CLUE  •  Cahier des charges MVP  •  12 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

|1. Fondations|Vite, React, TypeScript, dépendances,<br>routing, design system, Supabase client,<br>landing page.|Application démarre, build réussi, routes<br>présentes.|
|---|---|---|
|2. Multijoueur|Auth/profil, création et adhésion, code,<br>lobby, présence, readiness.|Deux navigateurs rejoignent la même salle.|
|3. Exploration|Bureau 3D, scène de crime, caméra, objets<br>interactifs, preuves.|Les deux joueurs découvrent une preuve et<br>la voient synchronisée.|
|4. Déduction|Dossiers, dialogues conditionnels, notes,<br>tableau, chronologie.|Progression persistée et cohérente.|
|5. Résolution|Verdict commun, validation serveur,<br>révélation, score.|La solution reste cachée avant validation.|
|6. Stabilisation|Tests multi-navigateurs, sécurité,<br>reconnexion, optimisation, déploiement.|Checklist d'acceptation réussie.|



#### **11.1 Ordre de priorité si le temps est très limité** 

11. Faire fonctionner la création et la jonction de session. 

12. Faire fonctionner la synchronisation des preuves et la persistance. 

13. Terminer une enquête courte mais cohérente. 

14. Construire une scène 3D simple, propre et interactive. 

15. Ajouter les interrogatoires et le tableau partagé. 

16. Terminer le verdict et la révélation. 

17. Polir les animations, l'audio et les détails décoratifs. 

## **12. Tests et critères d'acceptation** 

|**ID**|**Test**|**Résultat attendu**|
|---|---|---|
|AC-01|Créer une salle|Un code unique est généré et la salle est<br>enregistrée.|
|AC-02|Rejoindre une salle|Le deuxième joueur rejoint avec le bon<br>code.|
|AC-03|Troisième joueur|L'accès est refusé lorsque deux joueurs<br>sont présents.|
|AC-04|Dossier commun|Les deux joueurs voient la même affaire et<br>le même état partagé.|
|AC-05|Collecte de preuve|Une preuve apparaît chez les deux joueurs<br>sans doublon.|
|AC-06|Interrogatoire|Les questions posées et déblocages sont<br>synchronisés.|
|AC-07|Notes privées|Un joueur ne voit pas les notes privées de<br>l'autre.|
|AC-08|Tableau partagé|Les cartes et relations sont synchronisées.|
|AC-09|Rafraîchissement|La progression est restaurée après<br>rechargement.|
|AC-10|Déconnexion|Le joueur peut revenir sans perdre la<br>session.|
|AC-11|Solution secrète|Aucun endpoint ou payload public ne révèle<br>la solution prématurément.|
|AC-12|Verdict|La soumission est validée côté serveur et<br>nécessite les approbations prévues.|
|AC-13|Révélation|La solution est révélée après validation<br>seulement.|



THE LAST CLUE  •  Cahier des charges MVP  •  13 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

|AC-14|Deux ordinateurs|La partie fonctionne dans deux navigateurs<br>sur deux machines.|
|---|---|---|



#### **12.1 Compatibilité et performance** 

- Tester sur les versions récentes de Chrome, Firefox et Edge. 

- Prévoir un message clair si WebGL est indisponible. 

- Charger les environnements 3D à la demande. 

- Limiter la taille et le nombre de textures. 

- Éviter les abonnements Realtime dupliqués. 

- Tester une connexion réseau instable et les rechargements de page. 

## **13. Risques, arbitrages et évolutions** 

|**Risque**|**Conséquence**|**Mesure de réduction**|
|---|---|---|
|Scope trop ambitieux|MVP incomplet.|Une seule affaire complète;<br>environnements simples.|
|Solution exposée au client|Enquête contournable.|Séparation public/secret et validation<br>serveur.|
|Désynchronisation|Les joueurs ne voient pas la même<br>progression.|PostgreSQL source de vérité, événements<br>idempotents, rechargement d'état.|
|Dialogue incohérent|Perte de confiance dans l'enquête.|Scripts déterministes et tests de scénario.|
|Assets 3D manquants|Décors inachevés.|Prototype avec géométrie, matériaux et<br>éclairage cohérents.|
|Faits historiques contestés|Mauvaise représentation d'une affaire<br>réelle.|Provenance, nuance éditoriale et<br>séparation faits/reconstitution.|
|Problèmes de droits|Retrait d'images ou documents.|Assets autorisés, licences vérifiées ou<br>créations originales.|



#### **13.1 Évolutions possibles** 

- Bibliothèque de plusieurs affaires historiques et fictives. 

- Mode enquête ouverte pour les affaires non résolues. 

- Plusieurs niveaux de difficulté et système d'indices. 

- Avatars plus détaillés et animations de personnages. 

- Voix enregistrées pour les interrogatoires. 

- Mode local sur un seul ordinateur. 

- Mode spectateur ou troisième rôle de soutien, hors MVP. 

- Éditeur de scénarios et outils d'administration. 

## **Annexe A. Exemple de première affaire** 

#### **THE LAST LETTER — Dossier de conception initial** 

Catégorie : fictive. Difficulté visée : moyenne. Durée cible : 45 à 60 minutes. 

Lieu : Blackwood Manor. Victime : Alexander Whitmore, propriétaire de 58 ans, retrouvé mort dans son bureau pendant une réception privée. Quatre suspects et deux témoins ont des versions qui se recoupent partiellement. 

THE LAST CLUE  •  Cahier des charges MVP  •  14 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

Question centrale : comment la victime a-t-elle pu être retrouvée dans un bureau fermé, alors que plusieurs personnes affirment l'avoir vue après l'heure présumée du décès ? 

Le scénariste doit produire avant implémentation : 

- Une fiche complète de la victime, des quatre suspects et des deux témoins. 

- Une chronologie canonique avec heures et marges d'incertitude. 

- Huit indices principaux et quatre indices secondaires. 

- Au moins trois contradictions accessibles par confrontation. 

- Environ vingt questions et réponses conditionnelles. 

- Un plan des deux lieux explorables et les points d'interaction. 

- Une solution démontrable à partir des indices accessibles. 

- Un rapport de révélation qui explique les déductions. 

##### **NOTE DE PRODUCTION** 

THE LAST LETTER est une proposition fictive. Aucun coupable ni détail criminel n'est fixé dans ce cahier des charges : ces éléments doivent être conçus et vérifiés ensemble avant d'être codés. 

## **Annexe B. Prompt initial pour Claude Code** 

Le prompt suivant est destiné à lancer le projet. Il demande à Claude Code de réaliser uniquement la phase fondatrice, plutôt que de générer toutes les fonctionnalités en une seule opération. 

THE LAST CLUE  •  Cahier des charges MVP  •  15 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

You are acting as a senior full-stack engineer, game developer, Three.js specialist, and software architect. 

Build THE LAST CLUE, a premium browser-based cooperative detective investigation game for two players. It is a real investigation experience, not a generic dashboard or quiz. 

###### PRODUCT 

Two players use separate browsers and investigate the same case. They explore crime scenes, collect evidence, inspect documents, interrogate suspects, identify contradictions, connect clues, submit a shared verdict, and discover a documented solution. 

###### CASE TYPES 

- Historical cases: distinguish verified facts, judicial findings, disputed claims, and gameplay reconstruction. Never invent a historical culprit or evidence. 

- Fictional cases: original cases with a predefined canonical solution. 

The first playable case will be fictional: THE LAST LETTER, set at Blackwood Manor. Do not invent a historical case. 

###### STACK 

React, Vite, TypeScript, React Router, Tailwind CSS, Zustand, Three.js, React Three Fiber, @react-three/drei, GSAP, Framer Motion, Supabase Auth, PostgreSQL, Supabase Realtime, Supabase Edge Functions, Lucide React, Howler.js, Zod. 

###### ART DIRECTION 

Realistic cinematic detective thriller. Palette: background #101316, surface #1C2228, accent #C7A36A, danger #B84A43, text #D7D4CA. Use elegant typography, realistic lighting, restrained animation, readable dark UI. Avoid generic SaaS dashboard styling. 

###### MULTIPLAYER 

Private two-player rooms, secure invitation codes, presence, ready state, shared investigation progress, reconnection and persistence. PostgreSQL is the source of truth. Realtime is used to notify clients of persisted changes. Do not rely only on client state. 

###### SECURITY 

Use Row Level Security. A user can only access sessions they belong to. A session has at most two players. Never expose service_role keys. Store canonical solutions in server-only tables or protected schemas. Never send the solution to the browser before the verdict is validated. Validate sensitive operations server-side. 

###### GAME SCREENS 

Landing page, authentication, investigator profile, lobby, case selection, briefing, 3D detective office, 3D crime scene, evidence inventory, suspect dossiers, deterministic interrogations, shared investigation board, final verdict, case revelation. 

###### CASE ENGINE 

Keep case content separate from React components. Use typed schemas. Public case content and private canonical solution must be separated. Dialogue is deterministic and predefined; do not use generative AI to invent critical clues or alter the solution. 

###### PROJECT STRUCTURE 

src/app, components, features/auth, features/lobby, features/multiplayer, features/investigation, features/interrogations, features/evidence-board, features/verdict, game/engine, game/scenes, game/objects, game/interactions, data/cases, data/schemas, hooks, lib, stores, types, utils. 

supabase/migrations, supabase/functions, supabase/seed.sql. 

###### FIRST TASK — PHASE 1 ONLY 

1. Inspect the workspace and existing files. 

2. Identify whether this is an empty or existing project. 

3. Initialize or adapt Vite + React + TypeScript. 

4. Install compatible dependencies. 

5. Configure Tailwind, routing, Zustand and Supabase client. 

6. Create the proposed modular folder structure. 

7. Create .env.example without real credentials. 

8. Create the main router and placeholder routes for future game screens. 

9. Create global design tokens and reusable layout. 

10. Build a polished cinematic landing page. 

11. Verify npm run build and fix errors. 

THE LAST CLUE  •  Cahier des charges MVP  •  16 

**THE LAST CLUE  /  DOCUMENT DE CONCEPTION** 

Do not build the entire game in this first phase. Do not invent credentials. Do not claim a feature works until implemented and tested. Use temporary CSS/Three.js compositions if no visual assets exist. Keep components small, typed and maintainable. After implementation, report what works, what remains, how to run the project, and what Supabase setup must be done manually. 

Start by inspecting the workspace, briefly explain your plan, and then execute PHASE 1. 

## **Annexe C. Commandes de démarrage** 

# PowerShell mkdir THE-LAST-CLUE cd THE-LAST-CLUE code . # Dans le terminal intégré, lancer Claude Code # Puis lui transmettre le prompt de l'annexe B. # Une fois la phase 1 terminée npm install npm run dev npm run build 

Ne pas ajouter de vraies clés Supabase au dépôt Git. Configurer les variables dans l'environnement local et dans le tableau de bord du fournisseur d'hébergement. 

## **Conclusion** 

Le succès du MVP se mesure à une expérience simple : deux joueurs rejoignent la même affaire, découvrent et discutent des mêmes preuves, construisent une théorie cohérente, soumettent une accusation et comprennent pourquoi la solution est correcte. La 3D, l'audio et l'identité visuelle renforcent cette expérience, mais la cohérence narrative, la sécurité et la synchronisation restent les priorités. 

##### **CRITÈRE DE RÉUSSITE FINAL** 

Une enquête complète, jouable à deux sur deux ordinateurs, avec progression persistante, indices synchronisés, solution protégée et révélation convaincante. 

THE LAST CLUE  •  Cahier des charges MVP  •  17 

