
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Brush, Eraser, Type, Square, Circle, Undo2, Redo2 } from "lucide-react";

interface DrawingToolsProps {
  drawingMode: boolean;
  brushSize: number;
  brushColor: string;
  activeDrawingTool: "brush" | "eraser" | "text" | "rectangle" | "circle";
  onToggleDrawing: () => void;
  onBrushSizeChange: (size: number) => void;
  onBrushColorChange: (color: string) => void;
  onToolChange: (tool: "brush" | "eraser" | "text" | "rectangle" | "circle") => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const DrawingTools = ({
  drawingMode,
  brushSize,
  brushColor,
  activeDrawingTool,
  onToggleDrawing,
  onBrushSizeChange,
  onBrushColorChange,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: DrawingToolsProps) => {
  return (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Button
          variant={drawingMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleDrawing}
          className={drawingMode ? "bg-blue-600 text-white" : "bg-white/80"}
        >
          <Brush className="w-4 h-4 mr-1" />
          Draw
        </Button>

        {drawingMode && (
          <div className="flex gap-1">
            <Button
              variant={activeDrawingTool === "brush" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolChange("brush")}
              className="p-2"
            >
              <Brush className="w-3 h-3" />
            </Button>
            
            <Button
              variant={activeDrawingTool === "eraser" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolChange("eraser")}
              className="p-2"
            >
              <Eraser className="w-3 h-3" />
            </Button>
            
            <Button
              variant={activeDrawingTool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolChange("text")}
              className="p-2"
            >
              <Type className="w-3 h-3" />
            </Button>
            
            <Button
              variant={activeDrawingTool === "rectangle" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolChange("rectangle")}
              className="p-2"
            >
              <Square className="w-3 h-3" />
            </Button>
            
            <Button
              variant={activeDrawingTool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => onToolChange("circle")}
              className="p-2"
            >
              <Circle className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {drawingMode && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-700">Size:</span>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => onBrushSizeChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">{brushSize}</span>
          </div>

          {activeDrawingTool !== "eraser" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-700">Color:</span>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => onBrushColorChange(e.target.value)}
                className="w-8 h-8 border rounded cursor-pointer"
              />
              <div className="flex gap-1">
                {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"].map(color => (
                  <button
                    key={color}
                    onClick={() => onBrushColorChange(color)}
                    className="w-6 h-6 border rounded cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="bg-white/80"
            >
              <Undo2 className="w-3 h-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="bg-white/80"
            >
              <Redo2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
