# AI-Uni Runtime v1

This document describes the first playable runtime bridge between the inherited AI Town engine and the AI-Uni university-life, lifespan and consented-research layers.

## Current playable loop

```text
human player position
        ↓
normalized map zone
        ↓
stable WorldLocationId
        ↓
life-stage / first-week day / pack / safety filtering
        ↓
deterministic weighted scenario selection
        ↓
NPC role assignment
        ↓
assigned NPC approaches / talks in scene context
        ↓
human dialogue + scene progress
        ↓
auto-complete or manual complete / leave / change location
        ↓
day-end progression
        ↓
Day 7 completion gate → freshman_year
```

Map geometry, narrative state and research data remain separate by design.

## 1. Zones are map-agnostic

`convex/world/zones.ts` defines logical campus zones with normalized `0..1` bounds instead of hard-coded pixel coordinates. The current generic location IDs are:

```text
campus_gate
teaching_building
library
student_center
cafeteria
campus_green
sports_field
dormitory
```

The runtime can therefore keep the same semantic locations when `data/gentle.js` is replaced by the future `generic_campus_v1` map or by an optional university-specific template.

`enterScenarioLocation` is idempotent: remaining in the same zone does not continuously reroll events on movement ticks.

## 2. Scenario selection is reproducible

`convex/scenarios/controller.ts` filters candidates by:

- enabled content packs;
- playable location;
- life season, chapter, age and career stage;
- first-week day windows;
- developmental tasks and relationship types when required;
- separate sensitive-research consent;
- recent and completed scenario history.

Selection is weighted rather than uniform. Pure-life content receives the strongest default weight, ordinary behavioral-feature scenes receive less, and exploratory/sensitive research content is strongly de-emphasized. Repetition, research-heavy streaks and repeated use of one pack are also penalized when alternatives exist.

For the same `seed + selectionIndex + location + chapter state`, selection is deterministic. This makes debugging and later preregistered experimental conditions reproducible.

## 3. The first week is a real seven-day chapter

`convex/life/firstWeek.ts` defines seven fully playable days with different themes:

1. arrival and settling in;
2. first formal classes;
3. first collaboration;
4. clubs and exploration;
5. first interpersonal friction;
6. weekend activity;
7. reflection and transition.

`firstWeekDays` only constrains content while `chapterId === 'university_first_week'`. Reusable campus events return to the normal event pool after the player enters `freshman_year`.

`firstWeekProgress` stores gameplay progress separately from research data:

- completed playable days;
- completed scenario IDs;
- completed pure-life scenario IDs;
- distinct NPCs with whom the human actually sent a message.

Day 7 is gated by player-facing requirements:

```text
7 completed playable days
≥ 3 completed life events
≥ 4 distinct NPC interactions
≥ 1 pure ordinary-life event
```

These are chapter-completion rules, not psychological measurements. Research consent is not required to finish the chapter.

Existing first-week saves lazily infer already-finished day numbers from `chapterUnit`; they do not fabricate past events or NPC interactions.

## 4. NPC role assignment is narrative-only

When a scenario starts, `convex/scenarios/runtime.ts` assigns suitable NPCs to its declared roles. Lightweight role tags live in `data/npcProfiles.ts`, so roles such as `teacher`, `roommate`, `class_representative`, `teammate` or `club_member` prefer stable characters that plausibly fit them.

Assigned NPCs are prioritized when choosing whom to approach for conversation. The inherited AI Town nearest-candidate bug was also corrected so fallback proximity uses each candidate's real position rather than the current NPC's position.

`convex/scenarios/npcContext.ts` deliberately exposes only player-facing narrative context to the LLM:

- scene title;
- situational role;
- ordinary situation;
- ordinary player goal;
- safety/uncertainty instructions.

It does **not** expose `hiddenTargets`, questionnaire names, research-use flags, observable-feature keys or selector diagnostics. NPC-to-NPC background conversations remain autonomous.

## 5. Dialogue can advance life events

`convex/scenarios/progress.ts` tracks meaningful human replies to NPCs assigned to the active scene. Current gameplay thresholds are:

```text
pure ordinary-life scene: 1 human reply
ordinary task scene:       2 human replies
mild-stress scene:         3 human replies
sensitive scene:           never auto-complete
```

These thresholds are narrative pacing rules only. They do not calculate Big Five, CAPE, PCL-5 or any other psychological score.

Players may still manually mark an event complete when they consider the situation resolved. After completion, the runtime does not immediately spawn another event in the same zone; further movement/location change drives the next selection, avoiding task spam.

## 6. Pure life is first-class

The default campus pack contains ordinary scenes with no hidden construct target, including breakfast, library downtime, a campus walk, tidying the living space, casual exercise and meeting someone at the gate.

They are valid with:

```ts
researchUse: 'none'
hiddenTargets: []
observableFeatures: []
```

AI-Uni must remain a coherent life simulation when all research collection is disabled.

## 7. Gameplay persistence and research telemetry are separate

Gameplay tables such as `scenarioRuntimeStates`, `scenarioRuns`, `lifeProfiles`, `lifeEvents` and `firstWeekProgress` keep the minimum state required for the world and story to function.

Research telemetry is a separate opt-in path. The default scenario runtime is created with:

```text
behavioralResearchConsent = false
sensitiveResearchConsent = false
```

When behavioral research consent is off, ordinary gameplay continues and research telemetry is not written.

When an open research session and consent are both present, minimal telemetry may record:

- meaningful location transitions;
- scene enter/exit;
- day completion;
- human-to-NPC message direction, character count and participant ID;
- scenario completion metadata.

Raw dialogue text is **not copied into `telemetryEvents` by default**. Precise movement is not recorded frame-by-frame. Sensitive research additionally requires `sensitiveResearchConsent`.

## 8. Player-facing runtime UI

`src/hooks/useScenarioRuntime.ts` connects the human player's current world state to the life/scenario runtime.

`ScenarioStatusPanel` now displays only ordinary gameplay information:

- current campus location;
- current event setup and goal;
- current first-week day;
- first-week chapter progress;
- event completion/day-end controls;
- whether research recording is disabled.

It never displays hidden assessment constructs, clinical labels or internal scenario weights.

## 9. Runtime invariants under test

Jest tests protect core runtime boundaries, including:

- first-week events stay on their configured days;
- first-week day restrictions do not permanently lock reusable content afterward;
- sensitive scenarios remain blocked without separate consent;
- pure-life scenes retain stronger default selection weight than research scenes;
- dialogue auto-completion thresholds remain 1 / 2 / 3 / disabled for the four safety/pacing classes.

CI runs the unit test suite before TypeScript and the production Vite build.

## 10. Next implementation milestone

The next major playable milestone is no longer the scenario controller. It is the world itself:

```text
purpose-built generic_campus_v1 pixel map
        ↓
exact zone layout for the new map
        ↓
map-object interactions / richer local activities
        ↓
city/off-campus expansion
```

Specific real-university maps remain optional templates layered over the generic runtime contract. Researcher dashboard/export, calibrated behavioral models, questionnaire delivery and production consent UI remain separate later layers.
