import { NextResponse } from 'next/server';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/services/auth-service';
import mongoose from 'mongoose';
import Booking from '@/lib/models/booking';

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
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
    const booking = await Booking.findById(id)
      .populate('property')
      .populate('tenant', 'name email phone avatar')
      .populate('landlordId', 'name email phone avatar');
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this booking
    const isAuthorized = 
      booking.tenant._id.toString() === userData.id || 
      booking.landlordId._id.toString() === userData.id ||
      userData.role === 'admin';
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to view this booking' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
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
    
    // Get booking
    const booking = await Booking.findById(id)
      .populate('property')
      .populate('tenant', 'name email phone avatar')
      .populate('landlordId', 'name email phone avatar');
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate status
    if (!data.status || !['pending', 'approved', 'rejected', 'cancelled', 'completed'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Only landlord can approve/reject bookings
    if (['approved', 'rejected'].includes(data.status)) {
      // Verify user is the landlord or admin
      const isAuthorized = 
        booking.landlordId._id.toString() === userData.id || 
        userData.role === 'admin';
      
      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Not authorized to update this booking status' },
          { status: 403 }
        );
      }
    }
    
    // Only tenant can cancel their booking
    if (data.status === 'cancelled') {
      // If the user is not the tenant and not an admin
      if (booking.tenant._id.toString() !== userData.id && userData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only the tenant can cancel their booking' },
          { status: 403 }
        );
      }
    }
    
    // Update booking status
    booking.status = data.status;
    await booking.save();
    
    // Get the updated booking with populated fields
    const updatedBooking = await Booking.findById(id)
      .populate('property')
      .populate('tenant', 'name email phone avatar')
      .populate('landlordId', 'name email phone avatar');
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(`Error updating booking with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 