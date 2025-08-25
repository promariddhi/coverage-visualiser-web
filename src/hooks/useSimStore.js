import { useState } from "react";

import greedyCoverage from "../lib/greedy";
import beeColony from "../lib/beeColony";
import bacterialForaging from "../lib/bacterialForaging";

import { CANVAS_SIZE, GRID_SIZE } from "../lib/utils";

function drone(x, y) {
  return {
    x: x,
    y: y,
    xVel: Math.random() * 2 - 1,
    yVel: Math.random() * 2 - 1,
  };
}

export function nextStep(algorithm, simStore, UIStore) {
  const algos = {
    "Bacterial Foraging": bacterialForaging,
    "Bee Colony": beeColony,
    "Greedy Coverage": greedyCoverage,
  };
  const newDronesState = Array.from(
    { length: simStore.drones.length },
    (_, i) =>
      algos[algorithm](
        simStore.drones[i],
        simStore,
        UIStore.params[algorithm],
        UIStore.mapData
      )
  );
  simStore.setDrones(newDronesState);
}

export function useSimStore(droneCount) {
  const [heatMap, setHeatmap] = useState(() =>
    Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(0))
  );

  const [drones, setDrones] = useState(spawnDrones(droneCount));
  return {
    heatMap,
    setHeatmap,
    drones,
    setDrones,
  };
}

export function spawnDrones(droneCount) {
  return Array.from({ length: droneCount }, () =>
    drone(
      CANVAS_SIZE / 2 + Math.random() * 30 - 15, // x around center
      CANVAS_SIZE / 2 + Math.random() * 30 - 15 // y near bottom
    )
  );
}

export function clearHeatmap(simStore) {
  simStore.setHeatmap(
    Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(0))
  );
}
