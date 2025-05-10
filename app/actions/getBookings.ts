import { connectToDatabase } from '@/lib/db';
import Booking from '@/lib/models/booking';
import { Types } from 'mongoose';
import Property from '@/lib/models/property';

interface IParams {
  id?: string;
  userId?: string;
  landlordId?: string;
}

export default async function getBookings(params: IParams) {
  try {
    const { id, userId, landlordId } = params;

    const query: any = {};

    if (id) {
      query.propertyId = id;
    }

    if (userId) {
      query.userId = userId;
    }

    if (landlordId) {
      // First find properties belonging to the landlord
      const properties = await Property.find({ landlordId }).lean();
      const propertyIds = properties.map(property => property._id);
      query.propertyId = { $in: propertyIds };
    }

    await connectToDatabase();

    const bookings = await Booking.find(query)
      .populate('userId', 'name email avatar')
      .populate('propertyId')
      .sort({ createdAt: 'desc' })
      .lean();

    return bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString(),
      userId: typeof booking.userId === 'object' 
        ? {
            ...booking.userId,
            _id: booking.userId._id.toString()
          }
        : booking.userId,
      propertyId: typeof booking.propertyId === 'object' 
        ? {
            ...booking.propertyId,
            _id: booking.propertyId._id.toString()
          }
        : booking.propertyId,
      startDate: booking.startDate?.toISOString(),
      endDate: booking.endDate?.toISOString(),
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString()
    }));
  } catch (error) {
    console.error('Error in getBookings:', error);
    return [];
  }
} 