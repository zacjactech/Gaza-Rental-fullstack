import mongoose, { Schema, Document, Model } from 'mongoose';
import { compareSync, hashSync } from 'bcrypt';

// Define the User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'landlord' | 'admin';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): boolean;
}

// Define the User schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: { 
      type: String, 
      required: true,
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: { 
      type: String, 
      enum: ['tenant', 'landlord', 'admin'],
      default: 'tenant' 
    },
    avatar: { type: String },
    phone: { type: String },
    isVerified: { type: Boolean, default: false }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      // Remove password when converting to JSON
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true // Suppress warning about isNew reserved field
  }
);

// Create indexes - only index role and email (email index is created by unique: true)
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre('save', function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Hash password with cost factor of 10
    user.password = hashSync(user.password, 10);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords (without logging sensitive information)
UserSchema.methods.comparePassword = function(candidatePassword: string): boolean {
  // Use bcrypt's built-in comparison function
  return compareSync(candidatePassword, this.password);
};

// Define a model or get it if it already exists
const User = mongoose.models.User as Model<IUser> || 
  mongoose.model<IUser>('User', UserSchema);

export default User; 