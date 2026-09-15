type PublicWorldPlayer = {
  id: string;
  human?: string;
};

type PublicWorldConversation = {
  id: string;
  participants: Array<{ playerId: string }>;
};

type PublicWorld = {
  players: PublicWorldPlayer[];
  conversations: PublicWorldConversation[];
};

const publicInputNames = new Set([
  'moveTo',
  'keepAlive',
  'startConversation',
  'startTyping',
  'acceptInvite',
  'rejectInvite',
  'leaveConversation',
]);

export function localActorToken({
  identityTokenIdentifier,
  fallbackTokenIdentifier,
}: {
  identityTokenIdentifier: string | null;
  fallbackTokenIdentifier: string;
}) {
  return identityTokenIdentifier ?? fallbackTokenIdentifier;
}

export function authorizeControlledPlayer({
  world,
  playerId,
  actorTokenIdentifier,
}: {
  world: Pick<PublicWorld, 'players'>;
  playerId: string;
  actorTokenIdentifier: string;
}) {
  const player = world.players.find((candidate) => candidate.id === playerId);
  if (!player?.human) {
    throw new Error('Invalid player.');
  }
  if (player.human !== actorTokenIdentifier) {
    throw new Error('You can only control your own player.');
  }
  return player;
}

export function authorizeConversationMembership({
  world,
  playerId,
  conversationId,
}: {
  world: Pick<PublicWorld, 'conversations'>;
  playerId: string;
  conversationId: string;
}) {
  const conversation = world.conversations.find((candidate) => candidate.id === conversationId);
  if (
    !conversation ||
    !conversation.participants.some((participant) => participant.playerId === playerId)
  ) {
    throw new Error('You are not a member of this conversation.');
  }
  return conversation;
}

export function authorizePublicWorldInput({
  world,
  actorTokenIdentifier,
  name,
  args,
}: {
  world: PublicWorld;
  actorTokenIdentifier: string;
  name: string;
  args: unknown;
}) {
  if (!publicInputNames.has(name)) {
    throw new Error('This world input is not available to clients.');
  }
  if (!args || typeof args !== 'object' || !('playerId' in args) || typeof args.playerId !== 'string') {
    throw new Error('Invalid player input.');
  }

  authorizeControlledPlayer({
    world,
    playerId: args.playerId,
    actorTokenIdentifier,
  });

  if ('conversationId' in args && args.conversationId !== undefined) {
    if (typeof args.conversationId !== 'string') {
      throw new Error('Invalid conversation input.');
    }
    authorizeConversationMembership({
      world,
      playerId: args.playerId,
      conversationId: args.conversationId,
    });
  }
}
