import { NextResponse } from "next/server";
import Booking from "@/lib/models/booking";
import { connectToDatabase } from "@/lib/db";

interface IParams {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    await connectToDatabase();
    const booking = await Booking.findById(params.id)
      .populate('userId', 'name email avatar')
      .populate('propertyId')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...booking,
      _id: booking._id.toString(),
      userId: booking.userId._id.toString(),
      propertyId: booking.propertyId._id.toString(),
      startDate: booking.startDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    await connectToDatabase();
    const booking = await Booking.findByIdAndDelete(params.id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 