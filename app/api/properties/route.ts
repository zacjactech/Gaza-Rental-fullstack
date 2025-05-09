import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Property from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import { getCurrentUser } from '@/lib/utils/auth-utils';

// GET /api/properties - Get all properties with filtering and pagination
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Build query based on filters
    const query: any = {};
    
    // Add filters if they exist
    if (searchParams.get('type') && searchParams.get('type') !== 'all') {
      query.type = searchParams.get('type');
    }
    
    if (searchParams.get('location')) {
      query.location = { $regex: searchParams.get('location'), $options: 'i' };
    }
    
    if (searchParams.get('minPrice')) {
      const minPrice = Number(searchParams.get('minPrice'));
      if (!isNaN(minPrice)) {
        query.price = { ...query.price, $gte: minPrice };
      }
    }
    
    if (searchParams.get('maxPrice')) {
      const maxPrice = Number(searchParams.get('maxPrice'));
      if (!isNaN(maxPrice)) {
        query.price = { ...query.price, $lte: maxPrice };
      }
    }
    
    // Only add bedrooms if it's a valid number and not "any"
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms && bedrooms !== 'any') {
      const bedroomsNum = Number(bedrooms);
      if (!isNaN(bedroomsNum)) {
        query.bedrooms = bedroomsNum;
      }
    }
    
    // Only add bathrooms if it's a valid number and not "any"
    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms && bathrooms !== 'any') {
      const bathroomsNum = Number(bathrooms);
      if (!isNaN(bathroomsNum)) {
        query.bathrooms = bathroomsNum;
      }
    }
    
    // Add featured filter if specified
    if (searchParams.get('featured') === 'true') {
      query.featured = true;
    }
    
    if (searchParams.get('amenities')) {
      query.amenities = { $all: searchParams.get('amenities')?.split(',') };
    }
    
    // Pagination with safe defaults
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 12));
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Property.countDocuments(query);
    
    // Get properties with pagination
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('landlordId', 'name email phone')
      .lean();
    
    return NextResponse.json({ 
      properties, 
      pagination: { 
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      } 
    });
  } catch (error) {
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to create properties (landlord or admin)
    if (user.role !== 'landlord' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only landlords and admins can create properties' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'price', 'bedrooms', 'bathrooms', 'location'];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    const numericFields = ['price', 'bedrooms', 'bathrooms'];
    for (const field of numericFields) {
      if (data[field] && isNaN(Number(data[field]))) {
        return NextResponse.json(
          { error: `${field} must be a number` },
          { status: 400 }
        );
      }
    }
    
    // Create property with landlord ID from the authenticated user
    const property = await Property.create({
      ...data,
      landlordId: user._id, // Set the authenticated user as the landlord
      type: data.type || 'apartment',
      available: data.available !== undefined ? data.available : true,
      amenities: data.amenities || [],
      currency: data.currency || 'TZS',
      period: data.period || 'monthly',
      featured: data.featured || false
    });
    
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 