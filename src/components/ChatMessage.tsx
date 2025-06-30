
import { Message } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === "user";
  
  return (
    <div className={cn(
      "flex items-end gap-2 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {message.senderName?.[0] || "U"}
        </div>
      )}
      
      <div className={cn(
        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm",
        isUser 
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md" 
          : "bg-white text-gray-900 rounded-bl-md"
      )}>
        {message.image && (
          <div className="mb-2">
            <img 
              src={message.image} 
              alt="Shared image"
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        )}
        
        {message.text && (
          <p className="text-sm leading-relaxed">{message.text}</p>
        )}
        
        <div className={cn(
          "text-xs mt-1 opacity-70",
          isUser ? "text-white/80" : "text-gray-500"
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};
