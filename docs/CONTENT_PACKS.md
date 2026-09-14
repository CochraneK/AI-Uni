# AI-Uni Content Pack / Assessment Extension Guide

AI-Uni is intentionally split into four layers so the world can grow without turning every feature into a hard-coded psychological test.

```text
World locations
    ↓
Content packs / scenarios
    ↓
Behavior telemetry + derived features
    ↓
Construct registry + independent assessment measures
```

## 1. Content packs

Current packs:

- `campus-life`: ordinary university life; enabled by default.
- `social-friction`: annoying people, broken promises, unfair group work, exclusion, boundaries; enabled by default.
- `city-life`: dinner, KTV, transit, internship and other off-campus content; registered now, map support planned.
- `sensitive-research`: CAPE/PCL-associated research scenarios; opt-in only and disabled by default.

A scenario should still make sense if the research metadata is removed. `ordinaryGoal` and `setup` describe the player's life task; `hiddenTargets` describe the research layer.

### Add a new scenario

Add it to an existing pack or create a new pack under `convex/content/packs/`:

```ts
{
  id: 'movie_plan_change_01',
  title: '电影临时换场次',
  packId: 'city-life',
  location: 'shopping_area',
  ordinaryGoal: '和朋友看完一场电影。',
  setup: '原定场次临时取消，大家需要重新决定。',
  npcRoles: ['friend'],
  hiddenTargets: ['coping.problem_focused'],
  safetyLevel: 'ordinary',
  researchUse: 'behavioral_feature',
  observableFeatures: ['checks_options', 'proposes_plan', 'decision_latency'],
  tags: ['leisure', 'plan-change'],
  enabledByDefault: false,
}
```

Do not add scoring rules such as `choice A = +2 anxiety` inside the scenario.

## 2. Locations

Campus locations remain in `convex/campus/config.ts`.

`convex/world/locations.ts` aggregates those locations with off-campus locations. New maps can be introduced later without changing the scenario model.

A location has a `mapStatus`:

- `playable`: currently present in the game world.
- `planned`: content may be authored now, but should not enter the default runtime pool until the map/transition exists.

## 3. Construct Registry

`convex/assessment/constructs.ts` owns the semantic research targets.

Current namespaces include:

```text
big5.*
cape.*
pcl5_associated.*
social.*
coping.*
emotion.*
attachment.*
decision.*
```

A construct is not automatically a questionnaire score. It is a research concept that game-derived features may be associated with.

To add a new construct:

1. Add a typed `ConstructId`.
2. Add its definition to `constructRegistry`.
3. State its interpretation level and calibration requirement.
4. Only then reference it from scenarios.

## 4. Assessment Measure Registry

`convex/assessment/measures.ts` is separate from the construct registry.

This is deliberate:

- one questionnaire can measure several constructs;
- one construct can be calibrated against several instruments;
- item wording, licensing, language validation and scoring belong to the measure implementation, not the game scenario.

To add another questionnaire/test:

1. Register the measure and the constructs it covers.
2. Document authorization/licensing and target-language validation.
3. Implement questionnaire delivery separately from game scenes.
4. Save results through `calibrationMeasures` using a stable instrument id + version.
5. Predefine how game features will be compared with the independent measure.

The database uses `instrument: string`, so adding another instrument no longer requires changing the Convex schema.

## 5. Safety / validation rules

`convex/content/validation.ts` checks key invariants:

- no duplicate pack or scenario IDs;
- scenarios only reference registered locations;
- scenarios only reference registered constructs;
- `sensitive` scenarios cannot be enabled by default;
- CAPE/PCL-associated scenarios must remain `exploratory_only`;
- scenarios should define observable behavioral features.

Sensitive research content should additionally have study-specific ethics approval, consent, opt-out and risk/referral procedures before activation.

## 6. Desired long-term shape

The world should stay mostly ordinary life. A useful operating target is roughly:

- 60–70% ordinary life / fun / exploration;
- 20–30% naturally informative situations;
- 5–10% explicit calibration tasks or questionnaires.

This keeps AI-Uni usable as a campus-life world instead of turning every interaction into an obvious test.

## Upstream

AI-Uni is built on the open-source a16z **AI Town** engine. `AI Town` remains the upstream project name when referenced in attribution, upstream links, and inherited engine/module paths.
