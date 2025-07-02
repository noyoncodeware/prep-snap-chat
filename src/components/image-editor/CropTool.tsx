
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>("");

  const handleCropToggle = () => {
    setCropEnabled(!cropEnabled);
    if (canvas && !cropEnabled) {
      // Set initial crop area to center of canvas
      const rect = canvas.getBoundingClientRect();
      setCropArea({
        x: rect.width * 0.25,
        y: rect.height * 0.25,
        width: rect.width * 0.5,
        height: rect.height * 0.5
      });
    }
  };

  const handleApplyCrop = () => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const actualCropArea = {
      x: cropArea.x * scaleX,
      y: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY
    };
    
    onApplyCrop(actualCropArea);
    setCropEnabled(false);
  };

  const handleMouseDown = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === "drag") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y });
    } else if (action.startsWith("resize")) {
      setIsResizing(true);
      setResizeHandle(action);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x + cropArea.x, rect.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y + cropArea.y, rect.height - cropArea.height));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const deltaX = mouseX - (dragStart.x - rect.left);
      const deltaY = mouseY - (dragStart.y - rect.top);
      
      setCropArea(prev => {
        let newArea = { ...prev };
        
        if (resizeHandle.includes("right")) {
          newArea.width = Math.max(50, Math.min(mouseX - prev.x, rect.width - prev.x));
        }
        if (resizeHandle.includes("left")) {
          const newWidth = Math.max(50, prev.width - deltaX);
          const newX = Math.max(0, mouseX - newWidth);
          newArea.x = newX;
          newArea.width = Math.min(newWidth, rect.width - newX);
        }
        if (resizeHandle.includes("bottom")) {
          newArea.height = Math.max(50, Math.min(mouseY - prev.y, rect.height - prev.y));
        }
        if (resizeHandle.includes("top")) {
          const newHeight = Math.max(50, prev.height - deltaY);
          const newY = Math.max(0, mouseY - newHeight);
          newArea.y = newY;
          newArea.height = Math.min(newHeight, rect.height - newY);
        }
        
        return newArea;
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle("");
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, cropArea, canvas]);

  return (
    <>
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={cropEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleCropToggle}
              className={cropEnabled ? "bg-blue-600 text-white" : "bg-white/80"}
            >
              <Crop className="w-4 h-4 mr-1" />
              {cropEnabled ? "Cancel Crop" : "Crop"}
            </Button>
            
            {cropEnabled && (
              <Button
                variant="default"
                size="sm"
                onClick={handleApplyCrop}
                className="bg-green-600 text-white"
              >
                Apply Crop
              </Button>
            )}
          </div>
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

        {cropEnabled && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <p>• Drag the crop box to move it</p>
            <p>• Drag the corners or edges to resize</p>
            <p>• Click "Apply Crop" when ready</p>
          </div>
        )}
      </div>

      {/* Interactive Crop Overlay - positioned relative to canvas */}
      {cropEnabled && canvas && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {/* Crop Box */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 cursor-move pointer-events-auto"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, "drag")}
          >
            {/* Corner Resize Handles */}
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white -top-1 -left-1 cursor-nw-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-top-left")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white -top-1 -right-1 cursor-ne-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-top-right")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white -bottom-1 -left-1 cursor-sw-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-bottom-left")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white -bottom-1 -right-1 cursor-se-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-bottom-right")}
            />
            
            {/* Edge Resize Handles */}
            <div
              className="absolute w-full h-1 bg-blue-500/50 -top-0.5 left-0 cursor-n-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-top")}
            />
            <div
              className="absolute w-full h-1 bg-blue-500/50 -bottom-0.5 left-0 cursor-s-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-bottom")}
            />
            <div
              className="absolute w-1 h-full bg-blue-500/50 -left-0.5 top-0 cursor-w-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-left")}
            />
            <div
              className="absolute w-1 h-full bg-blue-500/50 -right-0.5 top-0 cursor-e-resize pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(e, "resize-right")}
            />
          </div>
          
          {/* Overlay to darken non-cropped areas */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top overlay */}
            <div
              className="absolute bg-black/30"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: cropArea.y,
              }}
            />
            {/* Bottom overlay */}
            <div
              className="absolute bg-black/30"
              style={{
                top: cropArea.y + cropArea.height,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            {/* Left overlay */}
            <div
              className="absolute bg-black/30"
              style={{
                top: cropArea.y,
                left: 0,
                width: cropArea.x,
                height: cropArea.height,
              }}
            />
            {/* Right overlay */}
            <div
              className="absolute bg-black/30"
              style={{
                top: cropArea.y,
                left: cropArea.x + cropArea.width,
                right: 0,
                height: cropArea.height,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
