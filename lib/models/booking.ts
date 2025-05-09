import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  startDate: Date;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(v: Date) {
          return v > new Date();
        },
        message: 'Start date must be in the future'
      }
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 36
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
bookingSchema.index({ userId: 1, propertyId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1 });

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking; 