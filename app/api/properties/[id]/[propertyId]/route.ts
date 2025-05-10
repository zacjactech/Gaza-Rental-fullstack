import { NextResponse } from "next/server";
import Property from "@/lib/models/property";
import { connectToDatabase } from "@/lib/db";

interface IParams {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    await connectToDatabase();
    const property = await Property.findById(params.id)
      .populate('landlordId', 'name email avatar')
      .lean();

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...property,
      _id: property._id.toString(),
      landlordId: property.landlordId._id.toString(),
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const property = await Property.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    await connectToDatabase();
    const property = await Property.findByIdAndDelete(params.id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 