import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getConnectionPromise } from '@/lib/db-init';
import { Message } from '@/lib/models/message';
import Property from '@/lib/models/property';
import User from '@/lib/models/user';
import { handleError } from '@/lib/utils';
import { authService } from '@/lib/services/auth-service';

// GET /api/messages - Get all conversations for the current user
export async function GET(request: Request) {
  try {
    // Get the token from the cookies or authorization header
    const token = request.headers.get('cookie')?.split('; ')
      .find(cookie => cookie.startsWith('token='))
      ?.split('=')[1] || 
      request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate token and get user
    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure database is connected
    await getConnectionPromise();

    // Get all messages where the user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { 'sender._id': user._id },
        { 'recipient._id': user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email avatar')
    .populate('recipient', 'name email avatar')
    .populate('property', 'title image');

    // Group messages by conversation (property + other participant)
    const conversations = messages.reduce((acc: any[], message) => {
      const otherParticipant = message.sender._id.toString() === user._id.toString() 
        ? message.recipient 
        : message.sender;
      
      const conversationId = `${message.property._id}-${otherParticipant._id}`;
      
      const existingConversation = acc.find(c => c.id === conversationId);
      
      if (existingConversation) {
        existingConversation.messages.push(message);
        if (message.createdAt > existingConversation.lastMessage.createdAt) {
          existingConversation.lastMessage = message;
        }
        if (!message.read && message.recipient._id.toString() === user._id.toString()) {
          existingConversation.unreadCount++;
        }
      } else {
        acc.push({
          id: conversationId,
          messages: [message],
          participants: [message.sender, message.recipient],
          property: message.property,
          lastMessage: message,
          unreadCount: !message.read && message.recipient._id.toString() === user._id.toString() ? 1 : 0
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: Request) {
  try {
    // Get the token from the cookies or authorization header
    const token = request.headers.get('cookie')?.split('; ')
      .find(cookie => cookie.startsWith('token='))
      ?.split('=')[1] || 
      request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate token and get user
    const user = await authService.validateToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, content, propertyId } = await request.json();

    if (!recipientId || !content || !propertyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure database is connected
    await getConnectionPromise();

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Create new message
    const message = await Message.create({
      sender: user._id,
      recipient: recipientId,
      property: propertyId,
      content,
      read: false
    });

    // Populate the message with sender, recipient, and property details
    await message.populate('sender', 'name email avatar');
    await message.populate('recipient', 'name email avatar');
    await message.populate('property', 'title image');

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 