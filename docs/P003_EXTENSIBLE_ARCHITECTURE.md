# P003 Extensible Lifespan Architecture

> Core rule: P003 is not a finite branching script. It is a continuously extensible life-simulation engine whose content can grow without rewriting the core.

## 1. Product invariant

P003 should remain expandable across:
- life stages and historical cohorts;
- regions and opportunity structures;
- family forms and recurring relationships;
- education, work, intimacy, health, money and community routes;
- text, Galgame and later pixel-world presentation modes;
- player-facing reflection and research-only behavioral evidence.

The content architecture therefore uses **Storylets + Content Packs**, not one giant branching tree.

## 2. MECE content ontology

Every Storylet is classified on independent axes. These axes answer different questions and must not be collapsed into one taxonomy.

### Axis A — Life stage: when?

P003 uses non-overlapping age bands for coverage auditing:
1. origin (0–1)
2. early childhood (2–5)
3. middle childhood (6–11)
4. adolescence (12–17)
5. emerging adulthood (18–24)
6. early adulthood (25–39)
7. middle adulthood (40–59)
8. later adulthood (60–74)
9. late life (75–100)

Game chapters may overlap for dramatic pacing, but the coverage ontology does not.

### Axis B — Life domain: what part of life?

Exactly one primary domain:
1. body & health
2. self & identity
3. family & kinship
4. friendship & social network
5. intimacy
6. education & learning
7. work & career
8. money, housing & material life
9. community, institutions & society
10. meaning, creation & contribution

A Storylet can have cross-domain effects, but those are tags. They do not create competing primary classifications.

### Axis C — Actor: with whom?

Actors are persistent people, not disposable prompt props:
- caregiver / parent / grandparent / sibling;
- peer / friend / close friend;
- romantic partner / spouse / child;
- teacher / mentor;
- coworker / manager;
- community ties.

### Axis D — Structural context: under what conditions?

Context is modeled separately from personality:
- household material security;
- caregiving stability;
- learning access;
- neighborhood opportunity;
- institutions and services;
- historical cohort and calendar period;
- accumulated role constraints and opportunities.

### Axis E — Narrative function: why is this scene here?

Each Storylet has one primary dramatic function:
- establish world;
- reveal character;
- test value;
- relationship move;
- opportunity;
- pressure;
- reversal;
- loss;
- commitment;
- repair;
- payoff;
- reflection.

Narrative techniques such as callback, foreshadowing, escalation and delayed consequence are separate tags.

### Axis F — Psychology: what evidence may this generate?

Psychological interpretation is downstream of gameplay. It never defines whether an event is allowed to happen.

### Axis G — Consequence: what changes?

A choice may modify:
- immediate situation meters;
- persistent relationship state;
- world/history flags;
- delayed hooks;
- memories and callback keys;
- future Storylet eligibility;
- research evidence.

## 3. Storylet model

A Storylet is an independent narrative unit with:

```text
id
packId
version
active
title / setup / visibleQuestion
primaryDomain
lifeStageBands
narrativeFunction
techniques
prerequisites
castSlots
choices
  immediate effects
  history flags
  delayed hooks
  analysis signal ids
designNote
```

The scheduler selects eligible Storylets using age, season, history, origin context, relationship availability and prior play history. It prefers novel domains and unplayed material rather than forcing a single tree.

This makes expansion additive:
- add a profession pack;
- add a sibling pack;
- add a 1990s China cohort pack;
- add an LGBTQ+ relationship pack;
- add caregiving or retirement content;
without changing the core scheduler.

Duplicate Storylet ids are rejected.

## 4. Content-pack contract

A content pack is versioned and independently registerable.

Examples:

```text
p003-core-foundation
china-school-2000s
china-housing-2010s
health-chronic-condition
career-academia
career-service-work
family-siblings
intimacy-long-distance
later-life-widowhood
```

A new pack should add missing coverage before adding more material to already-dense cells.

## 5. Coverage matrix

P003 audits content using:

**life stage × life domain**

Every matrix cell tracks:
- Storylet count;
- callback/delayed-consequence count;
- narrative-function diversity;
- psychological-construct coverage.

This prevents accidental content bias such as:
- adulthood becoming only career + marriage;
- old age becoming only illness + retirement;
- adolescence becoming only exams;
- childhood becoming only family;
- friendship disappearing after university.

The coverage matrix is allowed to contain empty cells during development. Empty cells are explicit backlog, not hidden gaps.

## 6. Character model

Recurring characters use dramatic-writing dimensions rather than one-word archetypes:

- social role;
- visible Want;
- underlying Need;
- Fear / Avoidance;
- values;
- contradictions;
- resources;
- constraints;
- private facts;
- open arc threads;
- shared history with the player.

Example contradiction:

```text
A parent deeply values care
AND
under pressure tries to make decisions for the child.
```

This is more reusable than labeling the NPC “controlling”.

NPCs have their own life course. Parents age, friends move, partners change work, siblings form families, coworkers leave organizations. This operationalizes **linked lives** rather than treating NPCs as static test stimuli.

## 7. Relationship memory

Each recurring relationship stores:
- trust;
- closeness;
- reciprocity;
- reliability;
- conflict repair;
- comfort with dependence;
- fear of rejection;
- reassurance seeking;
- withdrawal;
- boundary clarity;
- concrete shared memories;
- unresolved issues;
- callback keys.

Attachment-like evidence is relationship-specific. P003 must not assign one permanent global attachment label from a few scenes.

## 8. ai-uni psychology absorption

P003 now imports the complete construct registry from `convex/assessment/constructs.ts` into an explicit policy layer.

### Player-facing profile
- Big Five behavioral tendencies.

### Player-facing reflection
- rejection sensitivity;
- trust;
- support seeking;
- coping;
- emotion regulation / reappraisal / suppression;
- relationship-specific attachment evidence;
- risk taking;
- delay discounting.

### Research-only
- CAPE-P15-associated exploratory signals;
- PCL-5-associated exploratory signals.

Research-only constructs:
- are not player-visible;
- are not converted into clinical scores;
- require repeated evidence across contexts;
- require independent criterion measures under an explicit study design.

P003 therefore **absorbs** these constructs without turning the game into a covert diagnostic instrument.

## 9. Trait × Situation × Life Stage

The first Text Edition report used weighted sums. P003 now adds a second layer that asks:

- Does a pattern repeat across different life domains?
- Does it repeat across different life stages?
- Is the direction consistent?
- Does it become stronger, weaker or remain similar after adulthood?

Outputs distinguish:
- cross-context pattern;
- context-sensitive response;
- emerging pattern;
- insufficient evidence.

This is intentionally more conservative than “choice X means trait Y”.

## 10. Developmental and narrative foundations

The architecture is informed by several different traditions, each used only for the problem it is good at:

### Lifespan / personality science
- Erikson-inspired developmental themes — chapter prompts, never maturity scores.
- Life-course theory — timing, linked lives, turning points, path dependence and cumulative opportunity.
- Bronfenbrenner — structural/ecological context.
- Attachment — relationship-specific trust/proximity/repair.
- Self-determination theory — autonomy, competence and relatedness.
- Social convoy — changing support networks.
- Socioemotional selectivity — later-life goal reprioritization.
- Selection–Optimization–Compensation — adaptation to changing resources.
- Narrative identity — callbacks, autobiographical coherence and life review.
- Person × Situation research — separate stable tendency from situational expression.
- Life-event/personality-change research — life transitions may matter, but average effects are often modest and heterogeneous.

### Dramatic writing / character design
Used as craft tools, not psychometrics:
- Goal → Obstacle → Choice → Consequence;
- Want / Need / Fear / Contradiction;
- setup / escalation / reversal / payoff;
- open loops and delayed callbacks;
- character arcs that can resolve, fail, reopen or change direction.

### Interactive narrative
P003 follows Storylet / quality-based narrative principles: small conditional narrative units selected by world state are more extensible than a combinatorial branch tree.

## 11. Presentation separation

The life engine must remain independent from presentation.

```text
life engine
  ├─ ontology
  ├─ storylets
  ├─ characters
  ├─ relationships
  ├─ scheduler
  ├─ psychology evidence
  ├─ coverage audit
  └─ report
       ↓
presentation
  ├─ Text Edition
  ├─ Galgame Edition
  └─ Pixel World
```

Galgame and Pixel modes should render the same Storylets and state rather than fork the life logic.

## 12. Source anchors

Research anchors used to constrain design:
- McAdams, D. P. (2001). *The Psychology of Life Stories*. Review of General Psychology. DOI: 10.1037/1089-2680.5.2.100.
- Sherman, R. A., Rauthmann, J. F., Brown, N. A., Serfass, D. G., & Jones, A. B. (2015). *The independent effects of personality and situations on real-time expressions of behavior and emotion*. Journal of Personality and Social Psychology. DOI: 10.1037/pspp0000036.
- Bühler, J. L., Orth, U., Bleidorn, W., et al. (2023). *Life Events and Personality Change: A Systematic Review and Meta-Analysis*. European Journal of Personality. DOI: 10.1177/08902070231190219.
- Existing ai-uni theory catalog in `convex/life/theories.ts`.
- Emily Short, “Storylets: You Want Them” (interactive narrative design).
- Failbetter Games production writing on quality-based narrative and parsimony.

## 13. Non-negotiable boundaries

1. No final “successful life” score.
2. No single choice becomes a personality label.
3. Structural disadvantage is never rewritten as personality weakness.
4. Childhood shifts probabilities; it does not determine adulthood.
5. Relationship patterns remain relationship-specific where appropriate.
6. Clinical/research-only constructs never become automatic diagnoses.
7. New content should be additive and versioned.
8. Every major choice should leave history that can matter later.
9. NPCs should have lives independent of the player.
10. The world should remember the player.

## 14. AI-persona interoperability

P003 is designed to interoperate with the separate **AI-persona** project without copying its implementation.

### Current AI-persona strengths

The current repository already contains:
- ICD-11 + DSM-5-TR diagnosis ontology;
- diagnosis-aware demographic stratification;
- occupation taxonomy;
- OCEAN/personality generation;
- archetype grids;
- social/values/communication/lifestyle/skills dimensions;
- life-event generation;
- narrative motives and character-arc fields.

These are useful **persona-generation priors** for P003 NPCs.

### Important architectural boundary

AI-persona currently uses a diagnosis-driven generation chain. P003 must not inherit “diagnosis = identity”.

For cross-project use:

```text
AI-persona
  generates a Persona Kernel
        ↓
P003
  instantiates a persistent character
        ↓
runtime life events / relationships / memories / change
```

A condition is one optional health layer of the kernel. It must never replace:
- personality;
- values;
- occupation;
- social role;
- relationship history;
- life-stage context;
- structural opportunity;
- narrative goals.

### Persona Kernel vs Runtime State

**Persona Kernel** is relatively stable source material:
- demographic baseline;
- birth cohort / era;
- gender;
- education;
- occupation / social position;
- OCEAN and personality tags;
- values;
- communication/lifestyle/skills;
- core desire/fear;
- formative wound / desire / need;
- optional health layer;
- prior life-event seeds.

**P003 Runtime State** evolves inside the simulation:
- current resources;
- current relationships;
- accumulated memories;
- trust / closeness / repair;
- new Storylet eligibility;
- delayed consequences;
- current stress / support;
- later life changes;
- player-specific shared history.

P003 must never silently overwrite the imported kernel. New runtime evidence is additive and separately traceable.

### Taxonomy mismatch is explicit

AI-persona currently has a coarser **6-domain × 4-stage** event taxonomy. P003 uses **10 domains × 9 lifespan bands**.

Therefore import mapping is deliberately treated as lossy legacy compatibility:
- family → family & kinship
- education → education & learning
- occupation → work & career
- health → body & health
- finance → material life
- interpersonal → friendship/social by default

Future AI-persona should ideally export the richer shared ontology directly rather than requiring these mappings.

### Shared-schema direction

The long-term shared asset should be a language-neutral, versioned human-persona schema rather than direct Python↔TypeScript imports.

Recommended future shape:

```text
Human Persona Ontology
├── demographic / cohort
├── development stage
├── era / macro context
├── gender / identity
├── occupation / social position
├── personality / temperament
├── values / communication / lifestyle / skills
├── family / relationship structure
├── physical & mental health layer
├── life-event history
├── current state
└── narrative / archetype metadata
```

P003 can consume this schema for NPC generation while preserving its own dynamic simulation engine.

## 15. What P003 learns from AI-persona

P003 deliberately reuses the strongest **engineering ideas** from the separate AI-persona project while changing their interpretation for a lifespan game.

### Adopted now

1. **Finite archetype grid before surface randomness**
   - AI-persona showed that random OCEAN/tags/events can create many superficial combinations while deep motives remain repetitive.
   - P003 now has a finite, auditable non-clinical narrative-archetype grid.
   - Each recurring NPC receives a narrative kernel:
     - formative pressure;
     - compensatory strategy;
     - developmental need;
     - core desire;
     - core fear;
     - arc type;
     - unresolved arc question.
   - Surface details may vary, but deep character identity remains inspectable.

2. **Wound → strategy → need → arc as a writing chain**
   - P003 adapts AI-persona's Storr/character-arc chain.
   - The wording is intentionally softened to **formative pressure → compensatory strategy → developmental need**.
   - It is a narrative hypothesis used to generate callbacks and change arcs, not a clinical explanation of a real person.

3. **Event shape beyond positive/negative valence**
   - P003 Storylets now carry pressure/affordance shapes:
     loss, danger, humiliation, entrapment, role overload, uncertainty, conflict, belonging, opportunity, achievement, transition, caregiving and neutral.
   - Coverage audits now inspect these shapes so a content library cannot become emotionally one-note.

4. **Cross-constraint auditing**
   - Inspired by AI-persona's cross-constraint module.
   - P003 validates age × role × domain × narrative function × psychological signal × research boundary.
   - Rare lives remain possible; soft warnings request author justification rather than deleting uncommon trajectories.

5. **Versioned population priors**
   - Birth-context sampling weights were removed from `origin.ts` and placed in a versioned prior set.
   - Every prior set must declare provenance and whether it claims population representativeness.
   - The current default explicitly does **not** claim to describe a real population.

6. **Seed reproducibility**
   - AI-persona and P003 now share the same philosophy: generated people/lives should be reproducible from stable seeds wherever possible.

7. **Deep kernel vs surface expression**
   - P003 keeps a character's deep narrative kernel separate from communication/disclosure/conflict/planning/social-energy style.
   - External OCEAN and communication/lifestyle fields map into the surface layer rather than replacing the deep archetype.
   - Native P003 NPCs also get deterministic surface-expression profiles so two characters with related motives need not feel identical in dialogue.

8. **Structured private narrative**
   - AI-persona triggers, safety behaviors and hidden experiences are adapted into sensitivities, self-protective patterns and hidden-history records.
   - Hidden history has explicit private/hinted/revealed state and reveal keys; it is not dumped into the first scene.
   - Native P003 characters get the same structure, which enables trust-based reveals and decades-later callbacks.

9. **Event impact without clinical scoring**
   - P003 borrows the idea that life events need more than a positive/negative label.
   - Pressure shapes are translated into disruption, uncontrollability, social exposure, duration, resource cost and reversibility.
   - These values drive narrative/world consequences only. They are not LCU totals, ACE scores or disorder-risk estimates.
   - Run-plan sampling balances both life-domain diversity and pressure-shape diversity.

### Deliberately not copied into player-facing P003 logic

- diagnosis-first identity generation;
- diagnosis → gender/education/occupation deterministic implications;
- automatic clinical-risk inference from Storylet choices;
- ACE dose-response or LCU totals as a player personality/health score;
- OCEAN overwriting a deeper narrative archetype;
- “mental disorder” as the primary description of an NPC.

These may be useful in a separate research/clinical simulation layer, but they are not appropriate defaults for the life-game experience.

### Future interoperation

The adapter in `p003PersonaInterop.ts` already maps:
- AI-persona demographics / occupation / OCEAN / values;
- archetype key/name/one-liner;
- formative wound / compensatory desire / need;
- character arc;
- health layer;
- prior life events;
- loss/danger/humiliation/entrapment event types;

into:
- a versioned P003 Persona Kernel;
- a persistent P003 Character Blueprint;
- the same P003 narrative-kernel format used by native NPCs;
- P003 pressure-shape tags.

The long-term target is a shared language-neutral schema rather than direct imports between the Python and TypeScript repositories.
