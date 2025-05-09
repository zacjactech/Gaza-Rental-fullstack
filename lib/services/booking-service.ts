import Booking, { IBooking, BookingStatus } from '../models/booking';
import Property from '../models/property';
import User from '../models/user';
import { handleError } from '../utils';
import { connectToDatabase } from '../db';
import mongoose from 'mongoose';

// Booking service
export const bookingService = {
  // Create a new booking
  async create(bookingData: {
    tenantId: string;
    propertyId: string;
    startDate: Date;
    duration: number;
    message?: string;
  }): Promise<IBooking> {
    try {
      await connectToDatabase();
      
      // Validate property exists
      const property = await Property.findById(bookingData.propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Validate tenant exists
      const tenant = await User.findById(bookingData.tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      // Get landlord ID from property
      const landlordId = property.landlordId || property.userId; // Use landlordId field
      
      // Calculate total price
      const totalPrice = property.price * bookingData.duration;
      
      // Create booking
      const booking = new Booking({
        tenant: bookingData.tenantId,
        property: bookingData.propertyId,
        landlordId: landlordId, // Use landlordId field
        startDate: bookingData.startDate,
        duration: bookingData.duration,
        message: bookingData.message,
        totalPrice: totalPrice,
        status: 'pending',
        paymentStatus: 'unpaid'
      });
      
      await booking.save();
      return booking;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get booking by ID
  async getById(id: string): Promise<IBooking | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid booking ID');
      }
      
      const booking = await Booking.findById(id)
        .populate('tenant', 'name email phone')
        .populate('property')
        .populate('landlordId', 'name email phone');
      
      return booking;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Update booking status
  async updateStatus(id: string, status: BookingStatus): Promise<IBooking | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid booking ID');
      }
      
      const booking = await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );
      
      return booking;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get bookings for a tenant
  async getByTenantId(tenantId: string): Promise<IBooking[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        throw new Error('Invalid tenant ID');
      }
      
      const bookings = await Booking.find({ tenant: tenantId })
        .populate('property')
        .populate('landlordId', 'name email phone')
        .sort({ createdAt: -1 });
      
      return bookings;
    } catch (error) {
      console.error('Failed to get tenant bookings:', error);
      return [];
    }
  },
  
  // Get bookings for a landlord
  async getByLandlordId(landlordId: string): Promise<IBooking[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(landlordId)) {
        throw new Error('Invalid landlord ID');
      }
      
      const bookings = await Booking.find({ landlordId: landlordId }) // Changed from landlord to landlordId
        .populate('property')
        .populate('tenant', 'name email phone')
        .populate('landlordId', 'name email phone')
        .sort({ createdAt: -1 });
      
      return bookings;
    } catch (error) {
      console.error('Failed to get landlord bookings:', error);
      return [];
    }
  },
  
  // Get bookings for a property
  async getByPropertyId(propertyId: string): Promise<IBooking[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new Error('Invalid property ID');
      }
      
      const bookings = await Booking.find({ property: propertyId })
        .populate('tenant', 'name email phone')
        .populate('landlordId', 'name email phone')
        .sort({ createdAt: -1 });
      
      return bookings;
    } catch (error) {
      console.error('Failed to get property bookings:', error);
      return [];
    }
  },
  
  // Cancel a booking (by tenant)
  async cancelBooking(id: string, userId: string): Promise<IBooking | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid booking ID');
      }
      
      // Find booking and verify tenant is cancelling
      const booking = await Booking.findById(id);
      
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      if (booking.tenant.toString() !== userId) {
        throw new Error('Unauthorized to cancel this booking');
      }
      
      if (booking.status !== 'pending' && booking.status !== 'approved') {
        throw new Error(`Cannot cancel a booking with status: ${booking.status}`);
      }
      
      // Update status to cancelled
      booking.status = 'cancelled';
      await booking.save();
      
      return booking;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Update payment status
  async updatePaymentStatus(id: string, paymentStatus: 'unpaid' | 'partial' | 'paid'): Promise<IBooking | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid booking ID');
      }
      
      const booking = await Booking.findByIdAndUpdate(
        id,
        { paymentStatus },
        { new: true, runValidators: true }
      );
      
      return booking;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }
}; 