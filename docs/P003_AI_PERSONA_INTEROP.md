# AI-persona ↔ P003 Interoperability

This document defines the intended bridge between the separate AI-persona generator and P003 lifespan simulator.

## Responsibility split

### AI-persona owns
- persona-generation priors;
- demographic / occupation / health / personality source data;
- archetype generation;
- initial life-history seeds;
- source provenance.

### P003 owns
- runtime Storylet selection;
- persistent relationship history;
- memories and callbacks;
- changing resources and roles;
- NPC aging;
- delayed consequences;
- life-stage transitions;
- player-specific shared history;
- game-derived reflection/reporting.

Neither project should directly import the other's implementation.

## Wire format

Use:

`schemas/persona-kernel.v1.schema.json`

The wire object is immutable source material once a P003 run begins. P003 may derive runtime state from it, but must not silently rewrite the source kernel.

## AI-persona v1.2 mapping

| AI-persona | persona-kernel.v1 | P003 |
|---|---|---|
| id | sourcePersonaId | persistent character id namespace |
| archetype_key/name/one_liner | archetype | narrative kernel |
| ocean | psychology.ocean | surface-expression layer |
| personality_tags | psychology.personalityTags | surface description |
| cognitive_styles | psychology.cognitiveStyles | optional behavior prior |
| coping_styles | psychology.copingStyles | optional response prior |
| values_beliefs | psychology.values | values |
| communication_style | psychology.communicationStyle | surface-expression layer |
| lifestyle_habits | psychology.lifestyleHabits | routine/context |
| skills_abilities | psychology.skillsAbilities | character resources |
| core_desire / core_fear | psychology | narrative kernel |
| formative_wound | psychology.formativeWound | formative pressure |
| compensatory_desire | psychology.compensatoryDesire | compensatory strategy |
| storr_need | psychology.innerNeed | developmental need |
| arc_type / arc_description | psychology | character arc |
| triggers | privateNarrative.sensitivities | private runtime sensitivity |
| safety_behaviors | privateNarrative.selfProtectivePatterns | private self-protection |
| hidden_experiences | privateNarrative.hiddenExperiences | revealable hidden history |
| diagnosis / comorbidity | health | private/research-aware health layer |
| life_events | priorLifeEvents | history seeds, never destiny |

## Event taxonomy mapping

AI-persona's current 6-domain × 4-stage matrix is coarser than P003's 10-domain × 9-stage ontology.

The adapter therefore performs a deliberately lossy compatibility mapping. Future AI-persona versions should preferably emit shared ontology ids directly.

AI-persona stress event types map as follows:
- loss → loss
- danger → danger
- humiliation → humiliation
- entrapment → entrapment
- positive → opportunity
- neutral → neutral

P003 then adds its own shapes such as role overload, uncertainty, conflict, belonging, achievement, transition and caregiving.

## Versioning rules

1. Never change the meaning of an existing field within `persona-kernel.v1`.
2. Additive optional fields are allowed.
3. Breaking semantic changes require `persona-kernel.v2`.
4. Preserve `sourceSystem`, `sourcePersonaId` and `sourceVersion`.
5. Imported health/diagnosis information remains private unless an explicit product/research rule makes it narratively relevant.
6. P003 runtime changes are stored outside the imported kernel.

## Why this split matters

The same source persona can be reused in:
- P003 Text Edition;
- Galgame presentation;
- Pixel World / AI Town;
- P004 dialogue benchmarks;
- controlled research simulations.

At the same time, two runs using the same kernel can accumulate different relationships, memories and life histories because P003 owns runtime change.
