# **THE LAST CLUE** 

## **CATALOGUE DES ASSETS** 

_Feuille de route de sourcing, création et intégration — MVP_ 

Direction artistique : thriller policier réaliste et cinématique 

Version 1.0 — 14 novembre 2026 

THE LAST CLUE  •  Catalogue des assets  •  MVP 

### **1. Objectif du document** 

Ce catalogue réduit le travail de recherche demandé à Claude Code. Il définit les familles d’assets, les formats cibles, les priorités, les bibliothèques à consulter et les critères d’acceptation. Il ne prétend pas que les fichiers sont déjà téléchargés ou que chaque ressource proposée est automatiquement libre d’utilisation : chaque asset doit être vérifié individuellement. 

Principe de production : acheter ou créer le moins possible au départ. Réutiliser des assets cohérents, construire une scène modulaire, puis investir le temps dans l’éclairage, la composition, le son et les interactions. 

### **2. Direction artistique à respecter** 

- Univers : manoir anglais fictif, fin XIXe / début XXe siècle, réception mondaine, enquête criminelle. 

- Rendu : réaliste, cinématique, sombre mais lisible ; éclairage chaud intérieur, nuit froide à l’extérieur. 

- Palette : fond #101316, surfaces #1C2228, accent or #C7A36A, danger #B84A43, texte #D7D4CA. 

- Matériaux : bois sombre, laiton patiné, velours, papier vieilli, verre, pierre, tissus épais. 

- Éviter : assets cartoon, low-poly stylisé, packs visuellement disparates, gore explicite, effets excessifs. 

- Cible technique : navigateur desktop moderne ; priorité à la stabilité et au temps de chargement plutôt qu’à la fidélité AAA. 

### **3. Bibliothèques recommandées** 

|**Source**|**À utiliser pour**|**Règle de licence / vigilance**|**Lien**|
|---|---|---|---|
|Poly Haven|HDRI, textures PBR, modèles 3D|Assets publiés sous CC0 selon la<br>bibliothèque ; conserver la fiche<br>source dans le catalogue.|https://polyhaven.com/|
|Sketchfab|Objets, mobilier, accessoires,<br>environnements|Licence variable selon le<br>modèle ; vérifier la fiche et les<br>droits de téléchargement.|https://sketchfab.com/|
|Fab|Packs d’environnement, props,<br>personnages|Conditions variables selon l’offre<br>et le vendeur ; vérifier les droits<br>d’usage web et redistribution.|https://www.fab.com/|
|Mixamo|Rigging et animations de<br>personnages|Vérifier les conditions Adobe et<br>les droits du modèle utilisé ;<br>exporter les animations<br>nécessaires.|https://www.mixamo.com/|
|ambientCG|Matériaux et textures PBR|Bibliothèque CC0 ; vérifier les<br>métadonnées de chaque<br>ressource.|https://ambientcg.com/|
|Kenney|UI, icônes et assets de<br>prototypage|Utile surtout pour prototypage ;<br>ne pas mélanger au rendu<br>réaliste final sans validation.|https://kenney.nl/assets|
|Freesound|Ambiances, bruitages, sons<br>d’objets|Licence par fichier ; vérifier<br>attribution, usage commercial et<br>éventuelles restrictions.<br>i|https://freesound.org/|
|OpenGameArt|Sons et assets complémentaires|Licences très variables ; filtrer et<br>documenter chaque fichier.|https://opengameart.org/|



### **4. Inventaire des assets — priorités MVP** 

P0 = indispensable au premier prototype jouable. P1 = améliore fortement la présentation, mais peut arriver après la boucle de jeu. P2 = polish ou contenu secondaire. 

|**Priorité**|**Famille / asset**|**Quantité cible**|**Format conseillé**|**Notes d’intégration**|
|---|---|---|---|---|
|P0|Bureau du manoir —<br>pièce principale|1|GLB/GLTF modulaire|Scène centrale d’enquête<br>; prévoir une version|



THE LAST CLUE  •  Catalogue des assets  •  MVP 

|||||simplifiée pour le<br>chargement.|
|---|---|---|---|---|
|P0|Mobilier de bureau|1 bureau, 1 fauteuil, 1<br>bibliothèque, 1 cheminée|GLB/GLTF|Objets séparés si<br>interaction ou<br>déplacement requis.|
|P0|Objets examinables|8 principaux + 4<br>secondaires|GLB/GLTF|Chaque objet doit avoir<br>un identifiant stable, un<br>point d’interaction et une<br>fiche d’indice.|
|P0|Éléments d’architecture|Murs, sol, fenêtres, porte|Modulaire GLB +<br>matériaux|Privilégier les modules<br>réutilisables et collisions<br>simples.|
|P0|Éclairage et ambiance|1 HDRI + lumières locales|HDRI .hdr/.exr + Three.js<br>lights|HDRI discret ; privilégier<br>lumières locales pour la<br>narration.|
|P0|Interface dossier /<br>preuves|1 système UI|SVG, PNG, CSS|À développer dans React ;<br>éviter les captures<br>d’écran comme UI.|
|P0|Documents d’enquête|Lettres, notes, plan,<br>registre|SVG/PNG/WebP + texte<br>HTML|Créer sur mesure pour<br>garantir lisibilité et<br>cohérence narrative.|
|P1|Extérieur du manoir|1 façade|GLB/GLTF ou image<br>panoramique|Peut être une scène<br>d’introduction statique au<br>MVP.|
|P1|Couloir et salle de<br>réception|2 espaces|GLB/GLTF modulaires|Peuvent être débloqués<br>après la première scène.|
|P1|Personnages suspects /<br>témoins|6 personnages|GLB/GLTF riggé|Commencer par portraits<br>2D si les modèles<br>réalistes sont trop<br>coûteux.|
|P1|Avatars joueurs|2 personnages|GLB/GLTF riggé|La caméra à la première<br>personne peut éviter un<br>avatar complet au MVP.|
|P1|Animations|Idle, walk, gestures|GLB/FBX via Mixamo|Seulement si les<br>personnages sont visibles<br>en 3D.|
|P1|Sons d’ambiance|6–10 boucles / effets|OGG/MP3/WAV|Pluie, vent, horloge, feu,<br>pas, porte, papier, clics<br>UI.|
|P2|Effets cinématiques|Transitions, poussière,<br>pluie|Shader / particles / vidéo<br>légère|Ne pas dégrader les<br>performances ni masquer<br>les indices.|
|P2|Scènes additionnelles|Selon les futurs dossiers|GLB/GLTF|Construire une<br>bibliothèque réutilisable<br>de pièces et props.|



### **5. Pack de scène recommandé : THE LAST LETTER** 

#### **5.1 Le bureau — première scène à construire** 

Ne pas chercher un manoir entier dès le départ. Le MVP doit d’abord proposer une seule pièce convaincante, compacte et riche en interactions. Composer le bureau avec des éléments séparés permet de contrôler la caméra, les collisions et les points examinables. 

- Architecture : pièce rectangulaire, porte d’entrée, fenêtres, cheminée, parquet, plinthes et moulures. 

- Mobilier : bureau principal, fauteuil, chaise secondaire, bibliothèque, petite table, tapis. 

- Décor : rideaux, chandeliers, horloge, tableaux, livres, vaisselle, objets personnels. 

- Lumières : lune froide par les fenêtres, lampe de bureau chaude, cheminée chaude, zones d’ombre maîtrisées. 

- Interactions : porte, bureau, lettre, montre, cheminée, bibliothèque, tapis / sol, fenêtre ou rideau. 

THE LAST CLUE  •  Catalogue des assets  •  MVP 

#### **5.2 Les 12 preuves** 

|**ID provisoire**|**Objet visuel à créer**|**Présentation**|**Interaction attendue**|
|---|---|---|---|
|E01|Lettre cachetée|Enveloppe papier vieilli et sceau|Zoom, lecture du document|
|E02|Montre de poche|Laiton / cadran détaillé|Examiner l’heure et l’état|
|E03|Verre|Verre sur le bureau ou près du<br>fauteuil|Examiner traces / position selon<br>scénario|
|E04|Clé|Petite clé ancienne|Zoom et comparaison avec<br>serrure|
|E05|Registre|Livre relié ouvert|Lire une entrée précise|
|E06|Photographie|Photo ancienne encadrée ou<br>libre|Zoom sur les détails|
|E07|Cendres / cheminée|Cendres et fragment de papier|Examiner le fragment|
|E08|Tapis / trace au sol|Texture et détail de scène|Inspecter un point précis|
|E09–E12|Indices secondaires|À définir avec le scénario<br>canonique|Débloquer des pistes<br>complémentaires|



Important : les objets et les interactions doivent être définis à partir de la solution narrative canonique. Ne pas inventer des preuves visuelles qui contredisent la chronologie ou la méthode du crime. 

### **6. Personnages : stratégie économique** 

Les personnages réalistes animés peuvent devenir le poste le plus coûteux en temps et en performance. Pour le MVP, utiliser des portraits de qualité dans les fiches de suspects et des scènes d’interrogatoire à caméra fixe. N’ajouter des personnages 3D complets que si le rendu et le temps le permettent. 

|**Élément**|**MVP recommandé**|**Évolution**|
|---|---|---|
|Inspecteurs joueurs|Avatar minimal ou aucun avatar visible ;<br>présence via nom et statut|Personnage 3D personnalisable|
|Alexander Whitmore|Portrait narratif + photographie de dossier|Modèle 3D pour flashbacks / reconstitution|
|4 suspects|Portraits cohérents, cadrage et lumière<br>identiques|Personnages riggés et animations faciales|
|2 témoins|Portraits cohérents|Personnages riggés et gestes d’interrogatoire|



### **7. Audio et atmosphère** 

|**Asset sonore**|**Usage**|**Format / durée indicative**|**Priorité**|
|---|---|---|---|
|Pluie sur les vitres|Boucle d’ambiance discrète|OGG, 30–90 s en boucle|P1|
|Feu de cheminée|Fond intérieur|OGG, 20–60 s en boucle|P1|
|Horloge ancienne|Tension / repère sonore|OGG, boucle courte|P1|
|Pas sur parquet|Déplacements|WAV/OGG, variations courtes|P2|
|Porte / serrure|Interaction|WAV, 1–3 s|P1|
|Papier / enveloppe|Examen de documents|WAV, 1–3 s|P1|
|UI : sélection / preuve|Retour d’interaction|WAV, moins de 1 s|P1|
|Musique de tension|Fond musical très discret|OGG, boucle 1–3 min|P2|



### **8. Formats, optimisation et conventions** 

- 3D : GLB/GLTF en priorité ; éviter les FBX/OBJ à la livraison web si une conversion propre est possible. 

- Textures : PBR ; utiliser des tailles raisonnables (souvent 1K ou 2K pour les props, 2K pour les éléments majeurs si nécessaire). 

- Images : WebP/AVIF pour les images web ; PNG uniquement lorsque transparence ou qualité spécifique l’exige. 

- Audio : OGG ou MP3 pour diffusion web ; WAV uniquement comme source de travail ou pour effets très courts si utile. 

- Nommage : snake_case, noms explicites, identifiants stables (ex. office_desk.glb, evidence_letter_01.webp). 

THE LAST CLUE  •  Catalogue des assets  •  MVP 

- Ne jamais écraser un asset original ; conserver les fichiers source et documenter les conversions. 

- Charger les scènes lourdes à la demande ; précharger uniquement les ressources nécessaires au premier écran. 

- Tester chaque modèle dans l’application : échelle, orientation, matériaux, transparence, performances et droits. 

### **9. Arborescence cible** 

public/ assets/ environments/ blackwood_manor/ study/ hallway/ reception_room/ characters/ inspectors/ suspects/ witnesses/ props/ furniture/ decor/ interactive/ evidence/ the_last_letter/ textures/ materials/ hdri/ audio/ ambience/ interactions/ music/ images/ portraits/ documents/ thumbnails/ docs/ ASSET_CATALOG.md ASSET_LICENSES.md ASSET_SHORTLIST.md 

### **10. Workflow demandé à Claude Code** 

- Créer ASSET_CATALOG.md, ASSET_LICENSES.md et ASSET_SHORTLIST.md avant tout téléchargement massif. 

- Faire un audit du besoin par scène et distinguer P0, P1 et P2. 

- Proposer 2 à 3 candidats pour chaque asset majeur, avec aperçu, URL directe, format, taille et licence. 

- Ne pas télécharger automatiquement des fichiers dont la licence ou l’origine n’est pas claire. 

- Pour chaque asset retenu, noter le nom, l’auteur, l’URL source, la licence, l’obligation d’attribution, la date de vérification et le chemin local. 

- Si un site exige une connexion, un clic manuel ou une acceptation de licence, demander à l’utilisateur d’effectuer cette étape plutôt que de contourner la protection. 

- Intégrer d’abord un petit vertical slice : bureau, éclairage, 3 objets examinables, interface de preuve et son d’ambiance. 

THE LAST CLUE  •  Catalogue des assets  •  MVP 

- Présenter une capture / démonstration du rendu avant de sourcer toute la bibliothèque restante. 

### **11. Critères d’acceptation d’un asset** 

- Cohérent avec le style réaliste et cinématique du projet. 

- Licence et attribution documentées et compatibles avec l’usage prévu. 

- Format importable et rendu correct dans Three.js / React Three Fiber. 

- Échelle, pivot, orientation et matériaux vérifiés. 

- Poids du fichier et résolution des textures raisonnables. 

- Aucun lien externe fragile requis au runtime : les assets retenus sont stockés et servis depuis le projet ou un stockage contrôlé. 

- Si l’asset est interactif, son identifiant et son comportement sont reliés au système d’enquête. 

### **12. Prompt prêt à transmettre à Claude Code** 

Read docs/ASSET_CATALOG.md (or this document if supplied) and take ownership of the asset sourcing workflow for THE LAST CLUE. 

Your first task is NOT to download everything. Audit the current repository and create: 

- docs/ASSET_CATALOG.md 

- docs/ASSET_LICENSES.md 

- docs/ASSET_SHORTLIST.md 

Use the asset plan and priorities in this specification. For each major asset, shortlist 2–3 candidates and record source URL, creator, license, attribution requirements, file format, approximate size, and intended use. Verify the license on the individual asset page; do not infer it from the platform. 

Prioritize a single polished vertical slice: the Blackwood Manor study, its modular architecture and furniture, three examinable evidence props, one document UI, and a restrained ambient sound layer. 

Use GLB/GLTF for 3D wherever possible. Do not hotlink third-party assets in production. Do not bypass logins, paywalls, download restrictions, or license gates. If a download requires manual action, provide the exact page and steps for the user. 

Do not invent asset URLs, license terms, or download status. Do not claim an asset is integrated until it loads and renders in the application. Preserve original source files and document every conversion. 

Before major visual integration, show a concise shortlist and explain trade-offs. Keep the art direction realistic, cinematic, coherent, and performant for desktop browsers. 

### **13. Décisions à garder en tête** 

- Le MVP n’a pas besoin d’un manoir entièrement explorable : une seule pièce dense et convaincante suffit pour valider la boucle d’enquête. 

- Les personnages 3D complets sont différables ; des portraits bien conçus peuvent porter les interrogatoires. 

- La solution narrative doit être finalisée avant de figer les preuves et leurs visuels. 

- La cohérence de lumière, de matériaux, de cadrage et de son compte davantage que le nombre d’assets. 

- Les assets de démonstration ne sont pas automatiquement approuvés pour le produit final. 

THE LAST CLUE  •  Catalogue des assets  •  MVP 

