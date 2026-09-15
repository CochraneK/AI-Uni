import {
  authorizeControlledPlayer,
  authorizeConversationMembership,
  authorizePublicWorldInput,
  localActorToken,
} from './publicInputAuthorization';

const world = {
  players: [
    { id: 'p:0', human: 'alice' },
    { id: 'p:1', human: 'bob' },
    { id: 'p:2' },
  ],
  conversations: [
    {
      id: 'c:0',
      participants: [{ playerId: 'p:0' }, { playerId: 'p:1' }],
    },
  ],
};

describe('public world input authorization', () => {
  test('falls back to the local actor token when no identity is configured', () => {
    expect(
      localActorToken({
        identityTokenIdentifier: null,
        fallbackTokenIdentifier: 'local-player',
      }),
    ).toBe('local-player');
  });

  test('allows a player to control only their own human player', () => {
    expect(() =>
      authorizeControlledPlayer({
        world,
        playerId: 'p:0',
        actorTokenIdentifier: 'alice',
      }),
    ).not.toThrow();

    expect(() =>
      authorizeControlledPlayer({
        world,
        playerId: 'p:1',
        actorTokenIdentifier: 'alice',
      }),
    ).toThrow('You can only control your own player.');
  });

  test('rejects agent or non-human player control', () => {
    expect(() =>
      authorizeControlledPlayer({
        world,
        playerId: 'p:2',
        actorTokenIdentifier: 'alice',
      }),
    ).toThrow('Invalid player.');
  });

  test('allows only explicit public input names', () => {
    expect(() =>
      authorizePublicWorldInput({
        world,
        actorTokenIdentifier: 'alice',
        name: 'moveTo',
        args: { playerId: 'p:0', destination: { x: 1, y: 2 } },
      }),
    ).not.toThrow();

    expect(() =>
      authorizePublicWorldInput({
        world,
        actorTokenIdentifier: 'alice',
        name: 'createAgent',
        args: { playerId: 'p:0' },
      }),
    ).toThrow('This world input is not available to clients.');
  });

  test('requires conversation membership for conversation-scoped inputs', () => {
    expect(() =>
      authorizeConversationMembership({
        world,
        playerId: 'p:0',
        conversationId: 'c:0',
      }),
    ).not.toThrow();

    expect(() =>
      authorizePublicWorldInput({
        world,
        actorTokenIdentifier: 'alice',
        name: 'startTyping',
        args: { playerId: 'p:0', conversationId: 'c:missing', messageUuid: 'm:0' },
      }),
    ).toThrow('You are not a member of this conversation.');
  });
});
