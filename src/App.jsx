import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Slider } from 'components/ui/slider';
import { Switch } from 'components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Label } from 'components/ui/label';
import { Separator } from 'components/ui/separator';
import { Play, Pause, RotateCcw, Download, Upload, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from 'components/ui/sheet';

// Simulation state store using React hooks
const useSimStore = () => {
  const [algorithm, setAlgorithm] = useState('bacterial-foraging');
  const [numDrones, setNumDrones] = useState(5);
  const [speed, setSpeed] = useState(1);
  const [sensingRadius, setSensingRadius] = useState(3);
  const [showTrails, setShowTrails] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSensingVector, setShowSensingVector] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMap, setCurrentMap] = useState('empty');
  
  // Initialize with empty 20x20 grid
  const [mapData, setMapData] = useState(() => 
    Array(20).fill().map(() => Array(20).fill(0))
  );

  return {
    algorithm, setAlgorithm,
    numDrones, setNumDrones,
    speed, setSpeed,
    sensingRadius, setSensingRadius,
    showTrails, setShowTrails,
    showHeatmap, setShowHeatmap,
    showSensingVector, setShowSensingVector,
    isRunning, setIsRunning,
    currentMap, setCurrentMap,
    mapData, setMapData
  };
};

// Preset maps data
const presetMaps = {
  empty: {
    name: "Empty Grid",
    data: Array(20).fill().map(() => Array(20).fill(0))
  },
  obstacles: {
    name: "Random Obstacles",
    data: Array(20).fill().map((_, i) => 
      Array(20).fill().map((_, j) => 
        Math.random() < 0.15 ? 1 : 0
      )
    )
  },
  maze: {
    name: "Simple Maze",
    data: Array(20).fill().map((_, i) => 
      Array(20).fill().map((_, j) => {
        if (i === 0 || i === 19 || j === 0 || j === 19) return 1;
        if (i === 5 && j > 2 && j < 17) return 1;
        if (i === 10 && j > 3 && j < 16) return 1;
        if (i === 15 && j > 2 && j < 17) return 1;
        if (j === 7 && i > 5 && i < 10) return 1;
        if (j === 12 && i > 10 && i < 15) return 1;
        return 0;
      })
    )
  }
};

// Map Editor Component
const MapEditor = ({ mapData, setMapData, showHeatmap }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(1); // 1 for obstacle, 0 for free
  
  const gridSize = 20;
  const cellSize = 25;
  const canvasSize = gridSize * cellSize;

  const drawGrid = useCallback((ctx) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Draw cells
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = j * cellSize;
        const y = i * cellSize;
        
        // Cell background
        if (mapData[i][j] === 1) {
          ctx.fillStyle = '#374151'; // Obstacle
        } else {
          ctx.fillStyle = showHeatmap ? '#dcfce7' : '#f9fafb'; // Free space
        }
        
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Grid lines
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }, [mapData, showHeatmap, cellSize, canvasSize, gridSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
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
    newMapData[row][col] = value !== null ? value : (newMapData[row][col] === 1 ? 0 : 1);
    setMapData(newMapData);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const { row, col } = getCellFromMouse(e);
    const newDrawMode = e.button === 2 ? 0 : 1; // Right click = erase, left click = draw
    setDrawMode(newDrawMode);
    setIsDrawing(true);
    toggleCell(row, col, newDrawMode);
  };

  const handleMouseMove = (e) => {
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
        Left click: Add obstacle | Right click: Remove | Drag to paint
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border border-gray-300 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

// Control Panel Component
const ControlPanel = ({ store, onLoadPreset, onSaveMap, onLoadMap }) => {
  const fileInputRef = useRef(null);

  const handleLoadMap = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target.result);
        if (Array.isArray(mapData) && mapData.length > 0 && Array.isArray(mapData[0])) {
          store.setMapData(mapData);
        } else {
          alert('Invalid map format');
        }
      } catch (error) {
        alert('Error loading map file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6 p-6">
      {/* Algorithm Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Algorithm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Choose Algorithm</Label>
            <Select value={store.algorithm} onValueChange={store.setAlgorithm}>
              <SelectTrigger id="algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bacterial-foraging">Bacterial Foraging</SelectItem>
                <SelectItem value="bee-colony">Bee Colony</SelectItem>
                <SelectItem value="greedy-coverage">Greedy Coverage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Number of Drones: {store.numDrones}</Label>
            <Slider
              value={[store.numDrones]}
              onValueChange={(value) => store.setNumDrones(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Speed: {store.speed}</Label>
            <Slider
              value={[store.speed]}
              onValueChange={(value) => store.setSpeed(value[0])}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Sensing Radius: {store.sensingRadius}</Label>
            <Slider
              value={[store.sensingRadius]}
              onValueChange={(value) => store.setSensingRadius(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visualization Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visualization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="trails">Show Trails</Label>
            <Switch
              id="trails"
              checked={store.showTrails}
              onCheckedChange={store.setShowTrails}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="heatmap">Show Coverage Heatmap</Label>
            <Switch
              id="heatmap"
              checked={store.showHeatmap}
              onCheckedChange={store.setShowHeatmap}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sensing">Show Sensing Vector</Label>
            <Switch
              id="sensing"
              checked={store.showSensingVector}
              onCheckedChange={store.setShowSensingVector}
            />
          </div>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => store.setIsRunning(!store.isRunning)}
            className="w-full"
            variant={store.isRunning ? "destructive" : "default"}
          >
            {store.isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button
            onClick={() => {
              store.setIsRunning(false);
              // Reset simulation would go here
            }}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Simulation
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Map Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="preset">Load Preset Map</Label>
            <Select value={store.currentMap} onValueChange={onLoadPreset}>
              <SelectTrigger id="preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(presetMaps).map(([key, map]) => (
                  <SelectItem key={key} value={key}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onSaveMap} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Save Map
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Map
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadMap}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
const App = () => {
  const store = useSimStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoadPreset = (presetKey) => {
    const preset = presetMaps[presetKey];
    if (preset) {
      store.setMapData(preset.data);
      store.setCurrentMap(presetKey);
    }
  };

  const handleSaveMap = () => {
    const dataStr = JSON.stringify(store.mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `map-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadMap = (mapData) => {
    store.setMapData(mapData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Control Panel */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">
            Coverage Algorithm Visualizer
          </h1>
        </div>
        <ControlPanel
          store={store}
          onLoadPreset={handleLoadPreset}
          onSaveMap={handleSaveMap}
          onLoadMap={handleLoadMap}
        />
      </div>

      {/* Mobile Control Panel */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">
              Coverage Algorithm Visualizer
            </h1>
          </div>
          <ControlPanel
            store={store}
            onLoadPreset={handleLoadPreset}
            onSaveMap={handleSaveMap}
            onLoadMap={handleLoadMap}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Map Editor & Simulation Canvas
              </CardTitle>
              <div className="text-center text-sm text-gray-600">
                Current Algorithm: <span className="font-medium capitalize">
                  {store.algorithm.replace('-', ' ')}
                </span>
                {store.isRunning && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Running
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <MapEditor
                mapData={store.mapData}
                setMapData={store.setMapData}
                showHeatmap={store.showHeatmap}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;