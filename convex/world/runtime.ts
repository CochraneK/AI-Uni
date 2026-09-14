import { v } from 'convex/values';
import { query } from '../_generated/server';
import { playerId } from '../aiTown/ids';
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

export const resolvePlayerWorldZone = query({
  args: {
    worldId: v.id('worlds'),
    playerId,
    mapId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const world = await ctx.db.get(args.worldId);
    if (!world) throw new Error(`World not found: ${args.worldId}`);

    const map = await ctx.db
      .query('maps')
      .withIndex('worldId', (q) => q.eq('worldId', args.worldId))
      .first();
    if (!map) throw new Error(`Map not found for world: ${args.worldId}`);

    const player = world.players.find((candidate) => candidate.id === args.playerId);
    if (!player) return null;

    const zone = findZoneAtPosition(
      player.position.x,
      player.position.y,
      map.width,
      map.height,
      args.mapId,
    );

    return {
      playerId: player.id,
      position: player.position,
      zone: zone
        ? {
            zoneId: zone.id,
            locationId: zone.locationId,
            description: zone.description,
          }
        : null,
    };
  },
});

export const getMapZoneLayout = query({
  args: { mapId: v.optional(v.string()) },
  handler: async (_ctx, args) => getZoneLayout(args.mapId),
});
