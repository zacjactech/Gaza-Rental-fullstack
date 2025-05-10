import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Property from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import { verifyToken } from '@/lib/services/auth-service';

export const dynamic = 'force-dynamic';

// GET /api/properties/landlord - Get properties for the current landlord
export async function GET(request: Request) {
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
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Build query
    const query: any = {
      landlordId: userData.id
    };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseInt(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseInt(maxPrice);
      }
    }
    
    // Get properties with populated fields
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching landlord properties:', error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 