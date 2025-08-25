import { MAP_GRID_SIZE } from "./utils";

// Preset maps data
const presetMaps = {
  empty: {
    name: "Empty Grid",
    data: Array(MAP_GRID_SIZE)
      .fill()
      .map(() => Array(MAP_GRID_SIZE).fill(0)),
  },
  obstacles: {
    name: "Random Obstacles",
    data: Array(MAP_GRID_SIZE)
      .fill()
      .map(() =>
        Array(MAP_GRID_SIZE)
          .fill()
          .map(() => (Math.random() < 0.15 ? 1 : 0))
      ),
  },
  maze: {
    name: "Simple Maze",
    data: Array(MAP_GRID_SIZE)
      .fill()
      .map((_, i) =>
        Array(MAP_GRID_SIZE)
          .fill()
          .map((_, j) => {
            if (i === 0 || i === 19 || j === 0 || j === 19) return 1;
            if (i === 5 && j > 2 && j < 17) return 1;
            if (i === 10 && j > 3 && j < 16) return 1;
            if (i === 15 && j > 2 && j < 17) return 1;
            if (j === 7 && i > 5 && i < 10) return 1;
            if (j === 12 && i > 10 && i < 15) return 1;
            return 0;
          })
      ),
  },
};
export default presetMaps;
