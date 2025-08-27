import React, { useEffect, useRef } from "react";

const MapLayer = ({ mapData }) => {
  const canvasRef = useRef(null);
  const CELL_SIZE = 20; // each cell is 20x20 pixels
  const GRID_SIZE = 25; // 25x25 cells
  const CANVAS_SIZE = CELL_SIZE * GRID_SIZE; // 500x500

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Clear previous drawing
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw only the cells that have a 1
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (mapData[row][col] === 1) {
          ctx.fillStyle = "#374151"; // Obstacle color
          ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }, [mapData, GRID_SIZE, CANVAS_SIZE]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="absolute top-7.5 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default MapLayer;
