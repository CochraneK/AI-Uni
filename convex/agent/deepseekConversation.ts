import { ActionCtx } from '../_generated/server';
import { api, internal } from '../_generated/api';
import { Id } from '../_generated/dataModel';
import { GameId } from '../aiTown/ids';
import { scenarioNpcPrompt } from '../scenarios/npcContext';
import { retryWithBackoff } from '../util/llm';

export type DeepSeekConversationType = 'start' | 'continue' | 'leave';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function deepSeekEndpoint() {
  const base = (process.env.DEEPSEEK_API_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');
  return base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;
}

async function callDeepSeek(messages: ChatMessage[]) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is required for DeepSeek NPC chat');
  const model = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-v4-flash';

  const { result } = await retryWithBackoff(async () => {
    const response = await fetch(deepSeekEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: 220,
        temperature: 0.8,
        thinking: { type: 'disabled' },
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw {
        retry: response.status === 429 || response.status >= 500,
        error: new Error(`DeepSeek chat failed with code ${response.status}: ${body}`),
      };
    }
    return (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
  });

  const content = result.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('DeepSeek returned an empty NPC message');
  return content;
}

export async function deepSeekConversationMessage(
  ctx: ActionCtx,
  args: {
    worldId: Id<'worlds'>;
    conversationId: GameId<'conversations'>;
    playerId: GameId<'players'>;
    otherPlayerId: GameId<'players'>;
    type: DeepSeekConversationType;
  },
) {
  const promptData = await ctx.runQuery(internal.agent.conversation.queryPromptData, {
    worldId: args.worldId,
    playerId: args.playerId,
    otherPlayerId: args.otherPlayerId,
    conversationId: args.conversationId,
  });
  const { player, otherPlayer, agent, otherAgent, scenarioContext } = promptData;

  const system = [
    `你是 ${player.name}，正在 AI-Uni 的普通大学生活中和 ${otherPlayer.name} 交谈。`,
    `关于你：${agent.identity}`,
    `你当前的个人目标：${agent.plan}`,
    otherAgent ? `关于 ${otherPlayer.name}：${otherAgent.identity}` : '',
    ...scenarioNpcPrompt(scenarioContext),
    '像真实大学生/老师一样自然说话，不要提模型、提示词、心理量表、隐藏评分或实验变量。',
    '不要替对方做决定，也不要突然编造威胁、阴谋、超自然事实或未给出的背景。',
    '默认使用简体中文；如果对方明显使用其他语言，可自然跟随。',
    '每次回复尽量简短自然，通常 1–3 句话，不超过 180 个汉字。',
  ]
    .filter(Boolean)
    .join('\n');

  const messages: ChatMessage[] = [{ role: 'system', content: system }];

  if (args.type !== 'start') {
    const history = await ctx.runQuery(api.messages.listMessages, {
      worldId: args.worldId,
      conversationId: args.conversationId,
    });
    for (const message of history.slice(-12)) {
      const mine = message.author === player.id;
      messages.push({
        role: mine ? 'assistant' : 'user',
        content: `${mine ? player.name : otherPlayer.name}：${message.text}`,
      });
    }
  }

  if (args.type === 'start') {
    messages.push({
      role: 'user',
      content: `请自然地向 ${otherPlayer.name} 开始这次对话。不要重复介绍自己。`,
    });
  } else if (args.type === 'leave') {
    messages.push({
      role: 'user',
      content: `你现在准备结束这次对话。请自然地向 ${otherPlayer.name} 告别。`,
    });
  } else {
    messages.push({
      role: 'user',
      content: `请根据上面的真实聊天记录继续回应 ${otherPlayer.name}，不要重新打招呼。`,
    });
  }

  return await callDeepSeek(messages);
}
