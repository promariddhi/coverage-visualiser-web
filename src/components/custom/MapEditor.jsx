import React, { useState, useCallback, useRef, useEffect } from "react";

import { MAP_CELL_SIZE, MAP_GRID_SIZE, CANVAS_SIZE } from "@/src/lib/utils";

// Map Editor Component
const MapEditor = ({ mapData, setMapData, mapLocked }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(1); // 1 for obstacle, 0 for free

  const gridSize = MAP_GRID_SIZE;
  const cellSize = MAP_CELL_SIZE;
  const canvasSize = CANVAS_SIZE;

  const drawGrid = useCallback(
    (ctx) => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Draw cells
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = j * cellSize;
          const y = i * cellSize;

          // Cell background
          if (mapData[i][j] === 1) {
            ctx.fillStyle = "#374151"; // Obstacle
          } else {
            ctx.fillStyle = "#dcfce7"; // Free space
          }

          ctx.fillRect(x, y, cellSize, cellSize);
          // Grid lines
          ctx.strokeStyle = mapLocked
            ? (ctx.fillStyle = "#dcfce7")
            : "#a6a8aaff";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    },
    [mapLocked, mapData, cellSize, canvasSize, gridSize]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    drawGrid(ctx);
  }, [drawGrid]);

  const getCellFromMouse = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    return { row, col };
  };

  const toggleCell = (row, col, value = null) => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;

    const newMapData = [...mapData];
    newMapData[row] = [...newMapData[row]];
    newMapData[row][col] =
      value !== null ? value : newMapData[row][col] === 1 ? 0 : 1;
    setMapData(newMapData);
  };

  const handleMouseDown = (e) => {
    if (mapLocked) return;
    e.preventDefault();
    const { row, col } = getCellFromMouse(e);
    const newDrawMode = e.button === 2 ? 0 : 1; // Right click = erase, left click = draw
    setDrawMode(newDrawMode);
    setIsDrawing(true);
    toggleCell(row, col, newDrawMode);
  };

  const handleMouseMove = (e) => {
    if (mapLocked) return;
    if (!isDrawing) return;
    const { row, col } = getCellFromMouse(e);
    toggleCell(row, col, drawMode);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-sm text-gray-600">
        {mapLocked
          ? "Editing disabled until simulation is reset."
          : "Left click: Add obstacle | Right click: Remove | Drag to paint"}
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        //className="border border-gray-300 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
export default MapEditor;
