import type { WorldLocationId } from './locations';
import { getZoneLayout } from './zones';

const MIN_TRAVEL_MINUTES = 5;
const MAX_TRAVEL_MINUTES = 15;
const TRAVEL_STEP_MINUTES = 5;

const zoneCenter = (bounds: {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}) => ({
  x: (bounds.xMin + bounds.xMax) / 2,
  y: (bounds.yMin + bounds.yMax) / 2,
});

/**
 * Estimate ordinary walking time between semantic campus zones.
 *
 * The estimate uses normalized zone geometry rather than hard-coded building
 * names, so a future University Template can register a different zone layout
 * and inherit the same rule. Time is deliberately coarse (5-minute steps) and
 * models ordinary campus transition cost, not precise GPS distance.
 */
export const estimateCampusTravelMinutes = (
  mapId: string | undefined,
  fromLocationId: WorldLocationId,
  toLocationId: WorldLocationId,
): number | undefined => {
  if (fromLocationId === toLocationId) return 0;

  const layout = getZoneLayout(mapId);
  const fromZone = layout.zones.find((zone) => zone.locationId === fromLocationId);
  const toZone = layout.zones.find((zone) => zone.locationId === toLocationId);
  if (!fromZone || !toZone) return undefined;

  const from = zoneCenter(fromZone.bounds);
  const to = zoneCenter(toZone.bounds);
  const normalizedDistance = Math.hypot(to.x - from.x, to.y - from.y);

  // On the generic 48×36 campus this yields roughly 5 minutes between nearby
  // zones, 10 minutes across a substantial part of campus, and 15 minutes for
  // the longest ordinary walks. The cap keeps navigation from consuming an
  // unreasonable fraction of the 08:00–23:00 playable day.
  const rawMinutes = normalizedDistance * 15;
  const steppedMinutes =
    Math.ceil(rawMinutes / TRAVEL_STEP_MINUTES) * TRAVEL_STEP_MINUTES;

  return Math.min(
    MAX_TRAVEL_MINUTES,
    Math.max(MIN_TRAVEL_MINUTES, steppedMinutes),
  );
};

export const campusTravelRules = {
  minimumMinutes: MIN_TRAVEL_MINUTES,
  maximumMinutes: MAX_TRAVEL_MINUTES,
  stepMinutes: TRAVEL_STEP_MINUTES,
} as const;
