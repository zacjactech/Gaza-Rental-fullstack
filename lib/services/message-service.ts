import Message, { IMessage } from '../models/message';
import User from '../models/user';
import { handleError } from '../utils';
import { connectToDatabase } from '../db';
import mongoose from 'mongoose';

// Message service
export const messageService = {
  // Send a new message
  async sendMessage(messageData: {
    senderId: string;
    recipientId: string;
    content: string;
    propertyId?: string;
  }): Promise<IMessage> {
    try {
      await connectToDatabase();
      
      // Validate sender exists
      const sender = await User.findById(messageData.senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }
      
      // Validate recipient exists
      const recipient = await User.findById(messageData.recipientId);
      if (!recipient) {
        throw new Error('Recipient not found');
      }
      
      // Create message
      const message = new Message({
        sender: messageData.senderId,
        recipient: messageData.recipientId,
        content: messageData.content,
        propertyId: messageData.propertyId
      });
      
      await message.save();
      return message;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get message by ID
  async getById(id: string): Promise<IMessage | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid message ID');
      }
      
      return await Message.findById(id)
        .populate('sender', 'name email avatar')
        .populate('recipient', 'name email avatar');
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Mark message as read
  async markAsRead(id: string): Promise<IMessage | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid message ID');
      }
      
      return await Message.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get all messages for a user (both sent and received)
  async getByUserId(userId: string): Promise<IMessage[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      const messages = await Message.find({
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .sort({ createdAt: -1 });
      
      return messages;
    } catch (error) {
      console.error('Failed to get user messages:', error);
      return [];
    }
  },
  
  // Get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      return await Message.countDocuments({
        recipient: userId,
        isRead: false
      });
    } catch (error) {
      console.error('Failed to get unread message count:', error);
      return 0;
    }
  },
  
  // Get conversations for a user (grouped)
  async getConversations(userId: string): Promise<any[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      // Get all messages for this user
      const messages = await Message.find({
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .sort({ createdAt: -1 });
      
      // Group messages by conversation partner
      const conversations = new Map();
      
      messages.forEach(message => {
        const isSender = message.sender._id.toString() === userId;
        const partnerId = isSender ? 
          message.recipient._id.toString() : 
          message.sender._id.toString();
        
        const partner = isSender ? message.recipient : message.sender;
        
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, {
            partner,
            messages: [],
            unreadCount: 0,
            lastMessage: null
          });
        }
        
        const convo = conversations.get(partnerId);
        convo.messages.push(message);
        
        // Track last message
        if (!convo.lastMessage || message.createdAt > convo.lastMessage.createdAt) {
          convo.lastMessage = message;
        }
        
        // Count unread messages (only those received by the user)
        if (!isSender && !message.isRead) {
          convo.unreadCount++;
        }
      });
      
      return Array.from(conversations.values());
    } catch (error) {
      console.error('Failed to get user conversations:', error);
      return [];
    }
  },
  
  // Get conversation between two users
  async getConversation(userId1: string, userId2: string): Promise<IMessage[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
        throw new Error('Invalid user ID');
      }
      
      const messages = await Message.find({
        $or: [
          { sender: userId1, recipient: userId2 },
          { sender: userId2, recipient: userId1 }
        ]
      })
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .sort({ createdAt: 1 });
      
      return messages;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return [];
    }
  },
  
  // Mark all messages from a sender as read
  async markAllAsRead(recipientId: string, senderId: string): Promise<number> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(recipientId) || !mongoose.Types.ObjectId.isValid(senderId)) {
        throw new Error('Invalid user ID');
      }
      
      const result = await Message.updateMany(
        { sender: senderId, recipient: recipientId, isRead: false },
        { isRead: true }
      );
      
      return result.modifiedCount;
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      return 0;
    }
  }
}; 