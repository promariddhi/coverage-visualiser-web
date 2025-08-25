import {
  doubleMapResolution,
  CELL_SIZE,
  positionToCell,
  clamp,
  GRID_SIZE,
  markHeatmap,
} from "./utils";

const bacterialForaging = (drone, simStore, params, map) => {
  const allDrones = simStore.drones;
  let { x, y, xVel, yVel, swimCount = 0 } = drone;

  const {
    dispersalSteps = 50, // number of timesteps before switching to coverage
    stepSize = 2,
    sensingRadius = 30,
    swimLength = 4,
    tumbleProb = 0.2,
    iteration = 0,
  } = params;

  const mapData = doubleMapResolution(map);
  console.log(iteration);
  // --------------------
  // MOVEMENT DECISION
  // --------------------
  if (iteration < dispersalSteps) {
    // Phase 1: Dispersal — repulsive spread

    let repelX = 0;
    let repelY = 0;
    const repelRadius = params.repelRadius || 40; // how far they push each other
    const repelStrength = params.repelStrength || 1.5;

    for (const other of allDrones) {
      if (other === drone) continue;

      const dx = x - other.x;
      const dy = y - other.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < repelRadius * repelRadius && distSq > 1e-6) {
        const dist = Math.sqrt(distSq);
        // normalize & weight by inverse distance
        repelX += (dx / dist) * (repelStrength / dist);
        repelY += (dy / dist) * (repelStrength / dist);
      }
    }
    xVel += repelX;
    yVel += repelY;
  } else {
    // Phase 2: Coverage (chemotaxis/swim)
    if (swimCount > 0) {
      // Keep swimming in the same direction
      swimCount--;
    } else if (Math.random() < tumbleProb) {
      // Random tumble
      const angle = Math.random() * 2 * Math.PI;
      xVel = Math.cos(angle) * stepSize;
      yVel = Math.sin(angle) * stepSize;
      swimCount = swimLength;
    } else {
      // Sense directions to bias toward unvisited cells
      let bestAngle = null;
      let bestScore = -Infinity;

      for (let k = 0; k < 8; k++) {
        const angle = (k / 8) * 2 * Math.PI;
        const dx = Math.cos(angle) * sensingRadius;
        const dy = Math.sin(angle) * sensingRadius;

        const nx = x + dx;
        const ny = y + dy;

        // Count how many unvisited cells are nearby
        let score = 0;
        for (let rx = -2; rx <= 2; rx++) {
          for (let ry = -2; ry <= 2; ry++) {
            const cx = Math.trunc(nx / CELL_SIZE) + rx;
            const cy = Math.trunc(ny / CELL_SIZE) + ry;
            if (
              mapData?.[cy]?.[cx] === 0 &&
              simStore.heatMap?.[cy]?.[cx] === 0
            ) {
              score++;
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestAngle = angle;
        }
      }

      if (bestAngle !== null && bestScore > 0) {
        xVel = Math.cos(bestAngle) * stepSize;
        yVel = Math.sin(bestAngle) * stepSize;
        swimCount = swimLength;
      }
    }
  }

  // --------------------
  // APPLY MOVEMENT
  // --------------------
  x += xVel;
  y += yVel;

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

    // If both directions collided → undo both
    if (xVel === 0 && yVel === 0) {
      swimCount = 0; // stop swimming if completely blocked
    }
  }

  // Clamp to canvas bounds
  x = clamp(x, 0, GRID_SIZE * CELL_SIZE - 1);
  y = clamp(y, 0, GRID_SIZE * CELL_SIZE - 1);

  // Mark visited
  simStore.setHeatmap((prev) => markHeatmap(prev, x, y));

  return { ...drone, x, y, xVel, yVel, swimCount };
};
export default bacterialForaging;
