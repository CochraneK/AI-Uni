import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { ServerGame } from '../hooks/serverGame';
import { resolveCampusDisplayName } from '../../convex/campus/registry';
import { worldLocations } from '../../convex/world/locations';
import { useScenarioRuntime } from '../hooks/useScenarioRuntime';

export default function ScenarioStatusPanel(props: {
  worldId: Id<'worlds'>;
  game: ServerGame;
}) {
  const humanTokenIdentifier = useQuery(api.world.userStatus, { worldId: props.worldId }) ?? null;
  const humanPlayerId = [...props.game.world.players.values()].find(
    (player) => player.human === humanTokenIdentifier,
  )?.id;

  const { runtime, locationId, activeScenario, universityProfile, profile } = useScenarioRuntime({
    worldId: props.worldId,
    game: props.game,
    humanPlayerId,
    humanTokenIdentifier,
  });
  const completeActiveScenario = useMutation(api.scenarios.runtime.completeActiveScenario);

  const baseLocationName = locationId ? worldLocations[locationId]?.name : undefined;
  const locationName =
    locationId && universityProfile
      ? resolveCampusDisplayName(universityProfile, locationId, baseLocationName ?? locationId)
      : baseLocationName;

  if (!humanPlayerId) {
    return null;
  }

  return (
    <div className="mb-5 rounded border-2 border-brown-700 bg-brown-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-brown-100">AI-Uni · 大学生活</h2>
        {profile && (
          <span className="text-xs text-brown-300">
            第 {profile.chapterUnit} 日
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-brown-300">
        当前地点：<span className="text-brown-100">{locationName ?? '校园公共区域'}</span>
      </div>

      {activeScenario ? (
        <div className="mt-4">
          <div className="text-base font-semibold text-brown-100">{activeScenario.title}</div>
          <p className="mt-2 text-sm leading-6 text-brown-200">{activeScenario.setup}</p>
          <p className="mt-2 text-sm text-brown-300">
            当前目标：{activeScenario.ordinaryGoal}
          </p>
          {runtime && (
            <button
              className="mt-3 rounded bg-brown-600 px-3 py-2 text-sm font-semibold text-brown-50 hover:bg-brown-500"
              onClick={() =>
                void completeActiveScenario({ runtimeId: runtime._id, outcome: 'completed_by_player' })
              }
            >
              完成这件事
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-brown-300">
          现在没有必须处理的事件。可以随便走走、找人聊天，或者去别的地方看看。
        </p>
      )}

      {runtime && !runtime.behavioralResearchConsent && (
        <p className="mt-3 text-xs leading-5 text-brown-400">
          当前为普通游玩模式：研究行为记录未启用。
        </p>
      )}
    </div>
  );
}
