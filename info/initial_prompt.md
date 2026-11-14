# CLAUDE CODE — INITIAL PROJECT PROMPT
## THE LAST CLUE — Foundation & MVP Architecture

You are acting as a senior full-stack engineer, game developer, Three.js specialist, and software architect.

Your mission is to build **THE LAST CLUE**, a premium browser-based cooperative detective investigation game for two players.

This is not a generic dashboard or a simple quiz application. It must feel like a real detective investigation experience, with cinematic environments, interactive crime scenes, evidence collection, suspect interrogations, investigation boards, and a complete case resolution system.

## 1. PRODUCT VISION

THE LAST CLUE is an online cooperative detective game.

Two players play as investigators working together on the same criminal investigation.

They must:
- Explore crime scenes.
- Discover and collect evidence.
- Examine documents and forensic reports.
- Interrogate suspects and witnesses.
- Identify contradictions.
- Connect evidence.
- Build theories.
- Reconstruct the crime.
- Submit a final accusation.
- Discover the official solution.

The game supports two case categories:

1. Historical cases: based on documented real criminal cases. Clearly distinguish verified historical facts, judicial findings, disputed claims, and reconstructed gameplay elements.
2. Fictional cases: original mysteries with predefined suspects, motives, evidence, timelines, and one canonical solution.

The initial playable case will be fictional. Do not invent a historical case or represent fictional evidence as historical evidence.

## 2. TECHNOLOGY STACK

Use the following technologies:

### Frontend
- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Zustand

### 3D
- Three.js
- React Three Fiber
- @react-three/drei

### Animation
- GSAP
- Framer Motion

### Backend
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Edge Functions

### Additional libraries
- Lucide React
- Howler.js
- Zod

Use stable compatible package versions. Avoid unnecessary dependencies.

## 3. ART DIRECTION

The visual direction is REALISTIC CINEMATIC.

The game should feel like a premium detective thriller.

Visual references:
- Modern detective investigation games.
- Cinematic crime dramas.
- Dark detective offices.
- Realistic forensic investigation environments.
- Premium mystery game interfaces.

### Color palette

- Background: #101316
- Surface: #1C2228
- Accent gold: #C7A36A
- Danger red: #B84A43
- Primary text: #D7D4CA

### Typography

- Headings: Cinzel or Cormorant Garamond.
- Interface: Inter or Manrope.
- Evidence documents: IBM Plex Mono.

### Visual principles

- Dark cinematic environments.
- Subtle lighting and realistic shadows.
- High-quality textures.
- Elegant interface panels.
- Smooth transitions.
- Subtle hover effects.
- Clear information hierarchy.
- No generic SaaS dashboard appearance.
- No excessive gradients or neon colors.
- No cartoon visual style.

Use restrained animation and ensure good performance.

## 4. GAME MODES

The game must support online cooperative gameplay.

Two players use separate browsers and join the same private investigation session.

Required functionality:

- Create a private room.
- Generate a unique invitation code.
- Join an existing room.
- Display player presence.
- Show player readiness.
- Start an investigation when both players are ready.
- Synchronize shared investigation progress.
- Recover the session after a browser refresh.
- Handle player disconnections and reconnections.

Both players share:
- Case progress.
- Evidence discoveries.
- Suspect interrogation progress.
- Investigation board.
- Shared notes.
- Final verdict.

Each player has:
- Individual profile.
- Investigator name.
- Avatar.
- Private notes.
- Audio preferences.

Use Supabase Realtime and PostgreSQL as the source of truth.

Do not rely on frontend state as the only source of truth.

## 5. GAME SCREENS

Build the following screens:

### A. Landing page

Create an immersive landing page featuring:
- THE LAST CLUE logo/title.
- A cinematic detective background.
- Subtle ambient animation.
- A short tagline.
- Enter investigation button.
- Sound toggle.

### B. Authentication

Implement:
- Sign up.
- Login.
- Logout.
- Session persistence.

Use Supabase Auth.

### C. Investigator profile

Allow the player to:
- Choose an investigator name.
- Select an avatar.
- View their profile.

### D. Multiplayer lobby

Implement:
- Create room.
- Join room using invitation code.
- Display both players.
- Show online/offline status.
- Ready/unready controls.
- Start investigation button.

### E. Case selection

Display available investigations.

Each case card must contain:
- Title.
- Category.
- Difficulty.
- Location.
- Estimated duration.
- Brief description.

Historical cases must display their historical source/provenance information.

### F. Case briefing

Display:
- Case introduction.
- Victim information.
- Incident location.
- Incident date.
- Initial circumstances.
- Known suspects.
- Initial investigation objectives.

### G. Detective office

Create a realistic 3D detective office using React Three Fiber.

The environment should contain:
- Detective desk.
- Computer.
- Investigation board.
- Filing cabinet.
- Documents.
- Desk lamp.
- Windows.

Use available 3D assets if provided. If none exist, create a visually coherent prototype using Three.js geometry, lighting, materials, and composition.

Do not depend on nonexistent assets.

### H. Crime scene

Create an interactive 3D environment.

The player must be able to:
- Explore the scene.
- Move the camera.
- Inspect interactive objects.
- Open close-up evidence panels.
- Collect evidence.

Use raycasting or appropriate React Three Fiber interaction mechanisms.

Each interactive object must have a unique evidence identifier.

When an object is discovered, synchronize the discovery with the other player.

### I. Evidence inventory

Display:
- Evidence title.
- Category.
- Description.
- Discovery location.
- Discovery status.
- Related suspects.
- Related events.

Allow players to inspect evidence in detail.

### J. Suspect dossiers

Each suspect profile must include:
- Portrait or placeholder.
- Name.
- Age.
- Occupation.
- Relationship to the victim.
- Biography.
- Known whereabouts.
- Initial statement.
- Evidence associated with the suspect.

### K. Interrogation system

Implement a deterministic dialogue system.

Each interrogation contains:
- Initial dialogue.
- Available questions.
- Conditional responses.
- Evidence confrontation options.
- Contradictions.
- Newly unlocked information.

Questions and responses must be predefined in case data.

Do not use generative AI to invent critical evidence or change the canonical solution.

### L. Investigation board

Build an interactive investigation board.

Allow players to:
- Add evidence cards.
- Add suspects.
- Add events.
- Connect two cards.
- Create hypotheses.
- Write shared notes.

Synchronize board changes using Supabase Realtime.

### M. Final verdict

Create a shared accusation form.

Fields:
- Suspected culprit.
- Motive.
- Method.
- Timeline.
- Supporting evidence.
- Explanation.

Both players must approve the final report before submission.

### N. Case revelation

After successful submission:
- Reveal the canonical solution.
- Explain the actual sequence of events.
- Explain the culprit's motive.
- Explain the method.
- Explain how the evidence proves the solution.
- Show which clues the players discovered.
- Show missed important clues.
- Display a final investigation score.

## 6. BACKEND AND DATABASE

Create a clean Supabase architecture.

Required database entities:

- profiles
- cases
- case_evidence
- case_suspects
- case_questions
- case_secret_solutions
- game_sessions
- session_players
- session_evidence
- session_interrogations
- session_notes
- session_connections
- session_verdicts

Create SQL migrations.

Enable Row Level Security on relevant tables.

Security requirements:

- Users can only access sessions they belong to.
- A room cannot have more than two players.
- Invitation codes must be generated securely.
- Users cannot access another session's private data.
- Users cannot read canonical solutions before the revelation.
- The service role key must never appear in frontend code.
- All important actions must be validated server-side.
- Prevent unauthorized changes to session progress.

Use Edge Functions or secure database functions for sensitive operations.

The frontend must never receive secret solution data during normal investigation.

## 7. CASE CONTENT ARCHITECTURE

Keep case content separate from application components.

Use typed schemas and reusable case-loading logic.

Each case must support:
- Metadata.
- Victim.
- Suspects.
- Witnesses.
- Evidence.
- Interrogations.
- Conditional dialogues.
- Timeline.
- Investigation locations.
- Canonical solution.
- Historical sources, when applicable.

Separate public investigation data from private solution data.

Create a fictional prototype case called:

THE LAST LETTER

Setting:
Blackwood Manor, a private mansion.

Victim:
Alexander Whitmore, a wealthy 58-year-old property owner.

Premise:
Alexander is found dead in his locked study during a private reception.

The case contains four suspects and two witnesses.

The mystery involves contradictory accounts of the victim's last movements.

IMPORTANT:
Before implementing this case, create a complete internal case design document containing:
- Actual culprit.
- Motive.
- Method.
- Timeline.
- All suspects' backgrounds.
- Alibis.
- Evidence.
- Interrogation responses.
- Contradictions.
- Canonical explanation.

Make sure every clue and dialogue is logically consistent.

The case must have one deterministic solution.

Do not reveal the solution in any client-facing case data.

## 8. PROJECT STRUCTURE

Use a modular structure:

src/
  app/
  components/
    ui/
    layout/
    evidence/
    suspects/
    investigation/
  features/
    auth/
    lobby/
    multiplayer/
    investigation/
    interrogations/
    evidence-board/
    verdict/
  game/
    engine/
    scenes/
    objects/
    interactions/
    camera/
  data/
    cases/
    schemas/
  hooks/
  lib/
  stores/
  types/
  utils/

supabase/
  migrations/
  functions/
  seed.sql

Keep components modular, typed, reusable, and easy to maintain.

## 9. PERFORMANCE

The game must run in modern desktop browsers.

Prioritize:
- Efficient Three.js rendering.
- Optimized 3D models.
- Texture compression where appropriate.
- Lazy loading of environments.
- Minimal unnecessary React renders.
- Efficient Realtime subscriptions.
- Responsive interface.
- Graceful loading states.

Provide a reasonable fallback when WebGL is unavailable.

Mobile support can initially be limited to viewing and basic interface interactions. Desktop is the primary target.

## 10. DEVELOPMENT APPROACH

Do not attempt to implement everything in one uncontrolled operation.

Work in phases.

### PHASE 1 — Foundation

- Inspect the existing project.
- Initialize Vite and React if needed.
- Configure TypeScript.
- Install dependencies.
- Configure Tailwind.
- Configure routing.
- Configure Zustand.
- Configure Supabase client.
- Create the folder structure.
- Create environment variable templates.
- Build the initial landing page.

### PHASE 2 — Multiplayer

- Authentication.
- Profiles.
- Room creation.
- Room joining.
- Player presence.
- Session synchronization.

### PHASE 3 — Investigation

- Case selection.
- Briefing.
- 3D detective office.
- 3D crime scene.
- Evidence collection.
- Evidence inventory.

### PHASE 4 — Deduction

- Suspect dossiers.
- Interrogation engine.
- Evidence board.
- Shared notes.
- Timeline.

### PHASE 5 — Resolution

- Final verdict.
- Secure solution validation.
- Case revelation.
- Scoring.

### PHASE 6 — Testing and deployment

- Two-browser multiplayer testing.
- Security testing.
- Reconnection testing.
- Performance testing.
- Production deployment.

## 11. FIRST EXECUTION TASK

For this first execution, focus on PHASE 1.

Do not build every feature immediately.

Your first deliverables must be:

1. Inspect the current workspace and existing project files.
2. Identify whether this is an empty project or an existing application.
3. Create or adapt the Vite + React + TypeScript application.
4. Install and configure the required dependencies.
5. Create the proposed project structure.
6. Configure Supabase environment variables.
7. Create the Supabase client and typed configuration.
8. Create the main application router.
9. Create the global design system and visual tokens.
10. Build a high-quality cinematic landing page.
11. Create a reusable application layout.
12. Create placeholder routes for the upcoming game screens.
13. Verify that the application builds successfully.

The landing page should already look like a premium detective game, not a developer prototype.

Use coherent temporary visual assets or CSS/Three.js compositions when actual assets are unavailable.

Do not invent Supabase credentials.

Create a `.env.example` file and clearly document the environment variables required.

Do not expose secrets in the repository.

## 12. CODE QUALITY AND COMMUNICATION

Before writing code:
- Inspect the existing project.
- Explain the implementation plan briefly.
- Identify any missing prerequisites.

During implementation:
- Work incrementally.
- Keep TypeScript strict.
- Avoid unnecessary abstractions.
- Avoid giant components.
- Avoid placeholder logic presented as functional.
- Do not silently skip errors.
- Keep dependencies minimal.
- Verify important changes.

After implementation:
- Run the production build.
- Fix TypeScript errors.
- Fix lint errors when configured.
- Report completed functionality.
- Report remaining work.
- Explain how to run the project.
- Explain which Supabase configuration steps I must perform manually.

Do not claim that multiplayer, database synchronization, or authentication works until it has actually been implemented and tested.

**Start by inspecting the workspace, then execute PHASE 1.**