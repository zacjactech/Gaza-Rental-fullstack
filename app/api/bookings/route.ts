import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Booking from '@/lib/models/booking';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';

// GET /api/bookings - Get bookings (tenant gets their own, landlord gets theirs)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get token from authorization header or cookies
    let token = request.headers.get('authorization')?.split(' ')[1];
    
    // If no token in authorization header, try to get it from cookies
    if (!token) {
      token = request.headers.get('cookie')?.split('; ')
        .find(cookie => cookie.startsWith('token='))
        ?.split('=')[1];
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const userData = verifyToken(token);
    
    // Build query based on user role
    const query: any = {};
    if (userData.role === 'tenant') {
      query.tenant = userData.id;
    } else if (userData.role === 'landlord') {
      query.landlordId = userData.id;
    }
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }
    
    // Get bookings with populated fields
    const bookings = await Booking.find(query)
      .populate('property', 'title location price image')
      .populate('tenant', 'name email phone avatar')
      .populate('landlordId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Get token from authorization header or cookies
    let token = request.headers.get('authorization')?.split(' ')[1];
    
    // If no token in authorization header, try to get it from cookies
    if (!token) {
      token = request.headers.get('cookie')?.split('; ')
        .find(cookie => cookie.startsWith('token='))
        ?.split('=')[1];
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const userData = verifyToken(token);
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['propertyId', 'startDate', 'duration'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create booking
    const booking = await Booking.create({
      tenant: userData.id,
      property: data.propertyId,
      startDate: new Date(data.startDate),
      duration: data.duration,
      message: data.message,
      status: 'pending'
    });
    
    // Populate the booking with related data
    await booking.populate([
      { path: 'property', select: 'title location price image landlordId' },
      { path: 'tenant', select: 'name email phone avatar' }
    ]);
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 