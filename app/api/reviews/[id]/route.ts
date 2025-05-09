import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/lib/models/review';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';
import mongoose from 'mongoose';

// GET /api/reviews/[id] - Get a specific review
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params
    const params = await context.params;
    const id = params.id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find the review and populate related fields
    const review = await Review.findById(id)
      .populate('userId', 'name email avatar')
      .populate('propertyId', 'title images location')
      .lean();
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Update a review
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params
    const params = await context.params;
    const id = params.id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
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
    if (!userData || !userData.id) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Find the review
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the review
    if (review.userId.toString() !== userData.id && userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to update this review' },
        { status: 403 }
      );
    }
    
    // Update only allowed fields
    const allowedFields = ['rating', 'content'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }
    
    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email avatar')
    .populate('propertyId', 'title images location');
    
    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params
    const params = await context.params;
    const id = params.id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }
    
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
    if (!userData || !userData.id) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Find the review
    const review = await Review.findById(id);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the review or is admin
    if (review.userId.toString() !== userData.id && userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this review' },
        { status: 403 }
      );
    }
    
    // Delete the review
    await Review.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 