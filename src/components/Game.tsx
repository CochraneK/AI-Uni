import { useEffect, useRef, useState } from 'react';
import PixiGame, { type CampusNavigationRequest } from './PixiGame.tsx';

import { useElementSize } from 'usehooks-ts';
import { Stage } from '@pixi/react';
import { ConvexProvider, useConvex, useMutation, useQuery } from 'convex/react';
import PlayerDetails from './PlayerDetails.tsx';
import ScenarioStatusPanel from './ScenarioStatusPanel.tsx';
import CampusTravelStatus from './CampusTravelStatus.tsx';
import ScheduledCommitmentsPanel from './ScheduledCommitmentsPanel.tsx';
import { api } from '../../convex/_generated/api';
import { useWorldHeartbeat } from '../hooks/useWorldHeartbeat.ts';
import { useHistoricalTime } from '../hooks/useHistoricalTime.ts';
import { DebugTimeManager } from './DebugTimeManager.tsx';
import { GameId } from '../../convex/aiTown/ids.ts';
import { useServerGame } from '../hooks/serverGame.ts';
import { useScenarioRuntime } from '../hooks/useScenarioRuntime.ts';
import { waitForInput } from '../hooks/sendInput.ts';

export const SHOW_DEBUG_UI = !!import.meta.env.VITE_SHOW_DEBUG_UI;

export default function Game() {
  const convex = useConvex();
  const [selectedElement, setSelectedElement] = useState<{
    kind: 'player';
    id: GameId<'players'>;
  }>();
  const [focusedActivityId, setFocusedActivityId] = useState<string>();
  const [navigationRequest, setNavigationRequest] = useState<CampusNavigationRequest>();
  const [focusMeRequestId, setFocusMeRequestId] = useState(0);
  const [showPlayHelp, setShowPlayHelp] = useState(false);
  const [gameWrapperRef, { width, height }] = useElementSize();

  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const engineId = worldStatus?.engineId;
  const joinWorld = useMutation(api.world.joinWorld);
  const sendWorldInput = useMutation(api.world.sendWorldInput);

  const game = useServerGame(worldId);
  const queriedHumanTokenIdentifier = useQuery(api.world.userStatus, worldId ? { worldId } : 'skip');
  const humanTokenIdentifier = queriedHumanTokenIdentifier ?? null;
  const humanPlayerId = game
    ? [...game.world.players.values()].find((player) => player.human === humanTokenIdentifier)?.id
    : undefined;
  const scenarioRuntime = useScenarioRuntime({
    worldId,
    game,
    humanPlayerId,
    humanTokenIdentifier,
  });

  // Send a periodic heartbeat to our world to keep it alive.
  useWorldHeartbeat();

  const worldState = useQuery(api.world.worldState, worldId ? { worldId } : 'skip');
  const { historicalTime, timeManager } = useHistoricalTime(worldState?.engine);

  const scrollViewRef = useRef<HTMLDivElement>(null);
  const autoJoinKey = useRef<string>();

  useEffect(() => {
    if (
      !worldId ||
      !game ||
      queriedHumanTokenIdentifier === undefined ||
      humanPlayerId ||
      autoJoinKey.current === `${worldId}:${humanTokenIdentifier}`
    ) {
      return;
    }
    autoJoinKey.current = `${worldId}:${humanTokenIdentifier}`;
    void joinWorld({ worldId })
      .then((inputId) => (inputId ? waitForInput(convex, inputId) : undefined))
      .catch((error) => {
        autoJoinKey.current = undefined;
        console.error('Failed to auto-join AI-Uni world', error);
      });
  }, [convex, game, humanPlayerId, humanTokenIdentifier, joinWorld, queriedHumanTokenIdentifier, worldId]);

  useEffect(() => {
    if (!engineId || !humanPlayerId) return;
    const sendKeepAlive = () => {
      void sendWorldInput({
        engineId,
        name: 'keepAlive',
        args: { playerId: humanPlayerId },
      })
        .then((inputId) => waitForInput(convex, inputId))
        .catch((error) => console.error('Failed to keep AI-Uni player alive', error));
    };
    sendKeepAlive();
    const intervalId = window.setInterval(sendKeepAlive, 60_000);
    return () => window.clearInterval(intervalId);
  }, [convex, engineId, humanPlayerId, sendWorldInput]);

  if (!worldId || !engineId || !game) {
    return null;
  }
  return (
    <>
      {SHOW_DEBUG_UI && <DebugTimeManager timeManager={timeManager} width={200} height={100} />}
      <div className="mx-auto w-full max-w grid grid-rows-[240px_1fr] lg:grid-rows-[1fr] lg:grid-cols-[1fr_auto] lg:grow max-w-[1400px] min-h-[480px] game-frame">
        {/* Game area */}
        <div className="relative overflow-hidden bg-brown-900" ref={gameWrapperRef}>
          <div className="absolute inset-0">
            <div className="container">
              <Stage width={width} height={height} options={{ backgroundColor: 0x7ab5ff }}>
                {/* Re-propagate context because contexts are not shared between renderers.
https://github.com/michalochman/react-pixi-fiber/issues/145#issuecomment-531549215 */}
                <ConvexProvider client={convex}>
                  <PixiGame
                    game={game}
                    worldId={worldId}
                    engineId={engineId}
                    width={width}
                    height={height}
                    historicalTime={historicalTime}
                    humanPlayerId={humanPlayerId}
                    scenarioRuntime={scenarioRuntime}
                    navigationRequest={navigationRequest}
                    focusMeRequestId={focusMeRequestId}
                    onFocusActivity={setFocusedActivityId}
                    setSelectedElement={setSelectedElement}
                  />
                </ConvexProvider>
              </Stage>
            </div>
          </div>

          <div className="pointer-events-auto absolute left-3 top-3 z-20 flex flex-wrap gap-2">
            <button
              className="rounded border-2 border-brown-900 bg-brown-100 px-3 py-1.5 text-xs font-bold text-brown-900 shadow disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!humanPlayerId}
              onClick={() => setFocusMeRequestId((value) => value + 1)}
            >
              定位到我
            </button>
            <button
              className="rounded border-2 border-brown-900 bg-brown-100 px-3 py-1.5 text-xs font-bold text-brown-900 shadow"
              onClick={() => setShowPlayHelp((value) => !value)}
            >
              怎么和 NPC 对话？
            </button>
          </div>

          {showPlayHelp && (
            <div className="absolute left-3 top-14 z-20 max-w-xs rounded border-2 border-brown-900 bg-brown-100/95 p-3 text-xs leading-5 text-brown-900 shadow-lg">
              <div className="font-bold">快速上手</div>
              <div>① 你的角色头顶有黄色“你”标记，点“定位到我”可重新居中。</div>
              <div>② 点击地图上的任意 NPC，右侧会出现人物资料。</div>
              <div>③ 点击“发起对话”，等双方走近后，聊天输入框会出现。</div>
              <div>④ 点击校园地面可以移动；日程卡里的“前往”也会自动导航。</div>
            </div>
          )}
        </div>
        {/* Right column area */}
        <div
          className="flex flex-col overflow-y-auto shrink-0 px-4 py-6 sm:px-6 lg:w-96 xl:pr-6 border-t-8 sm:border-t-0 sm:border-l-8 border-brown-900  bg-brown-800 text-brown-100"
          ref={scrollViewRef}
        >
          <CampusTravelStatus scenarioRuntime={scenarioRuntime} />
          <ScheduledCommitmentsPanel
            scenarioRuntime={scenarioRuntime}
            onNavigateToLocation={(locationId) =>
              setNavigationRequest({ locationId, requestId: Date.now() })
            }
          />
          <ScenarioStatusPanel
            humanPlayerId={humanPlayerId}
            scenarioRuntime={scenarioRuntime}
            focusedActivityId={focusedActivityId}
            onFocusActivity={setFocusedActivityId}
            onSelectPlayer={(playerId) => setSelectedElement({ kind: 'player', id: playerId })}
          />
          <PlayerDetails
            worldId={worldId}
            engineId={engineId}
            game={game}
            playerId={selectedElement?.id}
            setSelectedElement={setSelectedElement}
            scrollViewRef={scrollViewRef}
          />
        </div>
      </div>
    </>
  );
}
