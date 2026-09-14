import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { GameId } from '../../convex/aiTown/ids';
import { getUniversityProfile } from '../../convex/campus/registry';
import { getScenario } from '../../convex/scenarios/registry';
import { findLocationAtPosition } from '../../convex/world/zones';
import type { ServerGame } from './serverGame';

export function useScenarioRuntime(args: {
  worldId: Id<'worlds'>;
  game: ServerGame;
  humanPlayerId?: GameId<'players'>;
  humanTokenIdentifier: string | null;
}) {
  const profileKey = args.humanTokenIdentifier ? `ai-uni:${args.humanTokenIdentifier}` : null;

  const createLifeProfile = useMutation(api.life.state.createLifeProfile);
  const createScenarioRuntime = useMutation(api.scenarios.runtime.createScenarioRuntime);
  const enterScenarioLocation = useMutation(api.scenarios.runtime.enterScenarioLocation);
  const leaveScenarioLocation = useMutation(api.scenarios.runtime.leaveScenarioLocation);

  const profile = useQuery(
    api.life.state.getLifeProfile,
    profileKey ? { profileKey } : 'skip',
  );
  const runtime = useQuery(
    api.scenarios.runtime.getScenarioRuntime,
    profile ? { profileId: profile._id } : 'skip',
  );

  const creatingProfile = useRef(false);
  useEffect(() => {
    if (!profileKey || profile !== null || creatingProfile.current) return;
    creatingProfile.current = true;
    void createLifeProfile({
      profileKey,
      worldId: args.worldId,
      universityProfileId: 'generic_university',
    })
      .catch((error) => console.error('Failed to create AI-Uni life profile', error))
      .finally(() => {
        creatingProfile.current = false;
      });
  }, [args.worldId, createLifeProfile, profile, profileKey]);

  const creatingRuntime = useRef(false);
  useEffect(() => {
    if (!profile || runtime !== null || creatingRuntime.current) return;
    creatingRuntime.current = true;
    void createScenarioRuntime({
      profileId: profile._id,
      worldId: args.worldId,
      behavioralResearchConsent: false,
      sensitiveResearchConsent: false,
    })
      .catch((error) => console.error('Failed to create AI-Uni scenario runtime', error))
      .finally(() => {
        creatingRuntime.current = false;
      });
  }, [args.worldId, createScenarioRuntime, profile, runtime]);

  const player = args.humanPlayerId
    ? args.game.world.players.get(args.humanPlayerId)
    : undefined;
  const universityProfile = getUniversityProfile(profile?.universityProfileId ?? 'generic_university');
  const locationId = player
    ? findLocationAtPosition(
        player.position.x,
        player.position.y,
        args.game.worldMap.width,
        args.game.worldMap.height,
        universityProfile?.mapId,
      )
    : undefined;

  const lastSyncedLocation = useRef<string | undefined>();
  const lastRuntimeId = useRef<string | undefined>();
  useEffect(() => {
    if (!runtime) return;

    if (lastRuntimeId.current !== runtime._id) {
      lastRuntimeId.current = runtime._id;
      lastSyncedLocation.current = runtime.activeLocationId;
    }

    if (lastSyncedLocation.current === locationId) return;
    lastSyncedLocation.current = locationId;

    if (locationId) {
      void enterScenarioLocation({ runtimeId: runtime._id, locationId }).catch((error) =>
        console.error('Failed to enter AI-Uni scenario location', error),
      );
    } else {
      void leaveScenarioLocation({ runtimeId: runtime._id }).catch((error) =>
        console.error('Failed to leave AI-Uni scenario location', error),
      );
    }
  }, [enterScenarioLocation, leaveScenarioLocation, locationId, runtime]);

  const activeScenario = useMemo(
    () => (runtime?.activeScenarioId ? getScenario(runtime.activeScenarioId) : undefined),
    [runtime?.activeScenarioId],
  );

  return {
    profile,
    runtime,
    locationId,
    activeScenario,
    universityProfile,
  };
}
