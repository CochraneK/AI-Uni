import type { WorldLocationId } from './locations';

export type NormalizedBounds = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

export type WorldZone = {
  id: string;
  locationId: WorldLocationId;
  bounds: NormalizedBounds;
  priority?: number;
  description?: string;
};

export type MapZoneLayout = {
  id: string;
  mapId: string;
  description: string;
  zones: WorldZone[];
};

const zone = (
  id: string,
  locationId: WorldLocationId,
  bounds: NormalizedBounds,
  description: string,
  priority = 0,
): WorldZone => ({ id, locationId, bounds, description, priority });

/**
 * Generic, normalized campus layout used by the current starter map and as a
 * fallback for new university maps. Coordinates are expressed from 0..1 so a
 * map can change resolution without changing scenario logic.
 *
 * A real university template may register a more precise layout later. The
 * stable location IDs remain the same even when player-facing names change.
 */
export const genericCampusZoneLayout: MapZoneLayout = {
  id: 'generic_campus_v1_zones',
  mapId: 'generic_campus_v1',
  description: '通用大学地图的归一化功能区。用于 starter map，也可作为新地图的 fallback。',
  zones: [
    zone(
      'teaching_building_zone',
      'teaching_building',
      { xMin: 0.04, yMin: 0.04, xMax: 0.31, yMax: 0.34 },
      '教学楼与课堂活动区。',
    ),
    zone(
      'library_zone',
      'library',
      { xMin: 0.35, yMin: 0.05, xMax: 0.63, yMax: 0.34 },
      '图书馆、自习与小组学习区。',
    ),
    zone(
      'student_center_zone',
      'student_center',
      { xMin: 0.67, yMin: 0.05, xMax: 0.96, yMax: 0.34 },
      '学生活动、社团与公共服务区。',
    ),
    zone(
      'cafeteria_zone',
      'cafeteria',
      { xMin: 0.05, yMin: 0.39, xMax: 0.31, yMax: 0.68 },
      '食堂与高频日常社交区。',
    ),
    zone(
      'campus_green_zone',
      'campus_green',
      { xMin: 0.35, yMin: 0.38, xMax: 0.65, yMax: 0.69 },
      '校园公共空间、绿地与低压力交流区。',
    ),
    zone(
      'sports_field_zone',
      'sports_field',
      { xMin: 0.69, yMin: 0.39, xMax: 0.96, yMax: 0.70 },
      '运动、锻炼和集体活动区。',
    ),
    zone(
      'dormitory_zone',
      'dormitory',
      { xMin: 0.06, yMin: 0.73, xMax: 0.35, yMax: 0.97 },
      '宿舍与近距离共同生活区。',
    ),
    zone(
      'campus_gate_zone',
      'campus_gate',
      { xMin: 0.40, yMin: 0.82, xMax: 0.61, yMax: 1.0 },
      '校门、到达、离校和会合区域。',
      1,
    ),
  ],
};

export const mapZoneLayouts: Record<string, MapZoneLayout> = {
  [genericCampusZoneLayout.mapId]: genericCampusZoneLayout,
};

export const validateZoneLayout = (layout: MapZoneLayout): string[] => {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const current of layout.zones) {
    if (seen.has(current.id)) issues.push(`Duplicate zone id: ${current.id}`);
    seen.add(current.id);

    const { xMin, yMin, xMax, yMax } = current.bounds;
    const values = [xMin, yMin, xMax, yMax];
    if (values.some((value) => value < 0 || value > 1)) {
      issues.push(`Zone ${current.id} has bounds outside 0..1.`);
    }
    if (xMin >= xMax || yMin >= yMax) {
      issues.push(`Zone ${current.id} has invalid bounds.`);
    }
  }

  return issues;
};

export const assertValidZoneLayout = (layout: MapZoneLayout) => {
  const issues = validateZoneLayout(layout);
  if (issues.length > 0) {
    throw new Error(`Invalid zone layout ${layout.id}: ${issues.join(' ')}`);
  }
};

assertValidZoneLayout(genericCampusZoneLayout);

export const getZoneLayout = (mapId?: string) =>
  (mapId && mapZoneLayouts[mapId]) || genericCampusZoneLayout;

export const findZoneAtPosition = (
  x: number,
  y: number,
  mapWidth: number,
  mapHeight: number,
  mapId?: string,
): WorldZone | undefined => {
  if (mapWidth <= 0 || mapHeight <= 0) return undefined;

  const normalizedX = x / mapWidth;
  const normalizedY = y / mapHeight;
  const candidates = getZoneLayout(mapId).zones.filter(({ bounds }) =>
    normalizedX >= bounds.xMin &&
    normalizedX <= bounds.xMax &&
    normalizedY >= bounds.yMin &&
    normalizedY <= bounds.yMax,
  );

  return candidates.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
};

export const findLocationAtPosition = (
  x: number,
  y: number,
  mapWidth: number,
  mapHeight: number,
  mapId?: string,
): WorldLocationId | undefined => findZoneAtPosition(x, y, mapWidth, mapHeight, mapId)?.locationId;
