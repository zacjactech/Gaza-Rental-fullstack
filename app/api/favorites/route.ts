import { NextResponse } from 'next/server';
import { favoriteService } from '@/lib/services/favorite-service';
import { handleError } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/services/auth-service';

// GET /api/favorites - Get user favorites
export async function GET(request: Request) {
  try {
    // Connect to MongoDB
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
    
    // Get user favorites
    const favorites = await favoriteService.getUserFavorites(userData.id);
    
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add property to favorites
export async function POST(request: Request) {
  try {
    // Connect to MongoDB
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
    if (!data.propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // Add to favorites
    const favorite = await favoriteService.addFavorite(userData.id, data.propertyId);
    
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove property from favorites
export async function DELETE(request: Request) {
  try {
    // Connect to MongoDB
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
    
    // Get property ID from query params
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // Remove from favorites
    const success = await favoriteService.removeFavorite(userData.id, propertyId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Property not found in favorites' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 