import { NextResponse } from 'next/server';
import { Message } from '@/lib/models/message';
import { handleError } from '@/lib/utils';
import { withDatabase } from '@/lib/utils/api-utils';

// GET /api/messages/unread-count - Get the number of unread messages for the current user
export const GET = withDatabase(async (req: Request, token, userData) => {
  try {
    // Count unread messages where the current user is the recipient
    const count = await Message.countDocuments({
      'recipient._id': userData.id,
      read: false
    });

    // If the above query doesn't work, try this alternative format
    if (count === 0) {
      const alternativeCount = await Message.countDocuments({
        recipient: userData.id,
        read: false
      });
      
      return NextResponse.json({ count: alternativeCount });
    }

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}); 