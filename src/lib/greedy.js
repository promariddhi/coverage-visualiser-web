import {
  GRID_SIZE,
  positionToCell,
  CELL_SIZE,
  vecLen,
  normalize,
  clamp,
  doubleMapResolution,
  markHeatmap,
} from "./utils";

const greedyCoverage = (drone, simStore, params, map) => {
  const allDrones = simStore.drones;
  let { x, y, xVel, yVel } = drone;
  const mapData = doubleMapResolution(map);
  const target = nearestUnvisited_h(
    x,
    y,
    simStore.heatMap,
    mapData,
    params.sensingRadius
  );

  if (target != null) {
    let dx = target[0] - x;
    let dy = target[1] - y;
    const d = Math.hypot(dx, dy);
    if (d > 1e-6) {
      const [nx, ny] = [dx / d, dy / d];
      xVel = nx * params.speed;
      yVel = ny * params.speed;
    }
  } else {
    if (Math.random() < 0.05) {
      xVel += Math.random() - 0.5;
      yVel += Math.random() - 0.5;
    }
    xVel *= 0.9;
    yVel *= 0.9;

    const speed = vecLen(xVel, yVel);
    if (speed > params.speed) {
      const [nx, ny] = normalize(xVel, yVel);
      xVel = nx * params.speed;
      yVel = ny * params.speed;
    }
  }

  x += xVel;
  y += yVel;

  const [vx, vy] = avoidOtherDrones_h(drone, allDrones);

  x += vx;
  y += vy;

  // WALL: stop at walls
  // WALL COLLISION CHECK (with sliding)
  const [cellX, cellY] = positionToCell(x, y);

  if (mapData?.[cellY]?.[cellX] === 1) {
    // Check if horizontal move caused collision
    const [prevCellX, prevCellY] = positionToCell(x - xVel, y);
    if (mapData?.[prevCellY]?.[prevCellX] !== 1) {
      // Only X movement caused collision → stop X
      x -= xVel;
      xVel = 0;
    }

    // Check if vertical move caused collision
    const [prevCellX2, prevCellY2] = positionToCell(x, y - yVel);
    if (mapData?.[prevCellY2]?.[prevCellX2] !== 1) {
      // Only Y movement caused collision → stop Y
      y -= yVel;
      yVel = 0;
    }
  }

  x = clamp(x, 0, GRID_SIZE * CELL_SIZE - 1); // FIXED: clamp to canvas pixels
  y = clamp(y, 0, GRID_SIZE * CELL_SIZE - 1);

  // FIXED: use prev instead of stale closure
  simStore.setHeatmap((prev) => markHeatmap(prev, x, y));

  return { ...drone, x, y, xVel, yVel };
};

export default greedyCoverage;
// ----------------- HELPERS -----------------

function nearestUnvisited_h(x, y, heatMap, mapData, maxSearchRadius = null) {
  const [cx, cy] = positionToCell(x, y); // FIXED: return [col, row]
  let best = null;
  let bestDist = Infinity;

  let maxCells = GRID_SIZE;
  if (maxSearchRadius !== null) {
    maxCells = Math.ceil(maxSearchRadius / CELL_SIZE);
  }

  for (let ring = 0; ring <= maxCells; ring++) {
    let foundAny = false;

    const y0 = Math.max(0, cy - ring);
    const y1 = Math.min(GRID_SIZE - 1, cy + ring);
    const x0 = Math.max(0, cx - ring);
    const x1 = Math.min(GRID_SIZE - 1, cx + ring);

    for (let ny = y0; ny <= y1; ny++) {
      for (let nx of [x0, x1]) {
        if (heatMap[ny][nx] === 0 && (!mapData || mapData[ny][nx] !== 1)) {
          const px = (nx + 0.5) * CELL_SIZE;
          const py = (ny + 0.5) * CELL_SIZE;
          const d = Math.hypot(x - px, y - py); // FIXED: compare pixels to pixels
          if (
            (maxSearchRadius === null || d <= maxSearchRadius) &&
            d < bestDist
          ) {
            bestDist = d;
            best = [px, py];
            foundAny = true;
          }
        }
      }
    }

    for (let nx = x0; nx <= x1; nx++) {
      for (let ny of [y0, y1]) {
        if (heatMap[ny][nx] === 0 && (!mapData || mapData[ny][nx] !== 1)) {
          const px = (nx + 0.5) * CELL_SIZE;
          const py = (ny + 0.5) * CELL_SIZE;
          const d = Math.hypot(x - px, y - py);
          if (
            (maxSearchRadius === null || d <= maxSearchRadius) &&
            d < bestDist
          ) {
            bestDist = d;
            best = [px, py];
            foundAny = true;
          }
        }
      }
    }

    if (foundAny) return best;
  }
  return best;
}

function avoidOtherDrones_h(
  drone,
  allDrones,
  avoidRadius = 30,
  avoidStrength = 0.5
) {
  let dx = 0,
    dy = 0;
  let count = 0;

  for (const other of allDrones) {
    if (other === drone) continue;
    const distX = drone.x - other.x;
    const distY = drone.y - other.y;
    const dist = Math.hypot(distX, distY);

    if (dist < avoidRadius && dist > 1e-6) {
      dx += distX / dist; // normalized away vector
      dy += distY / dist;
      count++;
    }
  }

  if (count > 0) {
    dx /= count;
    dy /= count;
    return [dx * avoidStrength, dy * avoidStrength];
  }

  return [0, 0];
}
