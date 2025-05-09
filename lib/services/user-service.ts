import User, { IUser } from '../models/user';
import { handleError } from '../utils';
import { connectToDatabase } from '../db';
import mongoose from 'mongoose';
import { hashSync } from 'bcrypt';

// User service
export const userService = {
  // Get user by ID
  async getById(id: string): Promise<IUser | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user ID');
      }
      
      return await User.findById(id);
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get user by email
  async getByEmail(email: string): Promise<IUser | null> {
    try {
      await connectToDatabase();
      
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Update user profile
  async updateProfile(id: string, updateData: {
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<IUser | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user ID');
      }
      
      // Create an object with only the fields that should be updated
      const updates: any = {};
      if (updateData.name) updates.name = updateData.name;
      if (updateData.phone) updates.phone = updateData.phone;
      if (updateData.avatar) updates.avatar = updateData.avatar;
      
      return await User.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Change user password
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user ID');
      }
      
      // Find user
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      if (!user.comparePassword(currentPassword)) {
        throw new Error('Current password is incorrect');
      }
      
      // Password length validation
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }
      
      // Update password
      user.password = hashSync(newPassword, 10);
      await user.save();
      
      return true;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Change user role (admin only)
  async changeRole(id: string, role: 'tenant' | 'landlord' | 'admin'): Promise<IUser | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user ID');
      }
      
      return await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Verify user (admin only)
  async verifyUser(id: string): Promise<IUser | null> {
    try {
      await connectToDatabase();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid user ID');
      }
      
      return await User.findByIdAndUpdate(
        id,
        { isVerified: true },
        { new: true }
      );
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
  
  // Get all users (admin only, with pagination)
  async getAll(page: number = 1, limit: number = 10): Promise<{ users: IUser[]; total: number; pages: number }> {
    try {
      await connectToDatabase();
      
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments()
      ]);
      
      return {
        users,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Failed to get users:', error);
      return { users: [], total: 0, pages: 0 };
    }
  },
  
  // Get landlords
  async getLandlords(): Promise<IUser[]> {
    try {
      await connectToDatabase();
      
      return await User.find({ role: 'landlord' })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Failed to get landlords:', error);
      return [];
    }
  },
  
  // Search users
  async search(query: string): Promise<IUser[]> {
    try {
      await connectToDatabase();
      
      return await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).limit(10);
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }
}; 