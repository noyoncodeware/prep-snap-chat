import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Contrast, Droplets, Zap, Focus } from "lucide-react";

interface FiltersPanelProps {
  brightness: number;
  contrast: number;  
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onHueChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onSepiaChange: (value: number) => void;
  onReset: () => void;
}

export const FiltersPanel = ({
  brightness,
  contrast,
  saturation,
  hue,
  blur,
  sepia,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onHueChange,
  onBlurChange,
  onSepiaChange,
  onReset
}: FiltersPanelProps) => {
  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="bg-white/80 text-xs"
        >
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Sun className="w-3 h-3 text-gray-600" />
          <span className="text-xs font-medium text-gray-700 w-16">Brightness</span>
          <Slider
            value={[brightness]}
            onValueChange={(value) => onBrightnessChange(value[0])}
            max={200}
            min={0}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{brightness}%</span>
        </div>

        <div className="flex items-center gap-3">
          <Contrast className="w-3 h-3 text-gray-600" />
          <span className="text-xs font-medium text-gray-700 w-16">Contrast</span>
          <Slider
            value={[contrast]}
            onValueChange={(value) => onContrastChange(value[0])}
            max={200}
            min={0}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{contrast}%</span>
        </div>

        <div className="flex items-center gap-3">
          <Droplets className="w-3 h-3 text-gray-600" />
          <span className="text-xs font-medium text-gray-700 w-16">Saturation</span>
          <Slider
            value={[saturation]}
            onValueChange={(value) => onSaturationChange(value[0])}
            max={200}
            min={0}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{saturation}%</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
          <span className="text-xs font-medium text-gray-700 w-16">Hue</span>
          <Slider
            value={[hue]}
            onValueChange={(value) => onHueChange(value[0])}
            max={360}
            min={0}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{hue}°</span>
        </div>

        <div className="flex items-center gap-3">
          <Focus className="w-3 h-3 text-gray-600" />
          <span className="text-xs font-medium text-gray-700 w-16">Blur</span>
          <Slider
            value={[blur]}
            onValueChange={(value) => onBlurChange(value[0])}
            max={10}
            min={0}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{blur.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-3">
          <Zap className="w-3 h-3 text-amber-600" />
          <span className="text-xs font-medium text-gray-700 w-16">Sepia</span>
          <Slider
            value={[sepia]}
            onValueChange={(value) => onSepiaChange(value[0])}
            max={100}
            min={0}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-gray-500 w-10">{sepia}%</span>
        </div>
      </div>
    </div>
  );
};
