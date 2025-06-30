
import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { MessageInput } from "@/components/MessageInput";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { MessageSquare, Users } from "lucide-react";

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: "user" | "other";
  image?: string;
  senderName?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! How's it going?",
      timestamp: new Date(Date.now() - 300000),
      sender: "other",
      senderName: "Alex"
    },
    {
      id: "2", 
      text: "Pretty good! Just working on some new projects. How about you?",
      timestamp: new Date(Date.now() - 240000),
      sender: "user"
    },
    {
      id: "3",
      text: "That's awesome! I'd love to see what you're working on.",
      timestamp: new Date(Date.now() - 180000),
      sender: "other",
      senderName: "Alex"
    }
  ]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleSendMessage = (text: string, image?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
      sender: "user",
      image
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleImagePreview = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setPreviewFile(file);
  };

  const handleImageSend = (editedImageUrl: string, caption: string) => {
    handleSendMessage(caption, editedImageUrl);
    setPreviewImage(null);
    setPreviewFile(null);
  };

  const handleClosePreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setPreviewFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Chat App</h1>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-3 h-3" />
              <span>2 participants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
          <MessageInput 
            onSendMessage={handleSendMessage}
            onImagePreview={handleImagePreview}
          />
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && previewFile && (
        <ImagePreviewModal
          imageUrl={previewImage}
          file={previewFile}
          onSend={handleImageSend}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

export default Index;
