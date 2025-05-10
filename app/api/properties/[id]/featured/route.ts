import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Property from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { propertyService } from '@/lib/services/property-service';

export const dynamic = 'force-dynamic';

// PATCH /api/properties/:id/featured - Toggle featured status
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Check authentication and permissions
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Only admins can mark properties as featured
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can modify featured status' },
        { status: 403 }
      );
    }
    
    // Get the property ID from the route params - properly await it
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    
    // Get request body
    const { featured } = await request.json();
    
    // Find and update the property
    const property = await Property.findByIdAndUpdate(
      id,
      { featured: featured },
      { new: true, runValidators: true }
    );
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: `Property ${featured ? 'marked as' : 'removed from'} featured`,
      property
    });
  } catch (error) {
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 