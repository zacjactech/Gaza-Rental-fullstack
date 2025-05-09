import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Booking from '@/lib/models/booking';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';

// POST /api/bookings/[id]/cancel - Cancel a booking
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Get booking ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Find booking
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to cancel this booking
    if (booking.tenant.toString() !== userData.id) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this booking' },
        { status: 403 }
      );
    }
    
    // Check if booking can be cancelled
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot cancel a booking with status: ${booking.status}` },
        { status: 400 }
      );
    }
    
    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    // Return updated booking with populated fields
    const updatedBooking = await Booking.findById(id)
      .populate('property', 'title location price image')
      .populate('tenant', 'name email phone avatar')
      .populate('landlordId', 'name email phone');
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 