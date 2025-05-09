import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Create compound index to ensure one review per user per property
reviewSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

// Create text index for content search
reviewSchema.index({ content: 'text' });

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review; 