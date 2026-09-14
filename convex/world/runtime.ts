import { v } from 'convex/values';
import { query } from '../_generated/server';
import { findLocationAtPosition, findZoneAtPosition, getZoneLayout } from './zones';

export const resolveWorldZone = query({
  args: {
    x: v.number(),
    y: v.number(),
    mapWidth: v.number(),
    mapHeight: v.number(),
    mapId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const zone = findZoneAtPosition(
      args.x,
      args.y,
      args.mapWidth,
      args.mapHeight,
      args.mapId,
    );
    return zone
      ? {
          zoneId: zone.id,
          locationId: zone.locationId,
          description: zone.description,
        }
      : null;
  },
});

export const resolveWorldLocation = query({
  args: {
    x: v.number(),
    y: v.number(),
    mapWidth: v.number(),
    mapHeight: v.number(),
    mapId: v.optional(v.string()),
  },
  handler: async (_ctx, args) =>
    findLocationAtPosition(args.x, args.y, args.mapWidth, args.mapHeight, args.mapId) ?? null,
});

export const getMapZoneLayout = query({
  args: { mapId: v.optional(v.string()) },
  handler: async (_ctx, args) => getZoneLayout(args.mapId),
});
