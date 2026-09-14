// Original AI-Uni generic campus map.
//
// This map is generated from compact layout primitives instead of storing a
// giant hand-edited tile array. Coordinates are tile-space [x][y], matching the
// inherited AI Town WorldMap format.

export const tilesetpath = '/ai-uni/assets/generic-campus-v1.png';
export const tiledim = 32;
export const screenxtiles = 48;
export const screenytiles = 36;
export const tilesetpxw = 128;
export const tilesetpxh = 128;
export const mapwidth = screenxtiles;
export const mapheight = screenytiles;

const TILE = {
  grass: 0,
  path: 1,
  plaza: 2,
  water: 3,
  teachingWall: 4,
  libraryWall: 5,
  studentCenterWall: 6,
  sports: 7,
  dormWall: 8,
  cafeteriaWall: 9,
  tree: 10,
  gate: 11,
  road: 12,
  bench: 13,
  flower: 14,
  indoorFloor: 15,
} as const;

const createLayer = (fill = -1) =>
  Array.from({ length: mapwidth }, () => Array.from({ length: mapheight }, () => fill));

const background = createLayer(TILE.grass);
const objects = createLayer();

const fillRect = (
  layer: number[][],
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  tile: number,
) => {
  for (let x = xMin; x <= xMax; x += 1) {
    for (let y = yMin; y <= yMax; y += 1) {
      layer[x][y] = tile;
    }
  }
};

const setTile = (layer: number[][], x: number, y: number, tile: number) => {
  layer[x][y] = tile;
};

const drawBuilding = (options: {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  wallTile: number;
  entrance: 'top' | 'bottom';
  doorXs: number[];
}) => {
  const { xMin, yMin, xMax, yMax, wallTile, entrance, doorXs } = options;
  fillRect(background, xMin, yMin, xMax, yMax, TILE.indoorFloor);

  for (let x = xMin; x <= xMax; x += 1) {
    setTile(objects, x, yMin, wallTile);
    setTile(objects, x, yMax, wallTile);
  }
  for (let y = yMin; y <= yMax; y += 1) {
    setTile(objects, xMin, y, wallTile);
    setTile(objects, xMax, y, wallTile);
  }

  const doorY = entrance === 'top' ? yMin : yMax;
  for (const x of doorXs) {
    setTile(objects, x, doorY, -1);
    setTile(background, x, doorY, TILE.path);
  }
};

// Two campus spines keep every major place connected while leaving generous
// green space between buildings.
fillRect(background, 0, 10, 47, 13, TILE.path);
fillRect(background, 0, 24, 47, 26, TILE.path);
fillRect(background, 22, 0, 25, 35, TILE.path);

// North academic cluster.
drawBuilding({
  xMin: 1,
  yMin: 1,
  xMax: 14,
  yMax: 9,
  wallTile: TILE.teachingWall,
  entrance: 'bottom',
  doorXs: [7, 8],
});
drawBuilding({
  xMin: 17,
  yMin: 1,
  xMax: 30,
  yMax: 9,
  wallTile: TILE.libraryWall,
  entrance: 'bottom',
  doorXs: [23, 24],
});
drawBuilding({
  xMin: 33,
  yMin: 1,
  xMax: 46,
  yMax: 9,
  wallTile: TILE.studentCenterWall,
  entrance: 'bottom',
  doorXs: [39, 40],
});

// Everyday-life cluster.
drawBuilding({
  xMin: 1,
  yMin: 14,
  xMax: 14,
  yMax: 22,
  wallTile: TILE.cafeteriaWall,
  entrance: 'top',
  doorXs: [7, 8],
});

// Central green: open lawn, a small pond, benches and flowers. Water is on the
// object layer so it is visibly present and non-walkable without a special
// collision system.
fillRect(background, 17, 14, 31, 23, TILE.grass);
fillRect(objects, 19, 17, 22, 19, TILE.water);
setTile(objects, 27, 17, TILE.bench);
setTile(objects, 28, 21, TILE.bench);
setTile(background, 18, 21, TILE.flower);
setTile(background, 30, 15, TILE.flower);

// Sports field remains walkable so NPCs can wander and talk there.
fillRect(background, 34, 14, 46, 23, TILE.sports);

// Residential cluster.
drawBuilding({
  xMin: 2,
  yMin: 27,
  xMax: 16,
  yMax: 34,
  wallTile: TILE.dormWall,
  entrance: 'top',
  doorXs: [9, 10],
});

// Gate / arrival plaza and the road outside it.
fillRect(background, 20, 27, 28, 35, TILE.plaza);
fillRect(background, 0, 35, 47, 35, TILE.road);
setTile(objects, 20, 33, TILE.gate);
setTile(objects, 28, 33, TILE.gate);

// Sparse landscaping. These are collision objects and are intentionally kept
// out of the main corridors and zone anchor points.
for (const [x, y] of [
  [0, 0], [15, 2], [32, 2], [47, 0],
  [16, 15], [32, 15], [0, 20], [47, 20],
  [1, 28], [18, 30], [31, 30], [46, 29],
] as Array<[number, number]>) {
  setTile(objects, x, y, TILE.tree);
}

export const zoneAnchors = {
  teaching_building: { x: 8, y: 8 },
  library: { x: 24, y: 8 },
  student_center: { x: 40, y: 8 },
  cafeteria: { x: 8, y: 15 },
  campus_green: { x: 25, y: 19 },
  sports_field: { x: 40, y: 19 },
  dormitory: { x: 10, y: 28 },
  campus_gate: { x: 24, y: 33 },
} as const;

export const bgtiles = [background];
export const objmap = [objects];
export const animatedsprites: Array<never> = [];
