export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Booking from '@/lib/models/booking';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';

// GET /api/bookings/landlord - Get bookings for the current landlord's properties
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get token from cookie (handled by middleware)
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const userData = verifyToken(token);
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    const query: any = {
      'property.landlordId': userData.id
    };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startDate.$lte = new Date(endDate);
      }
    }
    
    // Get bookings with populated fields
    const bookings = await Booking.find(query)
      .populate('user', 'name email avatar')
      .populate('property', 'title location images')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching landlord bookings:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 