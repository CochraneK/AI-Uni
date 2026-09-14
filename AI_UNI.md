# AI-Uni Campus

AI-Uni Campus extends the upstream AI Town engine into a university-life simulation and behavioral research prototype.

The first hub is a fictionalized Beijing Jiaotong University campus. The visible experience should remain ordinary student life: classes, clubs, roommates, annoying people, friendships, meals, parties, city activities, internships and travel. Psychological constructs and independent questionnaires remain a separate research layer.

Start here:

- `docs/BJTU_CAMPUS_V1.md` — product, map and research implementation plan.
- `docs/CONTENT_PACKS.md` — how to add new scenarios, locations, constructs and assessment measures.

Current architecture:

```text
AI Town engine
  + campus / world locations
  + content packs
  + scenario registry + validation
  + behavioral telemetry
  + construct registry
  + independent assessment registry
```

Important boundary: game-derived behavior is not a diagnosis. CAPE-P15/PCL-5-associated scenarios remain exploratory and must not be directly converted into clinical scores or labels.
