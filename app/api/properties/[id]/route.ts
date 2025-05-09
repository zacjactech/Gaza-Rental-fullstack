import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Property from '@/lib/models/property';
import { handleError } from '@/lib/utils';
import mongoose from 'mongoose';

// GET /api/properties/[id] - Get a property by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params before destructuring
    const params = await context.params;
    const id = params.id;
    
    // Early validation of ID format before connecting to DB
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID format' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const property = await Property.findById(id)
      .populate('landlordId', 'name email phone avatar')
      .lean();
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error(`Error fetching property:`, error);
    
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid property ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id] - Update a property
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params before destructuring
    const params = await context.params;
    const id = params.id;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID format' },
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
    
    // Parse request body
    const data = await request.json();
    
    // Find and update property
    const property = await Property.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('landlordId', 'name email phone');
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error(`Error updating property:`, error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Property validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Properly await the params before destructuring
    const params = await context.params;
    const id = params.id;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid property ID format' },
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
    
    const property = await Property.findByIdAndDelete(id);
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting property:`, error);
    return NextResponse.json(
      { error: handleError(error) },
      { status: 500 }
    );
  }
} 