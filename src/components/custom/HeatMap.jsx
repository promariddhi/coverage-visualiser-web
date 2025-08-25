import React, { useEffect, useRef } from "react";

import { GRID_SIZE, DRONE_SIZE, CANVAS_SIZE } from "@/src/lib/utils";

const HeatmapOverlay = ({ visited, showMap }) => {
  const canvasRef = useRef(null);
  const canvasSize = CANVAS_SIZE;
  const cellSize = DRONE_SIZE;
  const gridSize = GRID_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Find maximum visit count (for normalization)
    let maxVisited = 0;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (visited[i][j] > maxVisited) maxVisited = visited[i][j];
      }
    }

    // Draw each cell
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = j * cellSize;
        const y = i * cellSize;
        const count = visited[i][j];

        if (count > 0) {
          // Blue with transparency: rgba(0, 0, 255, alpha)
          ctx.fillStyle =
            count > 0 ? "rgba(0, 200, 0, 1)" : "rgba(0, 200, 0, 0)";

          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
  }, [visited, gridSize, cellSize, canvasSize]);

  return showMap ? (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="absolute top-10 left-0 pointer-events-none"
    />
  ) : null;
};

export default HeatmapOverlay;
