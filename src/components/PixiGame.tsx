import * as PIXI from 'pixi.js';
import { useApp } from '@pixi/react';
import { Player, SelectElement } from './Player.tsx';
import { useEffect, useRef, useState } from 'react';
import { PixiStaticMap } from './PixiStaticMap.tsx';
import PixiViewport from './PixiViewport.tsx';
import { Viewport } from 'pixi-viewport';
import { Id } from '../../convex/_generated/dataModel';
import type { GameId } from '../../convex/aiTown/ids';
import type { CampusLocationId } from '../../convex/campus/config';
import { getUniversityScheduleMoment } from '../../convex/campus/schedule';
import { getDayClock, makeDayClockKey } from '../../convex/life/dayClock';
import { zoneAnchors } from '../../data/genericCampus';
import { useSendInput } from '../hooks/sendInput.ts';
import { toastOnError } from '../toasts.ts';
import { DebugPath } from './DebugPath.tsx';
import { PositionIndicator } from './PositionIndicator.tsx';
import CampusActivityHotspots from './CampusActivityHotspots.tsx';
import { SHOW_DEBUG_UI } from './Game.tsx';
import { ServerGame } from '../hooks/serverGame.ts';
import type { ScenarioRuntimeView } from '../hooks/useScenarioRuntime.ts';

export type CampusNavigationRequest = {
  locationId: CampusLocationId;
  requestId: number;
};

export const PixiGame = (props: {
  worldId: Id<'worlds'>;
  engineId: Id<'engines'>;
  game: ServerGame;
  historicalTime: number | undefined;
  width: number;
  height: number;
  humanPlayerId?: GameId<'players'>;
  scenarioRuntime: ScenarioRuntimeView;
  navigationRequest?: CampusNavigationRequest;
  focusMeRequestId?: number;
  onFocusActivity: (activityId: string) => void;
  setSelectedElement: SelectElement;
}) => {
  // PIXI setup.
  const pixiApp = useApp();
  const viewportRef = useRef<Viewport | undefined>();
  const moveTo = useSendInput(props.engineId, 'moveTo');

  // Interaction for clicking on the world to navigate.
  const dragStart = useRef<{ screenX: number; screenY: number } | null>(null);
  const onMapPointerDown = (e: any) => {
    // https://pixijs.download/dev/docs/PIXI.FederatedPointerEvent.html
    dragStart.current = { screenX: e.screenX, screenY: e.screenY };
  };

  const [lastDestination, setLastDestination] = useState<{
    x: number;
    y: number;
    t: number;
  } | null>(null);

  const navigateTo = async (destination: { x: number; y: number }) => {
    if (!props.humanPlayerId) return;
    setLastDestination({ t: Date.now(), ...destination });
    console.log(`Moving to ${JSON.stringify(destination)}`);
    await toastOnError(moveTo({ playerId: props.humanPlayerId, destination }));
  };

  const onMapPointerUp = async (e: any) => {
    if (dragStart.current) {
      const { screenX, screenY } = dragStart.current;
      dragStart.current = null;
      const [dx, dy] = [screenX - e.screenX, screenY - e.screenY];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        console.log(`Skipping navigation on drag event (${dist}px)`);
        return;
      }
    }
    if (!props.humanPlayerId) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const gameSpacePx = viewport.toWorld(e.screenX, e.screenY);
    const tileDim = props.game.worldMap.tileDim;
    const roundedTiles = {
      x: Math.floor(gameSpacePx.x / tileDim),
      y: Math.floor(gameSpacePx.y / tileDim),
    };
    await navigateTo(roundedTiles);
  };

  const { width, height, tileDim } = props.game.worldMap;
  const players = [...props.game.world.players.values()];
  const isGenericCampus = props.game.worldMap.tileSetUrl.includes('generic-campus-v1.png');
  const showActivityHotspots =
    Boolean(props.humanPlayerId) && isGenericCampus && !props.scenarioRuntime.activeScenario;
  const profile = props.scenarioRuntime.profile;
  const dayKey = profile ? makeDayClockKey(profile) : undefined;
  const dayClock = profile && dayKey ? getDayClock(profile.state, dayKey) : undefined;
  const recommendedLocationId = dayClock
    ? getUniversityScheduleMoment(dayClock.minute).current?.location
    : undefined;
  const currentLocationId = props.scenarioRuntime.locationId as CampusLocationId | undefined;

  const focusHumanPlayer = () => {
    if (!viewportRef.current || props.humanPlayerId === undefined) return;
    const humanPlayer = props.game.world.players.get(props.humanPlayerId);
    if (!humanPlayer) return;
    viewportRef.current.animate({
      position: new PIXI.Point(
        humanPlayer.position.x * tileDim + tileDim / 2,
        humanPlayer.position.y * tileDim + tileDim / 2,
      ),
      scale: 1.5,
      time: 300,
    });
  };

  // Zoom on the user’s avatar when it is created.
  useEffect(() => {
    focusHumanPlayer();
  }, [props.humanPlayerId]);

  // Explicit "locate me" requests from the normal DOM UI. Keeping this as a
  // request id means the same action can be repeated even when the player id
  // and position object references have not changed.
  useEffect(() => {
    if (!props.focusMeRequestId) return;
    focusHumanPlayer();
  }, [props.focusMeRequestId]);

  // Fixed commitments and future calendar items can ask the map to navigate to a
  // semantic campus place. For generic_campus_v1 we reuse the same tested zone
  // anchors used by map regression tests. University templates can later supply
  // their own location anchors through the same semantic contract.
  useEffect(() => {
    const request = props.navigationRequest;
    if (!request || !isGenericCampus || !props.humanPlayerId) return;
    const anchor = zoneAnchors[request.locationId as keyof typeof zoneAnchors];
    if (!anchor) return;
    void navigateTo(anchor);
    // requestId is intentionally the trigger; repeated requests to the same
    // location should still be able to issue a fresh move command.
  }, [props.navigationRequest?.requestId]);

  return (
    <PixiViewport
      app={pixiApp}
      screenWidth={props.width}
      screenHeight={props.height}
      worldWidth={width * tileDim}
      worldHeight={height * tileDim}
      viewportRef={viewportRef}
    >
      <PixiStaticMap
        map={props.game.worldMap}
        onpointerup={onMapPointerUp}
        onpointerdown={onMapPointerDown}
      />
      {showActivityHotspots && (
        <CampusActivityHotspots
          tileDim={tileDim}
          currentLocationId={currentLocationId}
          recommendedLocationId={recommendedLocationId}
          onNavigate={(interactable, destination) => {
            props.onFocusActivity(interactable.activityId);
            void navigateTo(destination);
          }}
        />
      )}
      {players.map(
        (p) =>
          // Only show the path for the human player in non-debug mode.
          (SHOW_DEBUG_UI || p.id === props.humanPlayerId) && (
            <DebugPath key={`path-${p.id}`} player={p} tileDim={tileDim} />
          ),
      )}
      {lastDestination && <PositionIndicator destination={lastDestination} tileDim={tileDim} />}
      {players.map((p) => (
        <Player
          key={`player-${p.id}`}
          game={props.game}
          player={p}
          isViewer={p.id === props.humanPlayerId}
          onClick={props.setSelectedElement}
          historicalTime={props.historicalTime}
        />
      ))}
    </PixiViewport>
  );
};
export default PixiGame;
