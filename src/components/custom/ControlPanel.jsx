import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Slider } from "components/ui/slider";
import { Switch } from "components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Label } from "components/ui/label";
import { Separator } from "components/ui/separator";
import { Play, Pause, RotateCcw, Download, Upload } from "lucide-react";

import { spawnDrones, clearHeatmap } from "@/src/hooks/useSimStore";

import presetMaps from "@/src/lib/PresetMaps";
// Control Panel Component
const ControlPanel = ({ UIStore, onLoadPreset, onSaveMap, simStore }) => {
  const fileInputRef = useRef(null);

  const handleLoadMap = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target.result);
        if (
          Array.isArray(mapData) &&
          mapData.length > 0 &&
          Array.isArray(mapData[0])
        ) {
          UIStore.setMapData(mapData);
        } else {
          alert("Invalid map format");
        }
      } catch (error) {
        console.error("Error loading map file:", error);
        alert("Error loading map file");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div className="space-y-6 p-6">
      {/* Algorithm Selection */}
      <Card
        className={UIStore.simLocked ? "opacity-50 pointer-events-none" : ""}
      >
        <CardHeader>
          <CardTitle className="text-lg">Algorithm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Choose Algorithm</Label>
            <Select
              value={UIStore.algorithm}
              onValueChange={UIStore.setAlgorithm}
            >
              <SelectTrigger id="algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bacterial Foraging">
                  Bacterial Foraging
                </SelectItem>
                <SelectItem value="Bee Colony">Bee Colony</SelectItem>
                <SelectItem value="Greedy Coverage">Greedy Coverage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card
        className={UIStore.simLocked ? "opacity-50 pointer-events-none" : ""}
      >
        <CardHeader>
          <CardTitle className="text-lg">Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Number of Drones: {UIStore.numDrones}</Label>
            <Slider
              value={[UIStore.numDrones]}
              onValueChange={(value) => {
                UIStore.setNumDrones(value[0]);
                simStore.setDrones(spawnDrones(UIStore.numDrones));
              }}
              max={60}
              min={15}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Speed: {UIStore.speed}</Label>
            <Slider
              value={[UIStore.speed]}
              onValueChange={(value) => UIStore.setSpeed(value[0])}
              max={15}
              min={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Sensing Radius: {UIStore.sensingRadius}</Label>
            <Slider
              value={[UIStore.sensingRadius]}
              onValueChange={(value) => UIStore.setSensingRadius(value[0])}
              max={200}
              min={50}
              step={10}
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
              checked={UIStore.showTrails}
              onCheckedChange={UIStore.setShowTrails}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="heatmap">Show Coverage Heatmap</Label>
            <Switch
              id="heatmap"
              checked={UIStore.showHeatmap}
              onCheckedChange={UIStore.setShowHeatmap}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sensing">Show Sensing Vector</Label>
            <Switch
              id="sensing"
              checked={UIStore.showSensingVector}
              onCheckedChange={UIStore.setShowSensingVector}
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
            onClick={() => {
              UIStore.setIsRunning(!UIStore.isRunning);
              UIStore.setSimLocked(true);
              if (!UIStore.simLocked)
                simStore.setDrones(spawnDrones(UIStore.numDrones));
            }}
            className="w-full"
            variant={UIStore.isRunning ? "destructive" : "default"}
          >
            {UIStore.isRunning ? (
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
              UIStore.setIsRunning(false);
              UIStore.setSimLocked(false);
              simStore.setDrones(spawnDrones(UIStore.numDrones));
              clearHeatmap(simStore);
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
      <Card
        className={UIStore.simLocked ? "opacity-50 pointer-events-none" : ""}
      >
        <CardHeader>
          <CardTitle className="text-lg">Map Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="preset">Load Preset Map</Label>
            <Select value={UIStore.currentMap} onValueChange={onLoadPreset}>
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
export default ControlPanel;
