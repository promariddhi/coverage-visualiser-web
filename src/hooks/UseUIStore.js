import { useState } from "react";
import { GRID_SIZE } from "../lib/utils";
// Simulation state store using React hooks
const useUIStore = () => {
  const [algorithm, setAlgorithm] = useState("Bacterial Foraging");
  const [numDrones, setNumDrones] = useState(30);
  const [speed, setSpeed] = useState(10);
  const [sensingRadius, setSensingRadius] = useState(150);
  const [showTrails, setShowTrails] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSensingVector, setShowSensingVector] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMap, setCurrentMap] = useState("empty");
  const [simLocked, setSimLocked] = useState(false);

  // Initialize with empty 20x20 grid
  const [mapData, setMapData] = useState(() =>
    Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(0))
  );

  return {
    algorithm,
    setAlgorithm,
    numDrones,
    setNumDrones,
    speed,
    setSpeed,
    sensingRadius,
    setSensingRadius,
    showTrails,
    setShowTrails,
    showHeatmap,
    setShowHeatmap,
    showSensingVector,
    setShowSensingVector,
    isRunning,
    setIsRunning,
    currentMap,
    setCurrentMap,
    mapData,
    setMapData,
    simLocked,
    setSimLocked,
  };
};
export default useUIStore;
