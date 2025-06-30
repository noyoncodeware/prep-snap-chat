
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageEditor } from "@/components/ImageEditor";
import { X, Send, Edit3 } from "lucide-react";

interface ImagePreviewModalProps {
  imageUrl: string;
  file: File;
  onSend: (editedImageUrl: string, caption: string) => void;
  onClose: () => void;
}

export const ImagePreviewModal = ({ imageUrl, file, onSend, onClose }: ImagePreviewModalProps) => {
  const [caption, setCaption] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState(imageUrl);
  const [showEditor, setShowEditor] = useState(false);

  const handleSend = () => {
    onSend(editedImageUrl, caption);
  };

  const handleImageEdit = (newImageUrl: string) => {
    setEditedImageUrl(newImageUrl);
    setShowEditor(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-white/95 backdrop-blur-md border-0 shadow-2xl">
        <div className="relative h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <h2 className="text-lg font-semibold text-gray-900">
              {showEditor ? "Edit Image" : "Send Image"}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditor(!showEditor)}
                className="bg-white/80 hover:bg-white/90"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="bg-white/80 hover:bg-white/90"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {showEditor ? (
              <ImageEditor
                imageUrl={imageUrl}
                file={file}
                onSave={handleImageEdit}
                onCancel={() => setShowEditor(false)}
              />
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={editedImageUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>

                {/* Caption Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Add a caption (optional)
                  </label>
                  <Input
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="bg-white/80 border-gray-200 focus:border-blue-300"
                  />
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
