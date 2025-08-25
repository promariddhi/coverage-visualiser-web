import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "components/ui/sheet";

import presetMaps from "../lib/PresetMaps";
import ControlPanel from "../components/custom/ControlPanel";
import MapEditor from "../components/custom/MapEditor";
import HeatmapOverlay from "../components/custom/HeatMap";
import DroneLayer from "../components/custom/DroneLayer";
import MapLayer from "../components/custom/MapLayer";

import { useSimStore, nextStep } from "../hooks/useSimStore";
import { useUIStore, updateParams } from "../hooks/UseUIStore";

// Main App Component
const App = () => {
  const UIStore = useUIStore();
  const simStore = useSimStore(UIStore.numDrones);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoadPreset = (presetKey) => {
    const preset = presetMaps[presetKey];
    if (preset) {
      UIStore.setMapData(preset.data);
      UIStore.setCurrentMap(presetKey);
    }
  };

  const handleSaveMap = () => {
    const dataStr = JSON.stringify(UIStore.mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `map-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadMap = (mapData) => {
    UIStore.setMapData(mapData);
  };

  const iteration = useRef(0); // local counter

  useEffect(() => {
    if (!UIStore.isRunning) {
      if (!UIStore.simLocked) iteration.current = 0;
      return;
    }

    const interval = setInterval(() => {
      iteration.current++;
      console.log(iteration.current);

      if (UIStore.algorithm === "Bacterial Foraging") {
        updateParams(
          "Bacterial Foraging",
          UIStore.setParams,
          "iteration",
          iteration.current
        );
      }
      nextStep(UIStore.algorithm, simStore, UIStore);
    }, 50);

    return () => clearInterval(interval);
  }, [
    UIStore.isRunning,
    UIStore.algorithm,
    simStore,
    UIStore.setParams,
    UIStore,
    iteration,
  ]);

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
          UIStore={UIStore}
          onLoadPreset={handleLoadPreset}
          onSaveMap={handleSaveMap}
          onLoadMap={handleLoadMap}
          simStore={simStore}
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
            UIStore={UIStore}
            simStore={simStore}
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
                Current Algorithm:{" "}
                <span className="font-medium capitalize">
                  {UIStore.algorithm.replace("-", " ")}
                </span>
                {UIStore.isRunning && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Running
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="relative">
                <HeatmapOverlay
                  visited={simStore.heatMap}
                  showMap={UIStore.showHeatmap}
                />
                {UIStore.simLocked && <MapLayer mapData={UIStore.mapData} />}
                <DroneLayer drones={simStore.drones} />
                <MapEditor
                  mapData={UIStore.mapData}
                  setMapData={UIStore.setMapData}
                  mapLocked={UIStore.simLocked}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;
