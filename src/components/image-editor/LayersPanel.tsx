
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Layers, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
}

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerMoveUp: (layerId: string) => void;
  onLayerMoveDown: (layerId: string) => void;
}

export const LayersPanel = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerOpacityChange,
  onLayerAdd,
  onLayerDelete,
  onLayerMoveUp,
  onLayerMoveDown
}: LayersPanelProps) => {
  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Layers</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLayerAdd}
          className="bg-white/80 p-1"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`p-2 rounded border cursor-pointer transition-colors ${
              layer.id === activeLayerId ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle(layer.id);
                  }}
                  className="p-1 h-auto"
                >
                  {layer.visible ? (
                    <Eye className="w-3 h-3 text-gray-600" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  )}
                </Button>
                <span className="text-xs font-medium truncate">{layer.name}</span>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerMoveUp(layer.id);
                  }}
                  className="p-1 h-auto"
                  disabled={index === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerMoveDown(layer.id);
                  }}
                  className="p-1 h-auto"
                  disabled={index === layers.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerDelete(layer.id);
                  }}
                  className="p-1 h-auto text-red-600"
                  disabled={layers.length <= 1}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {layer.id === activeLayerId && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Opacity:</span>
                  <Slider
                    value={[layer.opacity]}
                    onValueChange={(value) => onLayerOpacityChange(layer.id, value[0])}
                    max={100}
                    min={0}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-8">{layer.opacity}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
