# BJTU Campus v1

This branch turns AI Town into a fictionalized Beijing Jiaotong University campus-life research prototype.

## Product rule

The player should feel that they are living ordinary university life. Psychological measurement is a research layer, not the visible game loop.

Target composition for a session:

- ~60–70% ordinary life, fun and exploration
- ~20–30% naturally informative social / decision / stress situations
- ~5–10% explicit calibration or questionnaire steps

The campus is the first hub, not the long-term boundary. The architecture now supports off-campus dining, KTV/parties, transit, internships, travel and future online/social-media scenes without redesigning the scenario model.

## First playable map

Keep the first map small. Use these gameplay anchors rather than attempting a 1:1 geographic reconstruction:

1. 南门 — arrival / meeting point
2. 思源教学区 — classes and presentations
3. 图书馆 — study and group work
4. 食堂 — routine social interaction
5. 学生活动中心 — clubs and events
6. 明湖与校园绿地 — leisure / low-pressure conversation
7. 体育场 — exercise and group activity
8. 学生宿舍 — roommate and daily-life scenes

The place names are campus-inspired gameplay anchors. The game map should be presented as a fictionalized research environment rather than an authoritative campus navigation map.

## Art pipeline

AI Town loads the map module from `convex/init.ts`. The original repository imports `data/gentle.ts/js`.

For the BJTU map:

1. Draw a consistent pixel-art tileset. Do not mix photographic campus images with the existing pixel characters.
2. Build the map in Tiled.
3. Keep at least two tile layers named exactly `bgtiles` and `objmap`.
4. Export the Tiled map as JSON.
5. Convert it with:

```bash
node data/convertMap.js data/bjtu-map.json /ai-town/assets/bjtu/bjtu_tileset.png <widthPx> <heightPx>
```

6. Rename the generated module to `data/bjtu.js` (or `.ts`).
7. Change `convex/init.ts` from:

```ts
import * as map from '../data/gentle';
```

to:

```ts
import * as map from '../data/bjtu';
```

8. Wipe/reseed the development database after changing map or character seed data.

Suggested asset layout:

```text
assets/bjtu/
  bjtu_tileset.png
  south_gate.png
  siyuan_building.png
  library.png
  student_center.png
  cafeteria.png
  ming_lake.png
  sports_field.png
  dormitory.png
```

Before publishing, verify permission for any official logos, photos, seals, signage or other protected brand assets. Prefer original pixel-art interpretations rather than copying photographs directly.

## Content-pack architecture

Scenarios are no longer maintained as one monolithic list.

```text
convex/content/
├── packs/
│   ├── campusLife.ts
│   ├── socialFriction.ts
│   ├── cityLife.ts
│   └── sensitiveResearch.ts
├── types.ts
└── validation.ts
```

Current packs:

- `campus-life`: classes, clubs, study, schedule changes and other baseline life content.
- `social-friction`: roommate conflict, unfair group work, exclusion, annoying behavior and broken promises.
- `city-life`: dining, KTV, transit and internship examples; registered now but disabled until map/transition support exists.
- `sensitive-research`: CAPE/PCL-associated exploratory scenes; opt-in only and disabled by default.

`convex/world/locations.ts` aggregates campus and future off-campus locations. Off-campus locations currently use `mapStatus: 'planned'`, which means content can be authored before the next map exists.

See `docs/CONTENT_PACKS.md` for the extension guide.

## Research architecture

```text
ordinary scenario
      ↓
raw telemetry
      ↓
derived behavioral feature
      ↓
construct registry
      ↓
independent assessment / criterion measure
      ↓
validation analysis
```

Raw events should include more than button choices. Capture, where appropriate and consented:

- response latency
- approach / avoidance
- movement path
- conversation initiation
- information seeking
- help seeking
- repeated checking
- choice revision
- return to task / recovery time

Do not collect data merely because it is technically available. The study protocol should define a data-minimization list before deployment.

## Construct registry

Research targets live in `convex/assessment/constructs.ts`, separate from scenarios.

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

The newer namespaces are expansion points, not claims that the current game already validly measures those constructs.

## Adding more tests

Questionnaires/tests are separately registered in `convex/assessment/measures.ts`.

This means adding another measure does not require editing the Convex schema:

1. register the measure and which constructs it is intended to calibrate;
2. document version, language, licensing/authorization and validation status;
3. implement questionnaire delivery separately from game scenes;
4. save results with a stable `instrument` id + version;
5. preregister how game features will be compared with the independent measure.

Questionnaire item wording should not be hidden inside NPC prompts or scenario files.

## Measurement boundaries

### Big Five

Use repeated ordinary behaviors to derive candidate features, then validate against an independent Big Five instrument. Do not infer a stable trait from a single scene.

### CAPE-P15

Use ambiguous-but-plausible social or perceptual situations only as exploratory behavioral tasks. Do not convert a game choice into a CAPE-P15 item response, threshold or clinical label.

### PCL-5

PCL-5 refers to symptoms in relation to real traumatic exposure. A startle or avoidance response inside the game is not a PCL-5 item. Game behavior may only be studied as an exploratory correlate and must be calibrated separately against a proper PCL-5 administration when appropriate under the study protocol.

## Automatic content validation

`convex/content/validation.ts` checks key invariants as content grows:

- duplicate content-pack IDs;
- duplicate scenario IDs;
- unknown locations;
- unknown constructs;
- sensitive scenarios accidentally enabled by default;
- CAPE/PCL-associated scenes not marked `exploratory_only`;
- scenarios with no observable features.

The scenario registry fails fast on invalid content configuration.

## Safety and consent

Participants may be blinded to the exact construct attached to each scene, but they should not be deceived about the fact that choices, movement and conversations are being recorded for behavioral / psychological research.

Sensitive scenes should be skippable. The application must not present diagnosis, treatment advice or crisis conclusions from these experimental signals.

Free-text dialogue needs a study-specific retention/de-identification policy before real participant deployment.

## Next implementation milestones

1. Produce the small BJTU-inspired Tiled map and tileset.
2. Add zone triggers to connect map locations to scenario IDs.
3. Wire `research.startSession` / `logEvent` into player movement and dialogue.
4. Add a deterministic scenario controller selecting from enabled content packs.
5. Add NPC role assignment and controlled LLM prompts.
6. Add participant consent/session UI.
7. Add independent questionnaire/calibration UI.
8. Build a researcher-only export / dashboard.
