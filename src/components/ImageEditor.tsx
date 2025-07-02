import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, X, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { CropTool } from "./image-editor/CropTool";
import { FiltersPanel } from "./image-editor/FiltersPanel";
import { DrawingTools } from "./image-editor/DrawingTools";
import { LayersPanel } from "./image-editor/LayersPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageEditorProps {
  imageUrl: string;
  file: File;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
}

export const ImageEditor = ({ imageUrl, file, onSave, onCancel }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  
  // Transform states
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  
  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  
  // Drawing states
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<"brush" | "eraser" | "text" | "rectangle" | "circle">("brush");
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  
  // Drawing paths for undo/redo
  const [drawingPaths, setDrawingPaths] = useState<Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    size: number;
    tool: string;
  }>>([]);
  const [pathHistory, setPathHistory] = useState<Array<Array<any>>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Layers
  const [layers, setLayers] = useState<Layer[]>([
    { id: "background", name: "Background", visible: true, opacity: 100, blendMode: "normal" }
  ]);
  const [activeLayerId, setActiveLayerId] = useState("background");

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      drawImage(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const applyFilters = (ctx: CanvasRenderingContext2D) => {
    const filterString = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `hue-rotate(${hue}deg)`,
      `blur(${blur}px)`,
      `sepia(${sepia}%)`
    ].join(' ');
    
    ctx.filter = filterString;
  };

  const drawImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    
    // Move to center for rotation and flipping
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply flipping
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    
    // Apply filters
    applyFilters(ctx);
    
    // Draw image
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    ctx.restore();

    // Draw all drawing paths
    drawingPaths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.save();
      
      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.strokeStyle = path.color;
      }
      
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      
      ctx.stroke();
      ctx.restore();
    });
  };

  useEffect(() => {
    if (originalImage) {
      drawImage(originalImage);
    }
  }, [rotation, flipHorizontal, flipVertical, brightness, contrast, saturation, hue, blur, sepia, originalImage, drawingPaths]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode) return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastPoint(pos);
    
    // Start a new drawing path
    const newPath = {
      points: [pos],
      color: brushColor,
      size: brushSize,
      tool: activeDrawingTool
    };
    
    setDrawingPaths(prev => [...prev, newPath]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode) return;

    const currentPos = getMousePos(e);
    
    // Add point to current path
    setDrawingPaths(prev => {
      const newPaths = [...prev];
      const currentPath = newPaths[newPaths.length - 1];
      if (currentPath) {
        currentPath.points.push(currentPos);
      }
      return newPaths;
    });

    setLastPoint(currentPos);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      // Save to history for undo/redo
      setPathHistory(prev => [...prev.slice(0, historyIndex + 1), [...drawingPaths]]);
      setHistoryIndex(prev => prev + 1);
    }
    setIsDrawing(false);
    setLastPoint(null);
  };

  // Advanced tool handlers
  const handleCrop = (cropData: { x: number; y: number; width: number; height: number }) => {
    if (!originalImage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create temporary canvas with cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropData.width;
    tempCanvas.height = cropData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Copy cropped area
    tempCtx.drawImage(canvas, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);
    
    // Create new image from cropped data
    const newImg = new Image();
    newImg.onload = () => {
      setOriginalImage(newImg);
      // Clear drawing paths as they won't be valid after crop
      setDrawingPaths([]);
      setPathHistory([]);
      setHistoryIndex(-1);
    };
    newImg.src = tempCanvas.toDataURL();
    
    toast.success("Image cropped!");
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal(prev => !prev);
  };

  const handleFlipVertical = () => {
    setFlipVertical(prev => !prev);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setDrawingPaths(pathHistory[historyIndex - 1] || []);
    }
  };

  const handleRedo = () => {
    if (historyIndex < pathHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setDrawingPaths(pathHistory[historyIndex + 1] || []);
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setSepia(0);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const editedImageUrl = URL.createObjectURL(blob);
        onSave(editedImageUrl);
        toast.success("Image saved successfully!");
      }
    }, 'image/jpeg', 0.9);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    resetFilters();
    setDrawingPaths([]);
    setPathHistory([]);
    setHistoryIndex(-1);
  };

  // Layer management handlers
  const handleLayerAdd = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length}`,
      visible: true,
      opacity: 100,
      blendMode: "normal"
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const handleLayerDelete = (layerId: string) => {
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== layerId));
    if (layerId === activeLayerId) {
      setActiveLayerId(layers[0]?.id || "");
    }
  };

  const handleLayerVisibilityToggle = (layerId: string) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
  };

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, opacity } : l
    ));
  };

  const handleLayerMoveUp = (layerId: string) => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index > 0) {
        const newLayers = [...prev];
        [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
        return newLayers;
      }
      return prev;
    });
  };

  const handleLayerMoveDown = (layerId: string) => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === layerId);
      if (index < prev.length - 1) {
        const newLayers = [...prev];
        [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
        return newLayers;
      }
      return prev;
    });
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`max-w-full h-auto max-h-96 object-contain mx-auto block ${
            drawingMode ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Controls Tabs */}
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="crop">Transform</TabsTrigger>
          <TabsTrigger value="draw">Draw</TabsTrigger>
          <TabsTrigger value="layers">Layers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="filters" className="space-y-4">
          <FiltersPanel
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            hue={hue}
            blur={blur}
            sepia={sepia}
            onBrightnessChange={setBrightness}
            onContrastChange={setContrast}
            onSaturationChange={setSaturation}
            onHueChange={setHue}
            onBlurChange={setBlur}
            onSepiaChange={setSepia}
            onReset={resetFilters}
          />
        </TabsContent>
        
        <TabsContent value="crop" className="space-y-4">
          <div className="relative">
            <CropTool
              canvas={canvasRef.current}
              onApplyCrop={handleCrop}
              onRotate={handleRotate}
              onFlipHorizontal={handleFlipHorizontal}
              onFlipVertical={handleFlipVertical}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="draw" className="space-y-4">
          <DrawingTools
            drawingMode={drawingMode}
            brushSize={brushSize}
            brushColor={brushColor}
            activeDrawingTool={activeDrawingTool}
            onToggleDrawing={() => setDrawingMode(!drawingMode)}
            onBrushSizeChange={setBrushSize}
            onBrushColorChange={setBrushColor}
            onToolChange={setActiveDrawingTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < pathHistory.length - 1}
          />
        </TabsContent>
        
        <TabsContent value="layers" className="space-y-4">
          <LayersPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerSelect={setActiveLayerId}
            onLayerVisibilityToggle={handleLayerVisibilityToggle}
            onLayerOpacityChange={handleLayerOpacityChange}
            onLayerAdd={handleLayerAdd}
            onLayerDelete={handleLayerDelete}
            onLayerMoveUp={handleLayerMoveUp}
            onLayerMoveDown={handleLayerMoveDown}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 bg-white/80"
        >
          Reset All
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-white/80"
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};
