import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Property from '@/lib/models/property';
import { IProperty } from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { propertyService } from '@/lib/services/property-service';
import { Types } from 'mongoose';

export const dynamic = 'force-dynamic';

// GET /api/properties - Get all properties with filtering and pagination
export async function GET() {
  try {
    await connectToDatabase();
    const properties = await Property.find()
      .populate('landlordId', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(properties.map((property: any) => ({
      ...property,
      _id: property._id.toString(),
      landlordId: typeof property.landlordId === 'object' ? property.landlordId._id.toString() : property.landlordId,
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString()
    })));
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const property = await Property.create(body);
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 