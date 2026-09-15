import { PixiComponent, applyDefaultProps } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { AnimatedSprite, WorldMap } from '../../convex/aiTown/worldMap';
import * as campfire from '../../data/animations/campfire.json';
import * as gentlesparkle from '../../data/animations/gentlesparkle.json';
import * as gentlewaterfall from '../../data/animations/gentlewaterfall.json';
import * as gentlesplash from '../../data/animations/gentlesplash.json';
import * as windmill from '../../data/animations/windmill.json';

const animations = {
  'campfire.json': { spritesheet: campfire, url: '/ai-uni/assets/spritesheets/campfire.png' },
  'gentlesparkle.json': {
    spritesheet: gentlesparkle,
    url: '/ai-uni/assets/spritesheets/gentlesparkle32.png',
  },
  'gentlewaterfall.json': {
    spritesheet: gentlewaterfall,
    url: '/ai-uni/assets/spritesheets/gentlewaterfall32.png',
  },
  'windmill.json': { spritesheet: windmill, url: '/ai-uni/assets/spritesheets/windmill.png' },
  'gentlesplash.json': {
    spritesheet: gentlesplash,
    url: '/ai-uni/assets/spritesheets/gentlewaterfall32.png',
  },
};

const GENERIC_CAMPUS_TILESET_MARKER = 'generic-campus-v1.png';

export function isGenericCampusMap(map: Pick<WorldMap, 'tileSetUrl'>) {
  return map.tileSetUrl.includes(GENERIC_CAMPUS_TILESET_MARKER);
}

const genericTileColors: Record<number, number> = {
  0: 0x79b86d, // grass
  1: 0xd8c89f, // path
  2: 0xc8c3b8, // plaza
  3: 0x5aa9e6, // water
  4: 0xc86f5d, // teaching building wall
  5: 0x7e91bd, // library wall
  6: 0xb986c3, // student center wall
  7: 0x4f9862, // sports field
  8: 0xd69567, // dorm wall
  9: 0xd4ad55, // cafeteria wall
  12: 0x4c5560, // road
  15: 0xe9e1cf, // indoor floor
};

function drawBaseTile(
  graphics: PIXI.Graphics,
  tileIndex: number,
  x: number,
  y: number,
  tileDim: number,
) {
  const color = genericTileColors[tileIndex] ?? 0x8bbf7a;
  graphics.beginFill(color);
  graphics.drawRect(x, y, tileDim, tileDim);
  graphics.endFill();

  // A very light grid makes the simple fallback readable while keeping the
  // pixel-map feel. This renderer intentionally uses no external image asset.
  graphics.lineStyle(1, 0x000000, 0.06);
  graphics.drawRect(x, y, tileDim, tileDim);
}

function drawObjectTile(
  graphics: PIXI.Graphics,
  tileIndex: number,
  x: number,
  y: number,
  tileDim: number,
) {
  const cx = x + tileDim / 2;
  const cy = y + tileDim / 2;

  if (tileIndex in genericTileColors) {
    drawBaseTile(graphics, tileIndex, x, y, tileDim);
    return;
  }

  switch (tileIndex) {
    case 10: // tree
      graphics.beginFill(0x6f4b2d);
      graphics.drawRect(cx - tileDim * 0.08, cy, tileDim * 0.16, tileDim * 0.3);
      graphics.endFill();
      graphics.beginFill(0x2f7d43);
      graphics.drawCircle(cx, cy - tileDim * 0.08, tileDim * 0.3);
      graphics.endFill();
      break;
    case 11: // gate
      graphics.beginFill(0x3f4650);
      graphics.drawRect(x + tileDim * 0.18, y + tileDim * 0.08, tileDim * 0.14, tileDim * 0.84);
      graphics.drawRect(x + tileDim * 0.68, y + tileDim * 0.08, tileDim * 0.14, tileDim * 0.84);
      graphics.drawRect(x + tileDim * 0.18, y + tileDim * 0.14, tileDim * 0.64, tileDim * 0.12);
      graphics.endFill();
      break;
    case 13: // bench
      graphics.beginFill(0x7b4f2c);
      graphics.drawRoundedRect(
        x + tileDim * 0.16,
        y + tileDim * 0.42,
        tileDim * 0.68,
        tileDim * 0.2,
        3,
      );
      graphics.endFill();
      break;
    case 14: // flower
      graphics.beginFill(0xf4df66);
      graphics.drawCircle(cx, cy, tileDim * 0.08);
      graphics.endFill();
      graphics.beginFill(0xe87891);
      graphics.drawCircle(cx - tileDim * 0.1, cy, tileDim * 0.09);
      graphics.drawCircle(cx + tileDim * 0.1, cy, tileDim * 0.09);
      graphics.drawCircle(cx, cy - tileDim * 0.1, tileDim * 0.09);
      graphics.drawCircle(cx, cy + tileDim * 0.1, tileDim * 0.09);
      graphics.endFill();
      break;
    default:
      break;
  }
}

function renderGenericCampus(map: WorldMap) {
  const container = new PIXI.Container();
  const backgroundGraphics = new PIXI.Graphics();
  const objectGraphics = new PIXI.Graphics();
  const width = map.bgTiles[0].length;
  const height = map.bgTiles[0][0].length;

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const xPx = x * map.tileDim;
      const yPx = y * map.tileDim;
      for (const layer of map.bgTiles) {
        const tileIndex = layer[x][y];
        if (tileIndex !== -1) {
          drawBaseTile(backgroundGraphics, tileIndex, xPx, yPx, map.tileDim);
        }
      }
      for (const layer of map.objectTiles) {
        const tileIndex = layer[x][y];
        if (tileIndex !== -1) {
          drawObjectTile(objectGraphics, tileIndex, xPx, yPx, map.tileDim);
        }
      }
    }
  }

  container.addChild(backgroundGraphics, objectGraphics);
  container.interactive = true;
  container.hitArea = new PIXI.Rectangle(0, 0, width * map.tileDim, height * map.tileDim);
  return container;
}

function renderTexturedMap(map: WorldMap) {
  const numxtiles = Math.floor(map.tileSetDimX / map.tileDim);
  const numytiles = Math.floor(map.tileSetDimY / map.tileDim);
  const bt = PIXI.BaseTexture.from(map.tileSetUrl, {
    scaleMode: PIXI.SCALE_MODES.NEAREST,
  });

  const tiles: PIXI.Texture[] = [];
  for (let x = 0; x < numxtiles; x++) {
    for (let y = 0; y < numytiles; y++) {
      tiles[x + y * numxtiles] = new PIXI.Texture(
        bt,
        new PIXI.Rectangle(x * map.tileDim, y * map.tileDim, map.tileDim, map.tileDim),
      );
    }
  }
  const screenxtiles = map.bgTiles[0].length;
  const screenytiles = map.bgTiles[0][0].length;

  const container = new PIXI.Container();
  const allLayers = [...map.bgTiles, ...map.objectTiles];

  for (let i = 0; i < screenxtiles * screenytiles; i++) {
    const x = i % screenxtiles;
    const y = Math.floor(i / screenxtiles);
    const xPx = x * map.tileDim;
    const yPx = y * map.tileDim;

    for (const layer of allLayers) {
      const tileIndex = layer[x][y];
      if (tileIndex === -1) continue;
      const texture = tiles[tileIndex];
      if (!texture) continue;
      const ctile = new PIXI.Sprite(texture);
      ctile.x = xPx;
      ctile.y = yPx;
      container.addChild(ctile);
    }
  }

  const spritesBySheet = new Map<string, AnimatedSprite[]>();
  for (const sprite of map.animatedSprites) {
    const sheet = sprite.sheet;
    if (!spritesBySheet.has(sheet)) {
      spritesBySheet.set(sheet, []);
    }
    spritesBySheet.get(sheet)!.push(sprite);
  }
  for (const [sheet, sprites] of spritesBySheet.entries()) {
    const animation = (animations as any)[sheet];
    if (!animation) {
      console.error('Could not find animation', sheet);
      continue;
    }
    const { spritesheet, url } = animation;
    const texture = PIXI.BaseTexture.from(url, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });
    const spriteSheet = new PIXI.Spritesheet(texture, spritesheet);
    spriteSheet.parse().then(() => {
      for (const sprite of sprites) {
        const pixiAnimation = spriteSheet.animations[sprite.animation];
        if (!pixiAnimation) {
          console.error('Failed to load animation', sprite);
          continue;
        }
        const pixiSprite = new PIXI.AnimatedSprite(pixiAnimation);
        pixiSprite.animationSpeed = 0.1;
        pixiSprite.autoUpdate = true;
        pixiSprite.x = sprite.x;
        pixiSprite.y = sprite.y;
        pixiSprite.width = sprite.w;
        pixiSprite.height = sprite.h;
        container.addChild(pixiSprite);
        pixiSprite.play();
      }
    });
  }

  container.interactive = true;
  container.hitArea = new PIXI.Rectangle(
    0,
    0,
    screenxtiles * map.tileDim,
    screenytiles * map.tileDim,
  );
  return container;
}

export const PixiStaticMap = PixiComponent('StaticMap', {
  create: (props: { map: WorldMap; [k: string]: any }) => {
    return isGenericCampusMap(props.map)
      ? renderGenericCampus(props.map)
      : renderTexturedMap(props.map);
  },

  applyProps: (instance, oldProps, newProps) => {
    applyDefaultProps(instance, oldProps, newProps);
  },
});
