# AI-Uni Runtime v1

This document describes the first playable runtime bridge between the inherited AI Town world and the AI-Uni university/lifespan layers.

## Runtime loop

```text
human player position
        ↓
normalized map zone
        ↓
stable WorldLocationId
        ↓
life-stage + pack + safety filtering
        ↓
deterministic weighted scenario selection
        ↓
active life event
        ↓
complete / leave / change location
        ↓
recent-history cooldown + next event
```

The first implementation deliberately keeps map geometry, scenario meaning and psychological research metadata separate.

## 1. Zones are map-agnostic

`convex/world/zones.ts` defines map zones using normalized `0..1` bounds instead of hard-coded pixels. The same logical location IDs therefore survive map-resolution changes.

Current generic locations:

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

A future university template may provide a more precise zone layout for its map while keeping these stable semantic IDs. Player-facing names can still be overridden by `UniversityProfile.locationDisplayNames`.

## 2. Location changes are idempotent

`enterScenarioLocation` treats remaining inside the same zone as a no-op. The client may observe player position frequently, but scenario selection only happens when the resolved location changes.

This is important because movement updates happen much more frequently than meaningful life events.

## 3. Scenario selection

`convex/scenarios/controller.ts` filters candidates by:

- enabled content packs;
- current playable location;
- current life season / chapter / age / career stage;
- active developmental tasks and relationship types when required;
- sensitive-research opt-in;
- scenario completion/history rules.

Selection is weighted rather than uniform:

- pure-life (`researchUse: 'none'`) content receives the strongest default weight;
- ordinary behavioral-feature scenes receive a lower weight;
- exploratory/sensitive research content is strongly de-emphasized and separately gated;
- recently repeated scenarios are penalized;
- repeated research-heavy sequences are penalized;
- repeated use of the same content pack is mildly penalized when alternatives exist.

Selection is deterministic for the same `seed + selectionIndex + location + chapter state`, making test sessions and experimental conditions reproducible.

## 4. Pure life is first-class

The default campus pack now contains ordinary scenes with no hidden construct target, including:

- breakfast;
- browsing / resting in the library;
- walking around campus;
- tidying the dorm room;
- casual exercise;
- meeting somebody at the campus gate.

These scenes are intentionally valid with:

```ts
researchUse: 'none'
hiddenTargets: []
observableFeatures: []
```

AI-Uni should remain a life simulation even when all research collection is disabled.

## 5. Runtime persistence

`scenarioRuntimeStates` stores compact gameplay state:

- active location and active scenario;
- enabled content packs;
- seed and selection counter;
- recent scenario IDs;
- bounded completed-scenario history;
- behavioral-research consent state;
- sensitive-research consent state.

`scenarioRuns` stores event lifecycle metadata such as scenario ID, location, start/end timestamps, outcome, selection index and selection diagnostics.

This is gameplay state. It is deliberately separate from fine-grained research telemetry.

## 6. Consent boundary

The default runtime is created with:

```text
behavioralResearchConsent = false
sensitiveResearchConsent = false
```

Ordinary gameplay can continue in this mode. The game may still maintain the minimum state required to know what happened in the story, but research telemetry must not be enabled simply because a scene has research metadata.

Sensitive-research consent cannot be enabled without behavioral-research consent.

## 7. Client bridge

`src/hooks/useScenarioRuntime.ts` connects the current human player to the life/scenario runtime:

1. create/load the player's long-term life profile;
2. create/load scenario runtime state;
3. resolve player coordinates through the active university map profile;
4. synchronize only actual zone transitions;
5. expose the active ordinary-life scenario to the UI.

`ScenarioStatusPanel` shows only player-facing life information:

- current location;
- event title;
- setup;
- ordinary goal;
- a prototype completion action.

It must never expose `hiddenTargets`, clinical constructs or internal selection weights to the player.

## 8. Next runtime integrations

The next vertical-slice work should build on this runtime rather than bypassing it:

```text
scenario enter/exit
    ↓
NPC role assignment
    ↓
controlled LLM context
    ↓
dialogue / decision interaction
    ↓
consented telemetry hooks
    ↓
day-end progression
    ↓
7-day Chapter 1 completion
```

After that, replace the inherited starter map with a purpose-built `generic_campus_v1` pixel map. Specific university maps remain optional templates layered over the same runtime contracts.
