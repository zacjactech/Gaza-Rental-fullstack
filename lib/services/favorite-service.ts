import Favorite, { IFavorite } from '../models/favorite';
import Property from '../models/property';
import User from '../models/user';
import { handleError } from '../utils';
import { connectToDatabase } from '../db';
import mongoose from 'mongoose';

// Favorite service
export const favoriteService = {
  // Add a property to favorites
  async addFavorite(userId: string, propertyId: string): Promise<IFavorite> {
    try {
      await connectToDatabase();
      
      // Validate property exists
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if already favorited
      const existingFavorite = await Favorite.findOne({
        user: userId,
        property: propertyId
      });
      
      if (existingFavorite) {
        return existingFavorite; // Already favorited, just return it
      }
      
      // Create new favorite
      const favorite = new Favorite({
        user: userId,
        property: propertyId
      });
      
      await favorite.save();
      return favorite;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Remove a property from favorites
  async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid IDs provided');
      }
      
      const result = await Favorite.findOneAndDelete({
        user: userId,
        property: propertyId
      });
      
      return !!result; // Return true if something was deleted
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get all favorites for a user
  async getUserFavorites(userId: string): Promise<any[]> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      const favorites = await Favorite.find({ user: userId })
        .populate('property')
        .sort({ createdAt: -1 });
      
      // Return just the property data with a favoriteId field
      return favorites.map(fav => ({
        ...fav.property.toObject(),
        favoriteId: fav._id
      }));
    } catch (error) {
      console.error('Failed to get user favorites:', error);
      return [];
    }
  },
  
  // Check if a property is favorited by a user
  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return false;
      }
      
      const favorite = await Favorite.findOne({
        user: userId,
        property: propertyId
      });
      
      return !!favorite;
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  },
  
  // Count user favorites
  async countUserFavorites(userId: string): Promise<number> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }
      
      return await Favorite.countDocuments({ user: userId });
    } catch (error) {
      console.error('Failed to count user favorites:', error);
      return 0;
    }
  },
  
  // Get most favorited properties
  async getMostFavorited(limit: number = 10): Promise<any[]> {
    try {
      await connectToDatabase();
      
      // Aggregate to count favorites by property
      const favoriteStats = await Favorite.aggregate([
        { $group: { _id: '$property', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);
      
      // Get the actual property data
      const propertyIds = favoriteStats.map(stat => stat._id);
      const properties = await Property.find({ _id: { $in: propertyIds } });
      
      // Map properties with their favorite count
      return properties.map(property => {
        const stats = favoriteStats.find(
          stat => stat._id.toString() === property._id.toString()
        );
        return {
          ...property.toObject(),
          favoriteCount: stats ? stats.count : 0
        };
      }).sort((a, b) => b.favoriteCount - a.favoriteCount);
    } catch (error) {
      console.error('Failed to get most favorited properties:', error);
      return [];
    }
  }
}; 