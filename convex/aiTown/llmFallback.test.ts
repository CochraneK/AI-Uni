import {
  hasDeepSeekChat,
  isLoopbackLLMUrl,
  scriptedAgentMessage,
  shouldUseScriptedNpcFallback,
  shouldUseSemanticNpcMemory,
} from './llmFallback';

describe('cloud-safe NPC LLM fallback', () => {
  test('recognizes local-only LLM addresses', () => {
    expect(isLoopbackLLMUrl('http://127.0.0.1:11434')).toBe(true);
    expect(isLoopbackLLMUrl('http://localhost:11434')).toBe(true);
    expect(isLoopbackLLMUrl('host.docker.internal:11434')).toBe(true);
    expect(isLoopbackLLMUrl('https://llm.example.com')).toBe(false);
  });

  test('uses scripted NPCs for the inherited localhost Ollama default', () => {
    expect(shouldUseScriptedNpcFallback({})).toBe(true);
    expect(
      shouldUseScriptedNpcFallback({
        LLM_PROVIDER: 'ollama',
        OLLAMA_HOST: 'http://127.0.0.1:11434',
      }),
    ).toBe(true);
  });

  test('keeps cloud-reachable providers on the real LLM path', () => {
    expect(shouldUseScriptedNpcFallback({ OPENAI_API_KEY: 'configured' })).toBe(false);
    expect(shouldUseScriptedNpcFallback({ TOGETHER_API_KEY: 'configured' })).toBe(false);
    expect(
      shouldUseScriptedNpcFallback({
        LLM_PROVIDER: 'ollama',
        OLLAMA_HOST: 'https://ollama.example.com',
      }),
    ).toBe(false);
    expect(shouldUseScriptedNpcFallback({ LLM_API_URL: 'https://llm.example.com' })).toBe(false);
  });

  test('uses DeepSeek for real chat while leaving semantic memory off by default', () => {
    const env = { DEEPSEEK_API_KEY: 'configured' };
    expect(hasDeepSeekChat(env)).toBe(true);
    expect(shouldUseScriptedNpcFallback(env)).toBe(false);
    expect(shouldUseSemanticNpcMemory(env)).toBe(false);
  });

  test('allows an explicit semantic-memory override for a separately configured embedding path', () => {
    expect(
      shouldUseSemanticNpcMemory({
        DEEPSEEK_API_KEY: 'configured',
        AI_UNI_MEMORY_MODE: 'on',
      }),
    ).toBe(true);
  });

  test('forced llm mode still falls back when the only endpoint is loopback', () => {
    expect(
      shouldUseScriptedNpcFallback({
        AI_UNI_NPC_MODE: 'llm',
        OLLAMA_HOST: 'http://127.0.0.1:11434',
      }),
    ).toBe(true);
    expect(
      shouldUseScriptedNpcFallback({
        AI_UNI_NPC_MODE: 'llm',
        DEEPSEEK_API_KEY: 'configured',
      }),
    ).toBe(false);
  });

  test('supports an explicit scripted override', () => {
    expect(shouldUseScriptedNpcFallback({ AI_UNI_NPC_MODE: 'scripted' })).toBe(true);
  });

  test('produces short scenario-aware deterministic dialogue', () => {
    const context = { title: '小组作业分工' };
    expect(scriptedAgentMessage('start', 'o:10', context)).toContain('小组作业分工');
    expect(scriptedAgentMessage('continue', 'o:10', context)).toContain('小组作业分工');
    expect(scriptedAgentMessage('leave', 'o:10', context).length).toBeLessThan(80);
    expect(scriptedAgentMessage('start', 'o:10')).toBe(scriptedAgentMessage('start', 'o:10'));
  });
});
