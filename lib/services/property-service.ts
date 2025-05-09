import Property, { IProperty } from '../models/property';
import { handleError } from '../utils';
import { connectToDatabase } from '../db';

// Interface for property filters
export interface PropertyFilters {
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string[];
}

// Property service
export const propertyService = {
  // Get all properties with optional filtering
  async getAll(filters?: PropertyFilters): Promise<IProperty[]> {
    try {
      console.log('PropertyService: Connecting to database...');
      await connectToDatabase();
      console.log('PropertyService: Connected successfully');
      
      const query: any = {};
      
      // Apply filters if provided
      if (filters) {
        console.log('PropertyService: Applying filters:', JSON.stringify(filters));
        
        // Filter by location (text search)
        if (filters.location) {
          query.$text = { $search: filters.location };
        }
        
        // Filter by property type
        if (filters.propertyType && filters.propertyType !== 'all') {
          query.type = filters.propertyType;
        }
        
        // Filter by price range
        if (filters.minPrice) {
          query.price = { $gte: filters.minPrice };
        }
        
        if (filters.maxPrice) {
          query.price = { ...query.price, $lte: filters.maxPrice };
        }
        
        // Filter by bedrooms
        if (filters.bedrooms && filters.bedrooms !== 'any') {
          if (filters.bedrooms === '4+') {
            query.bedrooms = { $gte: 4 };
          } else {
            query.bedrooms = { $gte: parseInt(filters.bedrooms) };
          }
        }
        
        // Filter by bathrooms
        if (filters.bathrooms && filters.bathrooms !== 'any') {
          if (filters.bathrooms === '3+') {
            query.bathrooms = { $gte: 3 };
          } else {
            query.bathrooms = { $gte: parseInt(filters.bathrooms) };
          }
        }
        
        // Filter by amenities
        if (filters.amenities && filters.amenities.length > 0) {
          query.amenities = { $all: filters.amenities };
        }
      }
      
      console.log('PropertyService: Executing query...');
      const properties = await Property.find(query).sort({ createdAt: -1 });
      console.log(`PropertyService: Found ${properties.length} properties`);
      return properties;
    } catch (error) {
      console.error('PropertyService: Failed to fetch properties:', error);
      return [];
    }
  },
  
  // Get property by ID
  async getById(id: string): Promise<IProperty | null> {
    try {
      await connectToDatabase();
      const property = await Property.findById(id);
      return property;
    } catch (error) {
      console.error(`Failed to fetch property with ID ${id}:`, error);
      return null;
    }
  },
  
  // Get featured properties
  async getFeatured(): Promise<IProperty[]> {
    try {
      await connectToDatabase();
      const properties = await Property.find({ isVerified: true })
        .sort({ createdAt: -1 })
        .limit(4);
      return properties;
    } catch (error) {
      console.error('Failed to fetch featured properties:', error);
      return [];
    }
  },
  
  // Create a new property
  async create(propertyData: Partial<IProperty>): Promise<IProperty> {
    try {
      await connectToDatabase();
      const property = new Property(propertyData);
      await property.save();
      return property;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Update a property
  async update(id: string, propertyData: Partial<IProperty>): Promise<IProperty | null> {
    try {
      await connectToDatabase();
      const property = await Property.findByIdAndUpdate(
        id,
        { $set: propertyData },
        { new: true, runValidators: true }
      );
      return property;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Delete a property
  async delete(id: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const result = await Property.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Search properties by text
  async search(searchTerm: string): Promise<IProperty[]> {
    try {
      await connectToDatabase();
      const properties = await Property.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } });
      return properties;
    } catch (error) {
      console.error('Failed to search properties:', error);
      return [];
    }
  },
  
  // Find properties near a location
  async findNearby(lat: number, lng: number, maxDistance: number = 10000): Promise<IProperty[]> {
    try {
      await connectToDatabase();
      const properties = await Property.find({
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        }
      }).limit(20);
      return properties;
    } catch (error) {
      console.error('Failed to find nearby properties:', error);
      return [];
    }
  }
}; 