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
import { updateParams } from "@/src/hooks/UseUIStore";

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
          // ✅ ADDED: extra validation for 25x25
          if (mapData.length !== 25 || mapData[0].length !== 25) {
            alert("Map must be 25x25");
            return;
          }
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
                {/*<SelectItem value="Bee Colony">Bee Colony</SelectItem>*/}
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
          {UIStore.algorithm === "Greedy Coverage" && (
            <>
              <div className="space-y-2">
                <Label>
                  Number of Drones:{" "}
                  {UIStore.params["Greedy Coverage"].numDrones}
                </Label>
                <Slider
                  value={[UIStore.params["Greedy Coverage"].numDrones]}
                  onValueChange={(value) =>
                    updateParams(
                      "Greedy Coverage",
                      UIStore.setParams,
                      "numDrones",
                      value[0]
                    )
                  }
                  max={60}
                  min={15}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Speed: {UIStore.params["Greedy Coverage"].speed}</Label>
                <Slider
                  value={[UIStore.params["Greedy Coverage"].speed]}
                  onValueChange={(value) =>
                    updateParams(
                      "Greedy Coverage",
                      UIStore.setParams,
                      "speed",
                      value[0]
                    )
                  }
                  max={15}
                  min={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Sensing Radius:{" "}
                  {UIStore.params["Greedy Coverage"].sensingRadius}
                </Label>
                <Slider
                  value={[UIStore.params["Greedy Coverage"].sensingRadius]}
                  onValueChange={(value) =>
                    updateParams(
                      "Greedy Coverage",
                      UIStore.setParams,
                      "sensingRadius",
                      value[0]
                    )
                  }
                  max={200}
                  min={50}
                  step={10}
                />
              </div>
            </>
          )}

          {UIStore.algorithm === "Bee Colony" && (
            <>
              <div className="space-y-2">
                <Label>
                  Number of Scouts: {UIStore.params["Bee Colony"].numScouts}
                </Label>
                <Slider
                  value={[UIStore.params["Bee Colony"].numScouts]}
                  onValueChange={(value) =>
                    updateParams(
                      "Bee Colony",
                      UIStore.setParams,
                      "numScouts",
                      value[0]
                    )
                  }
                  max={30}
                  min={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Number of Foragers: {UIStore.params["Bee Colony"].numForagers}
                </Label>
                <Slider
                  value={[UIStore.params["Bee Colony"].numForagers]}
                  onValueChange={(value) =>
                    updateParams(
                      "Bee Colony",
                      UIStore.setParams,
                      "numForagers",
                      value[0]
                    )
                  }
                  max={50}
                  min={10}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Search Radius: {UIStore.params["Bee Colony"].searchRadius}
                </Label>
                <Slider
                  value={[UIStore.params["Bee Colony"].searchRadius]}
                  onValueChange={(value) =>
                    updateParams(
                      "Bee Colony",
                      UIStore.setParams,
                      "searchRadius",
                      value[0]
                    )
                  }
                  max={100}
                  min={10}
                  step={5}
                />
              </div>
            </>
          )}

          {UIStore.algorithm === "Bacterial Foraging" && (
            <>
              <div className="space-y-2">
                <Label>
                  Population: {UIStore.params["Bacterial Foraging"].population}
                </Label>
                <Slider
                  value={[UIStore.params["Bacterial Foraging"].population]}
                  onValueChange={(value) =>
                    updateParams(
                      "Bacterial Foraging",
                      UIStore.setParams,
                      "population",
                      value[0]
                    )
                  }
                  max={60}
                  min={15}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Dispersal Steps:{" "}
                  {UIStore.params["Bacterial Foraging"].dispersalSteps}
                </Label>
                <Slider
                  value={[UIStore.params["Bacterial Foraging"].dispersalSteps]}
                  onValueChange={(value) =>
                    updateParams(
                      "Bacterial Foraging",
                      UIStore.setParams,
                      "dispersalSteps",
                      value[0]
                    )
                  }
                  max={50}
                  min={5}
                  step={1}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visualization Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visualization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="heatmap">Show Coverage Heatmap</Label>
            <Switch
              id="heatmap"
              checked={UIStore.showHeatmap}
              onCheckedChange={UIStore.setShowHeatmap}
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
              if (!UIStore.isRunning) {
                // ✅ CHANGED: Only lock + spawn when starting
                simStore.setDrones(spawnDrones(UIStore.numDrones));
                UIStore.setSimLocked(true);
              }
              UIStore.setIsRunning(!UIStore.isRunning);
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
              simStore.setDrones(spawnDrones(UIStore.numDrones)); // ✅ spawns fresh
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
