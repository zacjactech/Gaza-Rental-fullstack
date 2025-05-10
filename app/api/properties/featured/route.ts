import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Property from '@/lib/models/property';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    const featuredProperties = await Property.find({ featured: true })
      .populate('landlordId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json(featuredProperties.map((property: any) => ({
      ...property,
      _id: property._id.toString(),
      landlordId: typeof property.landlordId === 'object' ? property.landlordId._id.toString() : property.landlordId,
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString()
    })));
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 