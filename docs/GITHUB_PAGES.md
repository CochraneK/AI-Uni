# AI-Uni GitHub Pages Preview

AI-Uni can publish a browser-playable preview at:

```text
https://cochranek.github.io/ai-uni/
```

The hosted preview is based on the **generic university core**. Real-university content such as `bjtu_inspired` remains an optional University Template and is not the default deployment identity.

## Two web modes

The same Pages URL supports two modes.

### Zero-setup browser Demo

If the repository does **not** yet contain a `CONVEX_DEPLOY_KEY`, GitHub Actions still builds and publishes AI-Uni with:

```text
VITE_DEMO_MODE=1
```

This browser-only Alpha requires no local checkout and no backend account configuration. It currently includes:

- the seven-day first-week structure;
- eight generic campus locations;
- the existing 16 ordinary campus activities;
- an 08:00–23:00 day clock;
- semantic campus travel time;
- seven scripted first-week story beats;
- the eight existing NPC identities with clearly labeled scripted Demo replies;
- first-week completion gates;
- browser `localStorage` save/reset.

The Demo is deliberately not presented as the full LLM runtime. It does not write research telemetry and does not perform psychological scoring.

### Full online mode

When `CONVEX_DEPLOY_KEY` exists, the workflow deploys the matching Convex backend and builds the existing full React/Pixi/Convex client with the production deployment URL injected automatically.

Primary branches:

```text
feat/generic-university-v1
main
```

## Automatic publishing

`.github/workflows/pages.yml` always runs:

```text
npm ci
```

Without `CONVEX_DEPLOY_KEY`:

```text
npm run build with VITE_DEMO_MODE=1
→ create dist/.nojekyll
→ publish dist/ to gh-pages
```

With `CONVEX_DEPLOY_KEY`:

```text
npx convex deploy
→ npm run build with the deployed Convex URL injected as VITE_CONVEX_URL
→ npx convex run init --prod
→ create dist/.nojekyll
→ publish dist/ to gh-pages
```

## Enable GitHub Pages once

The repository GitHub App can write code/workflows but cannot perform GitHub's account-level first-time Pages enablement. After the workflow creates `gh-pages`, open the repository UI once:

```text
Settings
→ Pages
→ Build and deployment
→ Source: Deploy from a branch
→ Branch: gh-pages
→ Folder: / (root)
→ Save
```

After that, subsequent pushes update the web preview automatically.

## Optional Convex upgrade

No local checkout is required to try the browser Demo.

When you later want the full persistent multi-agent version, create/select the Convex `ai-uni` project under the chosen team and add its production deploy key to GitHub:

```text
Settings
→ Secrets and variables
→ Actions
→ Secrets
→ New repository secret

Name: CONVEX_DEPLOY_KEY
```

Do not expose deploy keys or LLM provider keys as `VITE_*` variables.

## Vite base path

`vite.config.ts` uses:

```ts
base: '/ai-uni'
```

so built assets resolve under the project Pages path rather than the account root.

## LLM provider boundary

GitHub Pages hosts only the browser UI. In full mode, NPC generation runs server-side in Convex.

Convex actions execute inside the Convex deployment, including during `convex dev`. Therefore a URL such as `http://127.0.0.1:11434` refers to the Convex worker itself, not to Ollama running on the developer's laptop.

AI-Uni now handles this explicitly:

- if the inherited Ollama configuration resolves to a loopback-only address, NPC generation automatically uses deterministic scripted dialogue so the simulation remains playable;
- semantic conversation-memory generation is skipped while that fallback is active, avoiding repeated unreachable embedding requests;
- if a cloud-reachable `LLM_API_URL`, provider API key, or non-loopback Ollama host is configured, the normal LLM path is used automatically;
- `AI_UNI_NPC_MODE=scripted` forces the fallback and `AI_UNI_NPC_MODE=llm` forces the real LLM path for debugging.

The scripted fallback preserves movement, conversation state, scenario context, day progression and telemetry wiring. It is a development/resilience mode, not a substitute for the final LLM experience.

Provider API keys belong in Convex deployment environment variables, never in GitHub Pages frontend variables.
