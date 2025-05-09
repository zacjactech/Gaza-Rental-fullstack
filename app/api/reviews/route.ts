import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/lib/models/review';
import User from '@/lib/models/user';
import Property from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';

// GET /api/reviews - Get all reviews
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build query
    const query: any = {};
    
    if (propertyId) {
      query.propertyId = propertyId;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (rating) {
      query.rating = parseInt(rating);
    }
    
    const reviews = await Review.find(query)
      .populate('userId', 'name email avatar')
      .populate('propertyId', 'title images location')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(reviews.map((review: any) => ({
      ...review,
      _id: review._id.toString(),
      userId: typeof review.userId === 'object' ? review.userId._id.toString() : review.userId,
      propertyId: typeof review.propertyId === 'object' ? review.propertyId._id.toString() : review.propertyId,
      createdAt: review.createdAt?.toISOString(),
      updatedAt: review.updatedAt?.toISOString()
    })));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
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
    if (!userData || !userData.id) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['propertyId', 'rating', 'content'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if user has already reviewed this property
    const existingReview = await Review.findOne({
      userId: userData.id,
      propertyId: data.propertyId
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this property' },
        { status: 400 }
      );
    }
    
    // Create review
    const review = await Review.create({
      userId: userData.id,
      propertyId: data.propertyId,
      rating: data.rating,
      content: data.content
    });
    
    // Get user and property data
    const user = await User.findById(userData.id).select('name email avatar').lean();
    const property = await Property.findById(data.propertyId).select('title image').lean();
    
    // Create response
    const reviewResponse = {
      ...review.toObject(),
      user: user || { name: 'Anonymous User' },
      property: property || { title: 'Unknown Property' }
    };
    
    return NextResponse.json(reviewResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 