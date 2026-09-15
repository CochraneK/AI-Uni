import { Conversation } from './conversation';

const makeConversation = (id: string, numMessages: number) =>
  new Conversation({
    id,
    creator: 'p:0',
    created: 1,
    numMessages,
    participants: [
      { playerId: 'p:0', invited: 1, status: { kind: 'walkingOver' } },
      { playerId: 'p:1', invited: 1, status: { kind: 'invited' } },
    ],
  } as any);

const makeGame = (conversation: Conversation) => {
  const firstAgent: any = { id: 'a:0', playerId: 'p:0' };
  const secondAgent: any = { id: 'a:1', playerId: 'p:1' };
  return {
    game: {
      world: {
        agents: new Map([
          [firstAgent.id, firstAgent],
          [secondAgent.id, secondAgent],
        ]),
        conversations: new Map([[conversation.id, conversation]]),
      },
    } as any,
    firstAgent,
    secondAgent,
  };
};

describe('conversation memory scheduling', () => {
  test('does not schedule memory work for zero-message rejected conversations', () => {
    const conversation = makeConversation('c:1', 0);
    const { game, firstAgent, secondAgent } = makeGame(conversation);

    conversation.stop(game, 100);

    expect(firstAgent.lastConversation).toBe(100);
    expect(secondAgent.lastConversation).toBe(100);
    expect(firstAgent.toRemember).toBeUndefined();
    expect(secondAgent.toRemember).toBeUndefined();
    expect(game.world.conversations.has('c:1')).toBe(false);
  });

  test('still schedules memory work after a conversation exchanged messages', () => {
    const conversation = makeConversation('c:2', 1);
    const { game, firstAgent, secondAgent } = makeGame(conversation);

    conversation.stop(game, 200);

    expect(firstAgent.toRemember).toBe('c:2');
    expect(secondAgent.toRemember).toBe('c:2');
  });
});
