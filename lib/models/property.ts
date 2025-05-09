import mongoose, { Schema, Document } from 'mongoose';

// Define the property interface
export interface IProperty extends Document {
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'studio';
  price: number;
  location: string;
  coordinates: [number, number]; // [latitude, longitude]
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  status: 'available' | 'rented' | 'pending';
  landlordId: mongoose.Types.ObjectId;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const propertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000
    },
    type: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'villa', 'studio']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 &&
            v[0] >= -90 && v[0] <= 90 && // latitude
            v[1] >= -180 && v[1] <= 180; // longitude
        },
        message: 'Invalid coordinates'
      }
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0
    },
    area: {
      type: Number,
      required: true,
      min: 0
    },
    images: [{
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Invalid image URL'
      }
    }],
    amenities: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      required: true,
      enum: ['available', 'rented', 'pending'],
      default: 'available'
    },
    featured: {
      type: Boolean,
      default: false
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for faster queries
propertySchema.index({ title: 'text', description: 'text', location: 'text' });
propertySchema.index({ type: 1, status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ coordinates: '2dsphere' });
propertySchema.index({ featured: 1 });

// Define a model or get it if it already exists
const Property = mongoose.models.Property || mongoose.model<IProperty>('Property', propertySchema);

export default Property; 