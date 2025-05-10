import { connectToDatabase } from "@/lib/db";
import Property from "@/lib/models/property";
import { Types } from "mongoose";

interface IParams {
  id?: string;
}

export default async function getPropertyById(params: IParams) {
  try {
    const { id } = params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return null;
    }

    await connectToDatabase();

    const property = await Property.findById(id)
      .populate('landlordId', 'name email avatar')
      .lean();

    if (!property) {
      return null;
    }

    return {
      ...property,
      _id: property._id.toString(),
      landlordId: typeof property.landlordId === 'object' 
        ? {
            ...property.landlordId,
            _id: property.landlordId._id.toString()
          }
        : property.landlordId,
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString()
    };
  } catch (error) {
    console.error('Error in getPropertyById:', error);
    return null;
  }
} 