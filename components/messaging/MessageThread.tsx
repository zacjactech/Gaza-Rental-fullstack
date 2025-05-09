import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "./ConversationList";
import { useEffect, useRef } from "react";

interface MessageThreadProps {
  conversation: Conversation | null;
  currentUserId: string;
  newMessage: string;
  onNewMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onViewProperty?: () => void;
  placeholderText: string;
  noConversationText: string;
  viewPropertyText?: string;
}

export function MessageThread({
  conversation,
  currentUserId,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  onViewProperty,
  placeholderText,
  noConversationText,
  viewPropertyText = "View Property"
}: MessageThreadProps) {
  // Reference to the message container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-20" />
          <p className="text-muted-foreground">{noConversationText}</p>
        </div>
      </div>
    );
  }

  // Find the other participant safely
  const otherParticipant = conversation.participants.find(p => p._id !== currentUserId) || {
    name: 'Unknown User',
    avatar: undefined,
    _id: 'unknown'
  };

  // Sort messages by creation date
  const sortedMessages = [...conversation.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Format timestamps
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage 
                src={otherParticipant?.avatar} 
                alt={otherParticipant?.name} 
              />
              <AvatarFallback>
                {otherParticipant?.name.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {otherParticipant?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {conversation.property.title}
              </p>
            </div>
          </div>
          {onViewProperty && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewProperty}
            >
              {viewPropertyText}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sortedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              Start a conversation by sending a message below
            </p>
          </div>
        ) : (
          sortedMessages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender._id === currentUserId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder={placeholderText}
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );
} 