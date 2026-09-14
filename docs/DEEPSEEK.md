# DeepSeek for AI-Uni NPC dialogue

AI-Uni can use DeepSeek for real NPC dialogue while leaving the inherited AI Town semantic-memory/embedding layer disabled.

This is useful for a first playable deployment because DeepSeek exposes an OpenAI-compatible chat API, while AI-Uni's inherited memory vector index otherwise expects a separate embedding provider.

## Development deployment

From the AI-Uni repository connected to the desired Convex development deployment:

```bat
npx convex env set DEEPSEEK_API_KEY "<your-key>"
npx convex env set DEEPSEEK_MODEL "deepseek-v4-flash"
npx convex env set AI_UNI_NPC_MODE "llm"
npx convex env set AI_UNI_MEMORY_MODE "off"
```

Optional custom base URL:

```bat
npx convex env set DEEPSEEK_API_URL "https://api.deepseek.com"
```

The default base URL is already `https://api.deepseek.com`, so this last command is normally unnecessary.

For slower/more capable NPC generation you may use:

```bat
npx convex env set DEEPSEEK_MODEL "deepseek-v4-pro"
```

AI-Uni explicitly disables thinking mode for ordinary NPC turns to reduce latency and cost.

## Runtime behavior

When `DEEPSEEK_API_KEY` exists:

- NPC messages use the DeepSeek chat API;
- active AI-Uni scenario context is included, without hidden psychometric targets;
- conversation history is sent for multi-turn replies;
- semantic memory embedding/search is disabled by default;
- no DeepSeek key is ever exposed to the Vite/GitHub Pages frontend.

If the key is absent and the only configured provider is local Ollama on a loopback address, AI-Uni uses deterministic scripted NPC dialogue instead of failing Convex actions.

## Production

Set the same environment variables on the Convex production deployment. Do not store `DEEPSEEK_API_KEY` as a `VITE_*` variable or in GitHub Pages JavaScript.
