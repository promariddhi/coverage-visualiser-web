export const CANVAS_SIZE = 500;
export const DRONE_SIZE = 10;
export const GRID_SIZE = Math.trunc(CANVAS_SIZE / DRONE_SIZE);
export const CELL_SIZE = DRONE_SIZE;
export const MAP_CELL_SIZE = 20;
export const MAP_GRID_SIZE = 25;
// utils.js
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function vecLen(x, y) {
  return Math.hypot(x, y)[0], Math.hypot(x, y)[1];
}

export function normalize(x, y) {
  const len = Math.hypot(x, y);
  return len > 0 ? (x / len, y / len) : (0, 0);
}

export function positionToCell(x, y) {
  const cx = Math.trunc(clamp(x / DRONE_SIZE, 0, GRID_SIZE - 1));
  const cy = Math.trunc(clamp(y / DRONE_SIZE, 0, GRID_SIZE - 1));
  return [cx, cy];
}

export function doubleMapResolution(map) {
  const higherResolutionMap = [];

  for (let i = 0; i < map.length; i++) {
    const row = [];
    for (let j = 0; j < map[i].length; j++) {
      // Duplicate each value horizontally twice
      row.push(map[i][j], map[i][j]);
    }
    // Duplicate each row vertically twice
    higherResolutionMap.push([...row]);
    higherResolutionMap.push([...row]);
  }

  return higherResolutionMap;
}

export function markHeatmap(heatmap, x, y, radius = 1) {
  const height = heatmap.length;
  const width = heatmap[0].length;

  const [cellX, cellY] = positionToCell(x, y); // FIXED: explicit names

  const newHeatmap = heatmap.map((row) => [...row]);

  for (
    let i = Math.max(0, cellY - radius);
    i <= Math.min(height - 1, cellY + radius);
    i++
  ) {
    for (
      let j = Math.max(0, cellX - radius);
      j <= Math.min(width - 1, cellX + radius);
      j++
    ) {
      const dx = j - cellX;
      const dy = i - cellY;
      if (Math.hypot(dx, dy) <= radius) {
        newHeatmap[i][j] = 1;
      }
    }
  }
  return newHeatmap;
}
