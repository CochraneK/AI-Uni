import {
  bgtiles,
  mapheight,
  mapwidth,
  objmap,
  zoneAnchors,
} from './genericCampus';
import { genericCampusInteractables } from './genericCampusInteractables';
import { campusActivityById } from '../convex/life/activities';
import { findLocationAtPosition } from '../convex/world/zones';

const objectLayer = objmap[0];
const isWalkable = (x: number, y: number) =>
  x >= 0 && y >= 0 && x < mapwidth && y < mapheight && objectLayer[x][y] === -1;

const reachableFrom = (start: { x: number; y: number }) => {
  const key = (x: number, y: number) => `${x},${y}`;
  const seen = new Set<string>([key(start.x, start.y)]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const x = current.x + dx;
      const y = current.y + dy;
      const id = key(x, y);
      if (!isWalkable(x, y) || seen.has(id)) continue;
      seen.add(id);
      queue.push({ x, y });
    }
  }
  return seen;
};

describe('generic_campus_v1 map', () => {
  test('has consistent WorldMap dimensions and valid tile indexes', () => {
    expect(bgtiles).toHaveLength(1);
    expect(objmap).toHaveLength(1);
    expect(bgtiles[0]).toHaveLength(mapwidth);
    expect(objmap[0]).toHaveLength(mapwidth);

    for (let x = 0; x < mapwidth; x += 1) {
      expect(bgtiles[0][x]).toHaveLength(mapheight);
      expect(objmap[0][x]).toHaveLength(mapheight);
      for (let y = 0; y < mapheight; y += 1) {
        expect(bgtiles[0][x][y]).toBeGreaterThanOrEqual(-1);
        expect(bgtiles[0][x][y]).toBeLessThan(16);
        expect(objmap[0][x][y]).toBeGreaterThanOrEqual(-1);
        expect(objmap[0][x][y]).toBeLessThan(16);
      }
    }
  });

  test('keeps every semantic zone anchor walkable and aligned with its WorldLocationId', () => {
    for (const [locationId, anchor] of Object.entries(zoneAnchors)) {
      expect(isWalkable(anchor.x, anchor.y)).toBe(true);
      expect(
        findLocationAtPosition(
          anchor.x,
          anchor.y,
          mapwidth,
          mapheight,
          'generic_campus_v1',
        ),
      ).toBe(locationId);
    }
  });

  test('connects every campus zone to the gate through walkable tiles', () => {
    const reachable = reachableFrom(zoneAnchors.campus_gate);
    for (const anchor of Object.values(zoneAnchors)) {
      expect(reachable.has(`${anchor.x},${anchor.y}`)).toBe(true);
    }
  });

  test('keeps every activity object walkable, reachable and inside its semantic zone', () => {
    const reachable = reachableFrom(zoneAnchors.campus_gate);
    const interactionIds = new Set<string>();
    const activityIds = new Set<string>();

    for (const interactable of genericCampusInteractables) {
      expect(interactionIds.has(interactable.id)).toBe(false);
      interactionIds.add(interactable.id);

      expect(activityIds.has(interactable.activityId)).toBe(false);
      activityIds.add(interactable.activityId);

      const activity = campusActivityById[interactable.activityId];
      expect(activity).toBeDefined();
      expect(activity.locationId).toBe(interactable.locationId);
      expect(isWalkable(interactable.anchor.x, interactable.anchor.y)).toBe(true);
      expect(reachable.has(`${interactable.anchor.x},${interactable.anchor.y}`)).toBe(true);
      expect(
        findLocationAtPosition(
          interactable.anchor.x,
          interactable.anchor.y,
          mapwidth,
          mapheight,
          'generic_campus_v1',
        ),
      ).toBe(interactable.locationId);
    }

    expect(genericCampusInteractables).toHaveLength(16);
    expect(activityIds.size).toBe(16);
  });

  test('leaves most of the campus traversable rather than turning scenery into collision walls', () => {
    let walkable = 0;
    for (let x = 0; x < mapwidth; x += 1) {
      for (let y = 0; y < mapheight; y += 1) {
        if (isWalkable(x, y)) walkable += 1;
      }
    }
    expect(walkable / (mapwidth * mapheight)).toBeGreaterThan(0.7);
  });
});
