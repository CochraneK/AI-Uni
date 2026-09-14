# AI-Uni GitHub Pages Preview

AI-Uni can publish its Vite frontend to GitHub Pages at:

```text
https://cochranek.github.io/ai-uni/
```

The frontend is static, but gameplay still requires a live Convex backend.

## One-time repository setup

### 1. Configure the public Convex URL

Create a repository Actions variable:

```text
Settings
→ Secrets and variables
→ Actions
→ Variables
→ New repository variable
```

Name:

```text
VITE_CONVEX_URL
```

Value: the public URL of the deployed Convex backend, for example the `https://<deployment>.convex.cloud` URL produced by the project's Convex deployment.

Do not use `https://example.convex.cloud`; the published frontend must point at the actual backend running the matching AI-Uni Convex functions/schema.

### 2. Enable GitHub Pages once

The repository GitHub App can write code/workflows but cannot perform the account-level first-time Pages enablement. In the repository UI open:

```text
Settings
→ Pages
→ Build and deployment
→ Source: Deploy from a branch
→ Branch: gh-pages
→ Folder: / (root)
→ Save
```

The `gh-pages` branch is produced automatically by `.github/workflows/pages.yml` after `VITE_CONVEX_URL` exists.

## Automatic publishing

`.github/workflows/pages.yml` runs on pushes to:

```text
feat/bjtu-campus-v1
main
```

It performs:

```text
npm ci
→ validate VITE_CONVEX_URL
→ npm run build
→ create dist/.nojekyll
→ publish dist/ as an orphan gh-pages branch
```

After the one-time setup, subsequent pushes update the web preview automatically.

## Vite base path

`vite.config.ts` uses:

```ts
base: '/ai-uni'
```

so built assets resolve under the project Pages path rather than the account root.

## Deployment boundary

GitHub Pages hosts only the React/Vite/Pixi frontend. Convex remains responsible for:

- persistent game/world state;
- AI Town simulation runtime;
- life profiles and the seven-day first chapter;
- scheduled commitments and day clock;
- scenarios and NPC assignment;
- research tables/telemetry when explicitly consented;
- server-side LLM calls and provider credentials.

Provider API keys must stay server-side in the Convex deployment and must never be embedded as `VITE_*` frontend variables.
