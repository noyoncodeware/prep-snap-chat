
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, Crop, Save, X, Palette } from "lucide-react";
import { toast } from "sonner";

interface ImageEditorProps {
  imageUrl: string;
  file: File;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export const ImageEditor = ({ imageUrl, file, onSave, onCancel }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      drawImage(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

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
  };

  useEffect(() => {
    if (originalImage) {
      drawImage(originalImage);
    }
  }, [rotation, brightness, contrast, saturation, originalImage]);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
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
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto max-h-96 object-contain mx-auto block"
        />
      </div>

      {/* Controls */}
      <div className="space-y-4">
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
