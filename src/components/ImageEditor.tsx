
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, Save, X, Palette, Brush, Undo2 } from "lucide-react";
import { toast } from "sonner";

interface ImageEditorProps {
  imageUrl: string;
  file: File;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export const ImageEditor = ({ imageUrl, file, onSave, onCancel }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState("#ff0000");
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      drawImage(img);
      initializeDrawingCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const initializeDrawingCanvas = () => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas || !originalImage) return;

    drawingCanvas.width = originalImage.width;
    drawingCanvas.height = originalImage.height;
    
    const ctx = drawingCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
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
    
    // Move to center for rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Draw image
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    ctx.restore();

    // Draw the drawing layer on top
    const drawingCanvas = drawingCanvasRef.current;
    if (drawingCanvas) {
      ctx.drawImage(drawingCanvas, 0, 0);
    }
  };

  useEffect(() => {
    if (originalImage) {
      drawImage(originalImage);
    }
  }, [rotation, brightness, contrast, saturation, originalImage]);

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
    
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    // Save current state for undo
    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    setDrawingHistory(prev => [...prev, imageData]);

    setIsDrawing(true);
    const pos = getMousePos(e);
    setLastPoint(pos);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode || !lastPoint) return;

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getMousePos(e);

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    setLastPoint(currentPos);
    
    // Redraw the main canvas with the updated drawing
    if (originalImage) {
      drawImage(originalImage);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleUndo = () => {
    if (drawingHistory.length === 0) return;

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    const lastState = drawingHistory[drawingHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    
    setDrawingHistory(prev => prev.slice(0, -1));
    
    if (originalImage) {
      drawImage(originalImage);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const editedImageUrl = URL.createObjectURL(blob);
        onSave(editedImageUrl);
        toast.success("Image edited successfully!");
      }
    }, 'image/jpeg', 0.9);
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setDrawingHistory([]);
    
    // Clear drawing canvas
    const drawingCanvas = drawingCanvasRef.current;
    if (drawingCanvas) {
      const ctx = drawingCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto max-h-96 object-contain mx-auto block cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <canvas
          ref={drawingCanvasRef}
          className="hidden"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Drawing Controls */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Button
            variant={drawingMode ? "default" : "outline"}
            size="sm"
            onClick={() => setDrawingMode(!drawingMode)}
            className={drawingMode ? "bg-blue-600 text-white" : "bg-white/80"}
          >
            <Brush className="w-4 h-4 mr-1" />
            Draw
          </Button>
          
          {drawingMode && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Size:</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  max={20}
                  min={1}
                  step={1}
                  className="w-20"
                />
                <span className="text-sm text-gray-500 w-6">{brushSize}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Color:</span>
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={drawingHistory.length === 0}
                className="bg-white/80"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            className="bg-white/80"
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Rotate
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Palette className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700 w-20">Brightness</span>
            <Slider
              value={[brightness]}
              onValueChange={(value) => setBrightness(value[0])}
              max={200}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-12">{brightness}%</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4" />
            <span className="text-sm font-medium text-gray-700 w-20">Contrast</span>
            <Slider
              value={[contrast]}
              onValueChange={(value) => setContrast(value[0])}
              max={200}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-12">{contrast}%</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-4" />
            <span className="text-sm font-medium text-gray-700 w-20">Saturation</span>
            <Slider
              value={[saturation]}
              onValueChange={(value) => setSaturation(value[0])}
              max={200}
              min={0}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-12">{saturation}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 bg-white/80"
          >
            Reset
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
    </div>
  );
};
