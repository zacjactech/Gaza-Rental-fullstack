import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getConnectionPromise } from '@/lib/db-init';
import { Message } from '@/lib/models/message';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';
import mongoose from 'mongoose';

// PATCH /api/messages/[id]/read - Mark a message as read
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params
    const params = await context.params;
    const id = params.id;
    
    // Validate message ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid message ID format' },
        { status: 400 }
      );
    }
    
    // Ensure database is connected
    await getConnectionPromise();
    
    // Get token from authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const cookieToken = request.headers.get('cookie')?.split('; ')
      .find(cookie => cookie.startsWith('token='))
      ?.split('=')[1];
    
    const token = headerToken || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token
    const userData = verifyToken(token);
    if (!userData || !userData.id) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Get message
    const message = await Message.findById(id);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Verify user is the recipient
    if (message.receiverId.toString() !== userData.id && userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the recipient can mark a message as read' },
        { status: 403 }
      );
    }
    
    // Mark message as read
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    
    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 