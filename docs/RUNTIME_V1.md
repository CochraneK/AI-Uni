# AI-Uni Runtime v1

This document describes the first playable runtime bridge between the inherited AI Town engine and the AI-Uni university-life, lifespan and consented-research layers.

## Current playable loop

```text
human player position
        ↓
generic_campus_v1 + normalized semantic zone
        ↓
stable WorldLocationId
        ↓
life-stage / first-week day / pack / safety filtering
        ↓
deterministic weighted scenario selection
        ↓
NPC role assignment + scene-grounded dialogue
        ↓
scene completion OR free local activity when no scene is active
        ↓
day-end progression
        ↓
Day 7 completion gate → freshman_year
```

Map geometry, narrative state and research data remain separate by design.

## 1. The generic campus map is playable

`data/genericCampus.ts` now defines the default **`generic_campus_v1`** world as an original 48×36 pixel campus. Its lightweight original tileset lives at:

```text
/ai-uni/assets/generic-campus-v1.png
```

The map contains walkable/collidable representations of the eight core university locations:

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

`data/genericCampus.test.ts` verifies map dimensions, tile indexes, semantic-zone anchors, walkability and path connectivity from each zone to the campus gate.

`data/gentle.js` remains only as an inherited/legacy map asset. New worlds seed `generic_campus_v1`. Existing development worlds that still contain the legacy map are detected rather than silently remapped; reseeding is the safe migration path when needed.

## 2. Zones are semantic and map-aware

`convex/world/zones.ts` maps player coordinates to stable `WorldLocationId` values. The runtime therefore talks about “library”, “cafeteria” or “dormitory” rather than coupling scenarios to individual tile IDs.

A university-specific template may later provide a different map or player-facing building names while keeping the same semantic location contract.

`enterScenarioLocation` is idempotent: remaining inside the same zone does not continuously reroll events on movement ticks.

## 3. Scenario selection is reproducible

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

## 4. The first week is a real seven-day chapter

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
- completed core scenario IDs;
- completed pure-life scenario IDs;
- completed ordinary campus activities;
- distinct NPCs with whom the human actually sent a message.

Day 7 is gated by player-facing requirements:

```text
7 completed playable days
≥ 3 completed core life events
≥ 4 distinct NPC interactions
≥ 1 ordinary-life experience
```

The ordinary-life requirement can be satisfied by either a pure-life scene or a free campus activity. **Free activities do not count toward the three core life events.** These are chapter-completion rules, not psychological measurements, and research consent is not required to finish the chapter.

Existing first-week saves lazily infer already-finished day numbers from `chapterUnit`; they do not fabricate past events, activities or NPC interactions.

## 5. NPC role assignment is narrative-only

When a scenario starts, `convex/scenarios/runtime.ts` assigns suitable NPCs to its declared roles. Lightweight role tags live in `data/npcProfiles.ts`, so roles such as `teacher`, `roommate`, `class_representative`, `teammate` or `club_member` prefer stable characters that plausibly fit them.

Assigned NPCs are prioritized when choosing whom to approach for conversation. The inherited AI Town nearest-candidate bug was also corrected so fallback proximity uses each candidate's real position rather than the current NPC's position.

`convex/scenarios/npcContext.ts` deliberately exposes only player-facing narrative context to the LLM:

- scene title;
- situational role;
- ordinary situation;
- ordinary player goal;
- safety/uncertainty instructions.

It does **not** expose `hiddenTargets`, questionnaire names, research-use flags, observable-feature keys or selector diagnostics. NPC-to-NPC background conversations remain autonomous.

## 6. Dialogue can advance life events

`convex/scenarios/progress.ts` tracks meaningful human replies to NPCs assigned to the active scene. Current gameplay thresholds are:

```text
pure ordinary-life scene: 1 human reply
ordinary task scene:       2 human replies
mild-stress scene:         3 human replies
sensitive scene:           never auto-complete
```

These thresholds are narrative pacing rules only. They do not calculate Big Five, CAPE, PCL-5 or any other psychological score.

Players may still manually mark an event complete when they consider the situation resolved. After completion, the runtime does not immediately spawn another event in the same zone; further movement/location change drives the next selection, avoiding task spam.

## 7. Free campus activities make locations useful between scenes

`convex/life/activities.ts` defines 16 ordinary activities, two for every playable campus location. Examples include:

- eating or getting a drink in the cafeteria;
- quiet study or browsing shelves in the library;
- checking activity posters in the student center;
- walking or sitting outside in the campus green;
- running or watching a game at the sports field;
- tidying or resting in the dormitory.

The player-facing sidebar exposes these activities only when no scenario is active. Runtime rules are deliberately simple:

```text
same activity: at most once per game day
free activities: at most 3 distinct activities per game day
active scenario: must be resolved before starting a free activity
activity location: must match the player's current semantic zone
```

A completed activity writes an ordinary `lifeEvents` history record. During the first week it can satisfy the ordinary-life experience gate, but it **never increments the core-scenario count** and it never changes a personality, CAPE or PCL score.

## 8. Pure life is first-class

The default campus pack also contains ordinary scenarios with no hidden construct target, including breakfast, library downtime, a campus walk, tidying the living space, casual exercise and meeting someone at the gate.

They are valid with:

```ts
researchUse: 'none'
hiddenTargets: []
observableFeatures: []
```

Together with free campus activities, this ensures AI-Uni remains a coherent life simulation when all research collection is disabled.

## 9. Gameplay persistence and research telemetry are separate

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
- free campus activity ID/location/duration metadata;
- human-to-NPC message direction, character count and participant ID;
- scenario completion metadata.

Raw dialogue text is **not copied into `telemetryEvents` by default**. Precise movement is not recorded frame-by-frame. Sensitive research additionally requires `sensitiveResearchConsent`.

## 10. Player-facing runtime UI

`src/hooks/useScenarioRuntime.ts` connects the human player's current world state to the life/scenario runtime.

`ScenarioStatusPanel` displays only ordinary gameplay information:

- current campus location;
- current event setup and goal;
- current first-week day;
- first-week chapter progress;
- local free activities and per-day activity count;
- event completion/day-end controls;
- whether research recording is disabled.

It never displays hidden assessment constructs, clinical labels or internal scenario weights.

## 11. Runtime invariants under test

Jest tests protect core runtime boundaries, including:

- first-week events stay on their configured days;
- first-week day restrictions do not permanently lock reusable content afterward;
- sensitive scenarios remain blocked without separate consent;
- pure-life scenes retain stronger default selection weight than research scenes;
- dialogue auto-completion thresholds remain 1 / 2 / 3 / disabled for the four safety/pacing classes;
- every generic campus zone remains walkable and connected;
- every playable campus location exposes ordinary activities;
- activities remain ordinary-life experiences and cannot substitute for core scenario completion.

CI runs the unit test suite before TypeScript and the production Vite build.

## 12. Next implementation milestone

The generic campus, semantic zones, scenario runtime and free daily activities are now present. The next playable layer is:

```text
visible map interaction hints / object hotspots
        ↓
richer object-specific campus interactions
        ↓
off-campus / city travel spaces
        ↓
longer-term university and life-course content
```

Specific real-university maps remain optional templates layered over the generic runtime contract. Researcher dashboard/export, calibrated behavioral models, questionnaire delivery and production consent UI remain separate later layers.
