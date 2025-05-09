"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import { handleError } from "@/lib/utils";
import { ConversationList, Conversation } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { useUser } from "@/contexts/UserContext";

export default function LandlordMessagesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError(handleError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up polling for new messages
    const intervalId = setInterval(fetchConversations, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user, router]);

  // Get current user ID
  const currentUserId = user?.id;
  
  // Count unread messages
  const unreadCount = conversations.reduce((count, conv) => count + conv.unreadCount, 0);
  
  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}/read`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to mark conversation as read');
      }

    setConversations(prev => 
      prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0, messages: conv.messages.map(m => ({ ...m, read: true })) }
            : conv
        )
      );
    } catch (err) {
      setError(handleError(err));
    }
  };
  
  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    markAsRead(conversation.id);
  };
  
  // Send new message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || !currentUserId) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedConversation.participants.find(p => p._id !== currentUserId)?._id,
          content: newMessage,
          propertyId: selectedConversation.property._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id
            ? {
                ...conv,
                messages: [...conv.messages, message],
                lastMessage: message
              }
            : conv
        )
      );
      setNewMessage('');
    } catch (err) {
      setError(handleError(err));
    }
  };

  // Handle viewing property
  const handleViewProperty = () => {
    if (selectedConversation) {
      router.push(`/properties/${selectedConversation.property._id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t?.messages?.title || 'Messages'}</h1>
          <p className="text-muted-foreground">
            {t?.messages?.description || 'Communicate with landlords and tenants'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="text-sm">
            {unreadCount} {t?.messages?.unread || 'unread'}
          </Badge>
        )}
      </div>
      
      <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
        {/* Conversations sidebar */}
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id || null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUserId || ''}
          placeholderText={t?.messages?.searchPlaceholder || 'Search messages...'}
          noConversationsText={t?.messages?.noConversations || 'No conversations yet'}
        />

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          <MessageThread
            conversation={selectedConversation}
            currentUserId={currentUserId || ''}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={sendMessage}
            onViewProperty={handleViewProperty}
            placeholderText={t?.messages?.messagePlaceholder || 'Type your message...'}
            noConversationText={t?.messages?.selectConversation || 'Select a conversation to start messaging'}
            viewPropertyText={t?.messages?.viewProperty || 'View Property'}
          />
        </div>
      </div>
    </div>
  );
} 