import { useState } from 'react';
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
  const [dayEndMessage, setDayEndMessage] = useState<string>();
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
  const endFirstWeekDay = useMutation(api.life.day.endFirstWeekDay);

  const baseLocationName = locationId ? worldLocations[locationId]?.name : undefined;
  const locationName =
    locationId && universityProfile
      ? resolveCampusDisplayName(universityProfile, locationId, baseLocationName ?? locationId)
      : baseLocationName;
  const isFirstWeek = profile?.chapterId === 'university_first_week';
  const isFinalFirstWeekDay = isFirstWeek && profile?.chapterUnit === 7;

  if (!humanPlayerId) {
    return null;
  }

  return (
    <div className="mb-5 rounded border-2 border-brown-700 bg-brown-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg text-brown-100">AI-Uni · 大学生活</h2>
        {profile && (
          <span className="text-xs text-brown-300">
            {isFirstWeek ? `第 ${profile.chapterUnit} / 7 日` : `阶段 ${profile.chapterUnit}`}
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
          <p className="mt-2 text-xs leading-5 text-brown-400">
            和事件相关的人自然交谈会推进事件；也可以在你认为事情已经处理完时手动结束。
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

      {dayEndMessage && (
        <p className="mt-4 rounded bg-brown-800 px-3 py-2 text-sm leading-6 text-brown-200">
          {dayEndMessage}
        </p>
      )}

      {profile && isFirstWeek && (
        <button
          className="mt-4 w-full rounded border border-brown-600 px-3 py-2 text-sm font-semibold text-brown-100 hover:bg-brown-700"
          onClick={() => {
            setDayEndMessage(undefined);
            void endFirstWeekDay({ profileId: profile._id })
              .then((result) => {
                if (!result.advanced) {
                  const missing = result.readiness.missing.join('；');
                  setDayEndMessage(`${result.closingBeat}${missing ? ` ${missing}。` : ''}`);
                  return;
                }
                setDayEndMessage(
                  result.firstWeekCompleted
                    ? `${result.closingBeat} 第一章完成，接下来进入大一阶段。`
                    : result.closingBeat,
                );
              })
              .catch((error) => {
                console.error('Failed to end AI-Uni day', error);
                setDayEndMessage('今天暂时无法结束，请稍后再试。');
              });
          }}
        >
          {isFinalFirstWeekDay ? '结束第一周' : '结束今天'}
        </button>
      )}

      {runtime && !runtime.behavioralResearchConsent && (
        <p className="mt-3 text-xs leading-5 text-brown-400">
          当前为普通游玩模式：研究行为记录未启用。
        </p>
      )}
    </div>
  );
}
