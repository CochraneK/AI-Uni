# AI-Uni GitHub Pages Preview

AI-Uni can publish its Vite frontend to GitHub Pages at:

```text
https://cochranek.github.io/ai-uni/
```

The frontend is static, but gameplay requires a live Convex backend.

## Generic-university deployment model

The hosted preview is based on the **generic university core**. Real-university content such as `bjtu_inspired` remains an optional University Template and is not the default deployment identity.

Primary branches:

```text
feat/generic-university-v1
main
```

## One-time Convex setup

From a local checkout of the repository:

```bash
npm install
npx convex dev --run init --until-success
```

On first run, sign in to Convex, choose the `cunyikang` team, and create/select the `ai-uni` project. Convex creates a development deployment and writes the local deployment configuration.

Every Convex project also has a shared production deployment. Create a production deploy key from the configured project:

```bash
npx convex deployment token create github-pages --prod
```

Copy the emitted key into the GitHub repository as a secret:

```text
Settings
→ Secrets and variables
→ Actions
→ Secrets
→ New repository secret

Name: CONVEX_DEPLOY_KEY
Value: <the production deploy key>
```

Do not expose this key as a `VITE_*` variable.

## Automatic backend + frontend publishing

`.github/workflows/pages.yml` runs on pushes to:

```text
feat/generic-university-v1
main
```

When `CONVEX_DEPLOY_KEY` exists it performs:

```text
npm ci
→ npx convex deploy
→ npm run build with the deployed Convex URL injected as VITE_CONVEX_URL
→ npx convex run init --prod
→ create dist/.nojekyll
→ publish dist/ as an orphan gh-pages branch
```

This keeps the Convex functions/schema and the GitHub Pages frontend on the same revision.

## Enable GitHub Pages once

The repository GitHub App can write code/workflows but cannot perform GitHub's account-level first-time Pages enablement. After the first successful publish creates `gh-pages`, open:

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

## Vite base path

`vite.config.ts` uses:

```ts
base: '/ai-uni'
```

so built assets resolve under the project Pages path rather than the account root.

## LLM provider boundary

GitHub Pages hosts only the browser UI. NPC generation still runs server-side in Convex.

The current inherited AI Town configuration defaults to a local Ollama endpoint when no cloud LLM provider is configured. A hosted Convex deployment cannot reach `127.0.0.1:11434` on a player's computer, so a public playable deployment needs a cloud-accessible LLM provider or a later scripted/fallback NPC mode.

Provider API keys belong in Convex deployment environment variables, never in GitHub Pages frontend variables.

## Deployment boundary

Convex remains responsible for:

- persistent game/world state;
- AI Town simulation runtime;
- life profiles and the seven-day first chapter;
- scheduled commitments and day clock;
- scenarios and NPC assignment;
- research tables/telemetry when explicitly consented;
- server-side LLM calls and provider credentials.
