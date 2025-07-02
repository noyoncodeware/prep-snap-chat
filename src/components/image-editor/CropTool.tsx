
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";

interface CropToolProps {
  canvas: HTMLCanvasElement | null;
  onApplyCrop: (cropData: { x: number; y: number; width: number; height: number }) => void;
  onRotate: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
}

export const CropTool = ({ canvas, onApplyCrop, onRotate, onFlipHorizontal, onFlipVertical }: CropToolProps) => {
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });

  const handleCropToggle = () => {
    setCropEnabled(!cropEnabled);
    if (canvas && !cropEnabled) {
      // Set initial crop area to center of canvas
      setCropArea({
        x: canvas.width * 0.25,
        y: canvas.height * 0.25,
        width: canvas.width * 0.5,
        height: canvas.height * 0.5
      });
    }
  };

  const handleApplyCrop = () => {
    onApplyCrop(cropArea);
    setCropEnabled(false);
  };

  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant={cropEnabled ? "default" : "outline"}
          size="sm"
          onClick={handleCropToggle}
          className={cropEnabled ? "bg-blue-600 text-white" : "bg-white/80"}
        >
          <Crop className="w-4 h-4 mr-1" />
          {cropEnabled ? "Apply Crop" : "Crop"}
        </Button>
        
        {cropEnabled && (
          <Button
            variant="default"
            size="sm"
            onClick={handleApplyCrop}
            className="bg-green-600 text-white"
          >
            Apply
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRotate}
          className="bg-white/80"
        >
          <RotateCw className="w-4 h-4 mr-1" />
          Rotate
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onFlipHorizontal}
          className="bg-white/80"
        >
          <FlipHorizontal className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onFlipVertical}
          className="bg-white/80"
        >
          <FlipVertical className="w-4 h-4" />
        </Button>
      </div>

      {cropEnabled && canvas && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">X:</span>
            <Slider
              value={[cropArea.x]}
              onValueChange={(value) => setCropArea(prev => ({ ...prev, x: value[0] }))}
              max={canvas.width - cropArea.width}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-12">{Math.round(cropArea.x)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">Y:</span>
            <Slider
              value={[cropArea.y]}
              onValueChange={(value) => setCropArea(prev => ({ ...prev, y: value[0] }))}
              max={canvas.height - cropArea.height}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-12">{Math.round(cropArea.y)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">W:</span>
            <Slider
              value={[cropArea.width]}
              onValueChange={(value) => setCropArea(prev => ({ ...prev, width: value[0] }))}
              max={canvas.width - cropArea.x}
              min={10}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-12">{Math.round(cropArea.width)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-8">H:</span>
            <Slider
              value={[cropArea.height]}
              onValueChange={(value) => setCropArea(prev => ({ ...prev, height: value[0] }))}
              max={canvas.height - cropArea.y}
              min={10}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-12">{Math.round(cropArea.height)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
