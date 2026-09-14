# AI-Uni Content Pack / Assessment Extension Guide

AI-Uni intentionally separates world simulation, lifespan state, content, telemetry and assessment so the project can grow without turning every feature into a hard-coded psychological test.

```text
World locations + life-course state
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
- `life-course`: graduation, internship, work, long-term relationships, family caregiving, retirement and life review; planned and life-stage gated.
- `sensitive-research`: CAPE/PCL-associated research scenarios; opt-in only and disabled by default.

A scenario should still make sense if the research metadata is removed. `ordinaryGoal` and `setup` describe the player's life task; `hiddenTargets` describe the research layer.

### Pure-life content

Not every scene should collect a psychological signal. Use:

```ts
researchUse: 'none',
hiddenTargets: [],
observableFeatures: [],
```

for ordinary narrative/world-building scenes. Validation rejects a `researchUse: 'none'` scene if hidden assessment targets are still attached.

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
  lifeContext: {
    seasons: ['university', 'early_career'],
    minimumAge: 18,
  },
}
```

Do not add scoring rules such as `choice A = +2 anxiety` inside the scenario.

## 2. Life-context gating

`ScenarioDefinition.lifeContext` can restrict a scene by:

- `seasons`
- `chapterIds`
- `careerStages`
- `developmentalTasks`
- `relationshipTypes`
- `minimumAge`
- `maximumAge`

`convex/scenarios/lifeFilter.ts` contains the runtime filter.

Examples:

- a graduation goodbye scene only appears in `senior_year_graduation`;
- a first-job scene requires `job_search` / `early_career`;
- a cohabitation conversation can require a romantic-partner relationship;
- a retirement routine scene requires the retirement season and `retired` career stage;
- a life-review reunion appears only in later-life chapters.

Life-stage gating controls plausibility, not psychological interpretation.

## 3. Locations

Campus locations remain in `convex/campus/config.ts`.

`convex/world/locations.ts` aggregates those locations with off-campus locations. New maps can be introduced later without changing the scenario model.

A location has a `mapStatus`:

- `playable`: currently present in the game world.
- `planned`: content may be authored now, but should not enter the default runtime pool until the map/transition exists.

## 4. Construct Registry

`convex/assessment/constructs.ts` owns semantic research targets.

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

The lifespan layer also has a separate candidate-signal registry in `convex/life/signals.ts` for identity, family, relationship, network, adaptation, resilience and meaning signals. These are not formal questionnaire scores.

## 5. Assessment Measure Registry

`convex/assessment/measures.ts` is separate from both the construct registry and life-world state.

This is deliberate:

- one questionnaire can measure several constructs;
- one construct can be calibrated against several instruments;
- item wording, licensing, language validation and scoring belong to the measure implementation, not the game scenario;
- family/relationship/life-stage state must not silently become a psychological test score.

To add another questionnaire/test:

1. Register the measure and the constructs it covers.
2. Document authorization/licensing and target-language validation.
3. Implement questionnaire delivery separately from game scenes.
4. Save results through `calibrationMeasures` using a stable instrument id + version.
5. Predefine how game features will be compared with the independent measure.

The database uses `instrument: string`, so adding another instrument no longer requires changing the Convex schema.

## 6. Safety / validation rules

`convex/content/validation.ts` checks key invariants:

- no duplicate pack or scenario IDs;
- scenarios only reference registered locations;
- scenarios only reference registered constructs;
- pure-life scenes cannot secretly carry hidden assessment targets;
- `sensitive` scenarios cannot be enabled by default;
- CAPE/PCL-associated scenarios must remain `exploratory_only`;
- research scenes should define observable behavioral features.

Sensitive research content should additionally have study-specific ethics approval, consent, opt-out and risk/referral procedures before activation.

## 7. Desired long-term shape

The world should stay mostly ordinary life. A useful operating target is roughly:

- 60–70% ordinary life / fun / exploration;
- 20–30% naturally informative situations;
- 5–10% explicit calibration tasks or questionnaires.

As AI-Uni expands from university to work, family and retirement, this ratio should remain a design target. The lifespan system exists to make the world deeper, not to make every life event an assessment probe.

See also [`LIFE_COURSE_MODEL.md`](LIFE_COURSE_MODEL.md).

## Upstream

AI-Uni is built on the open-source a16z **AI Town** engine. `AI Town` remains the upstream project name when referenced in attribution, upstream links, and inherited engine/module paths.
