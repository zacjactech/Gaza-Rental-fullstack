import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user';
import { IProperty } from './property';

// Define the favorite interface
export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId | IUser;
  property: mongoose.Types.ObjectId | IProperty;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const FavoriteSchema = new Schema<IFavorite>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    property: { 
      type: Schema.Types.ObjectId, 
      ref: 'Property', 
      required: true 
    }
  },
  { 
    timestamps: true,
    suppressReservedKeysWarning: true // Suppress Mongoose reserved keyword warnings
  }
);

// Create unique index to ensure one favorite entry per user per property
FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });
FavoriteSchema.index({ user: 1 });
FavoriteSchema.index({ property: 1 });
FavoriteSchema.index({ createdAt: -1 });

// Define a model or get it if it already exists
const Favorite = mongoose.models.Favorite as Model<IFavorite> || 
  mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite; 