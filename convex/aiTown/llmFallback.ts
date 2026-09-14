export type ScriptedMessageType = 'start' | 'continue' | 'leave';

type ScriptedScenarioContext = {
  title: string;
  ordinaryGoal?: string;
};

type EnvLike = Record<string, string | undefined>;

const loopbackPattern = /^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|::1|host\.docker\.internal)(?::\d+)?(?:\/|$)/i;

export function isLoopbackLLMUrl(url: string) {
  return loopbackPattern.test(url.trim());
}

export function hasDeepSeekChat(env: EnvLike = process.env) {
  return Boolean(env.DEEPSEEK_API_KEY?.trim());
}

export function hasReachableNpcChatProvider(env: EnvLike = process.env) {
  if (hasDeepSeekChat(env)) return true;
  if (env.OPENAI_API_KEY?.trim() || env.TOGETHER_API_KEY?.trim()) return true;
  if (env.LLM_API_URL?.trim()) return !isLoopbackLLMUrl(env.LLM_API_URL);
  if (env.OLLAMA_HOST?.trim()) return !isLoopbackLLMUrl(env.OLLAMA_HOST);
  return false;
}

/**
 * Semantic memory is optional in AI-Uni. DeepSeek currently supplies the chat
 * model for our hosted runtime, while the inherited AI Town memory layer needs
 * a separate embeddings endpoint. Until one is explicitly configured, keep
 * real DeepSeek dialogue enabled and simply skip semantic-memory generation.
 */
export function shouldUseSemanticNpcMemory(env: EnvLike = process.env) {
  const mode = env.AI_UNI_MEMORY_MODE?.trim().toLowerCase();
  if (mode === 'off' || mode === 'disabled') return false;
  if (mode === 'on' || mode === 'enabled') return true;
  if (hasDeepSeekChat(env)) return false;
  return !shouldUseScriptedNpcFallback(env);
}

/**
 * `convex dev` runs actions inside a Convex deployment, not inside the local
 * Vite/Node process. A default Ollama URL such as 127.0.0.1 therefore points at
 * the Convex worker rather than the developer's laptop.
 *
 * In that situation AI-Uni keeps the simulation playable with deterministic
 * scripted NPC dialogue. Configuring a cloud-reachable LLM endpoint, DeepSeek,
 * or a non-loopback Ollama host automatically restores a real LLM chat path.
 */
export function shouldUseScriptedNpcFallback(env: EnvLike = process.env) {
  const mode = env.AI_UNI_NPC_MODE?.trim().toLowerCase();
  if (mode === 'scripted') return true;
  // `llm` means "prefer a real model", not "force the inherited localhost
  // Ollama path even when no reachable provider exists". This keeps Convex
  // cloud actions from accidentally calling 127.0.0.1.
  if (mode === 'llm') return !hasReachableNpcChatProvider(env);

  const provider = env.LLM_PROVIDER?.trim().toLowerCase();
  if (provider === 'scripted') return true;

  if (hasDeepSeekChat(env)) return false;

  if (env.LLM_API_URL) {
    return isLoopbackLLMUrl(env.LLM_API_URL);
  }

  if (env.OPENAI_API_KEY || env.TOGETHER_API_KEY) {
    return false;
  }

  if (provider && provider !== 'ollama') {
    // Preserve configuration errors for explicitly selected non-Ollama
    // providers rather than silently hiding them behind the fallback.
    return false;
  }

  return isLoopbackLLMUrl(env.OLLAMA_HOST ?? 'http://127.0.0.1:11434');
}

function stableIndex(input: string, length: number) {
  if (length <= 1) return 0;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

export function scriptedAgentMessage(
  type: ScriptedMessageType,
  operationId: string,
  scenarioContext?: ScriptedScenarioContext,
) {
  if (type === 'leave') {
    const lines = [
      '我还有点安排，先走一步，之后再聊。',
      '那我先去忙啦，回头校园里见。',
      '我先撤啦，下次碰到再继续聊。',
    ];
    return lines[stableIndex(operationId, lines.length)];
  }

  if (scenarioContext) {
    if (type === 'start') {
      return `关于“${scenarioContext.title}”，我正想和你聊一下。你想先怎么处理？`;
    }
    return `嗯，我听到了。那“${scenarioContext.title}”这件事，你现在最想先解决哪一部分？`;
  }

  const lines =
    type === 'start'
      ? [
          '嗨，刚好碰到你。你今天安排得怎么样？',
          '你也在这边啊。今天校园里还顺利吗？',
          '正好遇见你，我刚忙完一点事。你接下来准备去哪儿？',
        ]
      : [
          '嗯，我懂你的意思。那你接下来准备怎么做？',
          '这样啊。你自己现在更倾向哪一种处理方式？',
          '听起来挺真实的。要不要先把最要紧的那件事处理掉？',
        ];
  return lines[stableIndex(operationId, lines.length)];
}
