require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { compareSync, hashSync } = bcrypt;

// Connection string
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables');
  console.error('Please create a .env.local file with your MongoDB connection string or run:');
  console.error('  node create-env.js');
  process.exit(1);
};

// Define User schema with the same implementation as the actual model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      lowercase: true
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
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
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Hash password with cost factor of 10
    user.password = hashSync(user.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Add comparePassword method - ensure this matches the production model implementation
userSchema.methods.comparePassword = function(candidatePassword) {
  console.log(`Comparing provided password "${candidatePassword}" with stored hash`);
  const result = compareSync(candidatePassword, this.password);
  console.log(`Comparison result: ${result}`);
  return result;
};

// Auth service functions
const authService = {
  // Create a test user
  async createUser(userData) {
    try {
      const User = mongoose.models.User || mongoose.model('User', userSchema);
      
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, will use existing user`);
        return existingUser;
      }

      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`Created new user with email ${userData.email}`);
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Login a user
  async login(email, password) {
    try {
      // Find user by email
      console.log(`Attempting login for email: ${email}`);
      const User = mongoose.models.User || mongoose.model('User', userSchema);
      const user = await User.findOne({ email });
      
      if (!user) {
        console.error(`Login failed: No user found with email ${email}`);
        throw new Error('Invalid credentials');
      }
      
      console.log(`User found: ${user.name} (${user._id})`);
      console.log(`Stored password hash: ${user.password}`);
      
      // Check password
      console.log(`Comparing password "${password}" with stored hash...`);
      const isPasswordValid = user.comparePassword(password);
      console.log(`Password validation result: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.error(`Login failed: Invalid password for user ${email}`);
        throw new Error('Invalid credentials');
      }

      // Generate token (simulated)
      const token = "test-token-" + Date.now();
      console.log('Login successful');

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};

async function main() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');
    
    // Test credentials
    const testEmail = 'testuser2@example.com';
    const testPassword = 'password123';
    
    // Create test user
    console.log('\nCreating test user...');
    const userData = {
      name: 'Test User 2',
      email: testEmail,
      password: testPassword,
      role: 'tenant'
    };
    
    const user = await authService.createUser(userData);
    console.log('User details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Test login with the user we just created
    console.log('\nTesting login with created user credentials...');
    
    try {
      // Wait a moment to ensure user is fully saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await authService.login(testEmail, testPassword);
      console.log('\nLogin successful!');
      console.log('User:', {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      });
    } catch (error) {
      console.error('\nLogin failed:', error.message);
    }
    
    console.log('\nTest complete!');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main(); 