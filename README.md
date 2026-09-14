# AI Town → AI-Uni Campus

This fork is being extended into **AI-Uni Campus**: a university-life simulation and behavioral research prototype built on the original AI Town engine.

The first research world is a fictionalized BJTU-inspired campus. Ordinary campus life remains the visible game loop; psychological constructs, telemetry, and independent questionnaires live in separate research layers.

Current extension work is documented in:

- `docs/BJTU_CAMPUS_V1.md` — campus map/product/research plan.
- `docs/CONTENT_PACKS.md` — how to add campus, city, social-friction, sensitive research, and future assessment content without rewriting the engine.

Important boundary: game behavior is not a diagnosis. CAPE-P15/PCL-5-associated scenarios are exploratory and must not be converted directly into clinical scores or labels.

---

# AI Town

AI Town is a virtual town where AI characters live, chat and socialize.

This repository began as a fork of the a16z-infra AI Town project. The original setup, deployment, provider configuration, map customization and architecture remain applicable unless this fork's docs state otherwise.

## Local development

Install dependencies and start the project using the existing AI Town/Convex development workflow.

```bash
npm install
npm run dev
```

Production/type check:

```bash
npm run build
```

## LLM providers

The upstream code supports OpenAI, Together, Ollama, and OpenAI-compatible providers through `convex/util/llm.ts` and environment variables.

For an OpenAI-compatible provider, configure the provider URL/key/model and ensure the embedding dimension matches the selected embedding model.

## Customize the simulation

### Characters

Character descriptions and spritesheet references are in `data/characters.ts`.

After changing bootstrap character data, reset/reinitialize the development database as required by the upstream AI Town workflow.

### Map

The world map is loaded from the map module imported by `convex/init.ts`.

The existing conversion workflow is:

1. Build a map in Tiled.
2. Use layers named `bgtiles` and `objmap`.
3. Export JSON.
4. Convert with `data/convertMap.js`.
5. Import the generated map module from `convex/init.ts`.

Example:

```bash
node data/convertMap.js <mapDataPath> <assetPath> <tilesetpxw> <tilesetpxh>
```

For the BJTU-inspired map, see `docs/BJTU_CAMPUS_V1.md`.

## AI-Uni extension structure

```text
convex/
├── aiTown/             upstream simulation/game logic
├── engine/             upstream simulation engine
├── campus/             first campus-world configuration
├── world/              extensible campus/city/travel locations
├── content/            content packs and validation
├── scenarios/          compatibility registry / scenario lookup
├── assessment/         constructs + assessment measure registry
└── research/           consent/session/telemetry/calibration data
```

The design goal is to keep the AI Town engine relatively clean while allowing many worlds, scenarios, NPC roles, behavioral features and independent assessment instruments to be added over time.

## Research safety

Before real participant deployment, add the study-specific ethics/consent, data-minimization, dialogue retention/de-identification, opt-out, sensitive-content, risk handling and referral procedures required by the research protocol.

The current code is a research prototype and should not present game-derived behavior as medical diagnosis or treatment advice.

## License / upstream

Retain and review the repository `LICENSE` and upstream attribution when redistributing or publishing modified versions. Refer to the original a16z-infra AI Town repository history for upstream implementation details.
