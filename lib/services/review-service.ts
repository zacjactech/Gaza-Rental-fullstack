import Review, { IReview } from '../models/review';
import Property from '../models/property';
import User from '../models/user';
import { handleError } from '../utils';
import { connectToDatabase } from '../db';
import mongoose from 'mongoose';

// Review service
export const reviewService = {
  // Create a new review
  async create(reviewData: {
    propertyId: string;
    reviewerId: string;
    rating: number;
    comment: string;
  }): Promise<IReview> {
    try {
      await connectToDatabase();
      
      // Validate property exists
      const property = await Property.findById(reviewData.propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Validate reviewer exists
      const reviewer = await User.findById(reviewData.reviewerId);
      if (!reviewer) {
        throw new Error('Reviewer not found');
      }
      
      // Check if user has already reviewed this property
      const existingReview = await Review.findOne({
        property: reviewData.propertyId,
        reviewer: reviewData.reviewerId
      });
      
      if (existingReview) {
        throw new Error('You have already reviewed this property');
      }
      
      // Create review
      const review = new Review({
        property: reviewData.propertyId,
        reviewer: reviewData.reviewerId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        isVerified: false // Reviews start unverified by default
      });
      
      await review.save();
      return review;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get review by ID
  async getById(id: string): Promise<IReview | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid review ID');
      }
      
      return await Review.findById(id)
        .populate('reviewer', 'name email avatar')
        .populate('property', 'title location');
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get reviews for a property
  async getByPropertyId(propertyId: string): Promise<IReview[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new Error('Invalid property ID');
      }
      
      return await Review.find({ property: propertyId })
        .populate('reviewer', 'name email avatar')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Failed to get property reviews:', error);
      return [];
    }
  },
  
  // Get reviews by a user
  async getByReviewerId(reviewerId: string): Promise<IReview[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
        throw new Error('Invalid reviewer ID');
      }
      
      return await Review.find({ reviewer: reviewerId })
        .populate('property', 'title location image')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Failed to get user reviews:', error);
      return [];
    }
  },
  
  // Update a review
  async update(id: string, reviewerId: string, updateData: {
    rating?: number;
    comment?: string;
  }): Promise<IReview | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid review ID');
      }
      
      // Find review and verify reviewer is updating
      const review = await Review.findById(id);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      if (review.reviewer.toString() !== reviewerId) {
        throw new Error('Unauthorized to update this review');
      }
      
      // Update review fields
      if (updateData.rating) review.rating = updateData.rating;
      if (updateData.comment) review.comment = updateData.comment;
      
      // Reset verification status if review is modified
      review.isVerified = false;
      
      await review.save();
      return review;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Delete a review
  async delete(id: string, reviewerId: string): Promise<boolean> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid review ID');
      }
      
      // Find review and verify reviewer is deleting
      const review = await Review.findById(id);
      
      if (!review) {
        throw new Error('Review not found');
      }
      
      if (review.reviewer.toString() !== reviewerId) {
        throw new Error('Unauthorized to delete this review');
      }
      
      await review.deleteOne();
      return true;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Verify a review (admin only)
  async verifyReview(id: string): Promise<IReview | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid review ID');
      }
      
      return await Review.findByIdAndUpdate(
        id,
        { isVerified: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get property average rating
  async getPropertyAverageRating(propertyId: string): Promise<{ average: number; count: number }> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        throw new Error('Invalid property ID');
      }
      
      const reviews = await Review.find({ property: propertyId });
      
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const average = totalRating / reviews.length;
      
      return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: reviews.length
      };
    } catch (error) {
      console.error('Failed to get property rating:', error);
      return { average: 0, count: 0 };
    }
  }
}; 