import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Booking from '@/lib/models/booking';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';

// GET /api/bookings - Get bookings (tenant gets their own, landlord gets theirs)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const propertyId = searchParams.get('propertyId');

    const query: any = {};
    if (userId) query.userId = userId;
    if (propertyId) query.propertyId = propertyId;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email avatar')
      .populate('propertyId')
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json(bookings.map((booking: any) => ({
      ...booking,
      _id: booking._id.toString(),
      userId: typeof booking.userId === 'object' ? booking.userId._id.toString() : booking.userId,
      propertyId: typeof booking.propertyId === 'object' ? booking.propertyId._id.toString() : booking.propertyId,
      startDate: booking.startDate?.toISOString(),
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString()
    })));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const booking = await Booking.create(body);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 