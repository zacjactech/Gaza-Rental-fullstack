import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Participant {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Property {
  _id: string;
  title: string;
  image: string;
}

interface Message {
  _id: string;
  content: string;
  sender: Participant;
  recipient: Participant;
  property: Property;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  participants: Participant[];
  property: Property;
  lastMessage: Message;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
  placeholderText: string;
  noConversationsText: string;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  currentUserId,
  placeholderText,
  noConversationsText
}: ConversationListProps) {
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    conversation => 
      conversation.participants.some(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      conversation.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 border-r">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholderText}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100%-56px)]">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
            <p className="text-muted-foreground">{noConversationsText}</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedConversationId === conversation.id ? 'bg-gray-50 dark:bg-gray-800' : ''
              } ${conversation.unreadCount > 0 ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage 
                    src={conversation.participants.find(p => p._id !== currentUserId)?.avatar} 
                    alt={conversation.participants.find(p => p._id !== currentUserId)?.name} 
                  />
                  <AvatarFallback>
                    {conversation.participants.find(p => p._id !== currentUserId)?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${conversation.unreadCount > 0 ? 'text-primary' : ''}`}>
                      {conversation.participants.find(p => p._id !== currentUserId)?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {conversation.property.title}
                  </p>
                  <p className="text-xs truncate">
                    {conversation.lastMessage.content}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="mt-1">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 