/**
 * This script marks some existing properties as featured.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectToDatabase = async () => {
  try {
    console.log('MongoDB: Connecting to database...');
    const startTime = Date.now();
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB: Connected successfully in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error('MongoDB: Connection error:', error);
    process.exit(1);
  }
};

// Define the Property Schema
const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  price: Number,
  location: String,
  coordinates: [Number],
  bedrooms: Number,
  bathrooms: Number,
  size: Number,
  images: [String],
  amenities: [String],
  available: Boolean,
  featured: Boolean,
  landlordId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

// Get the Property model
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

const markFeaturedProperties = async () => {
  try {
    await connectToDatabase();
    
    // Find some properties to mark as featured (e.g., the newest ones)
    const properties = await Property.find({})
      .sort({ createdAt: -1 })
      .limit(6);
    
    if (!properties || properties.length === 0) {
      console.log('No properties found to mark as featured.');
      return;
    }
    
    console.log(`Found ${properties.length} properties to mark as featured.`);
    
    // Mark the first 4 properties as featured
    const featuredCount = Math.min(properties.length, 4);
    
    for (let i = 0; i < featuredCount; i++) {
      await Property.findByIdAndUpdate(properties[i]._id, { featured: true });
      console.log(`Marked property '${properties[i].title}' as featured.`);
    }
    
    console.log(`Successfully marked ${featuredCount} properties as featured.`);
  } catch (error) {
    console.error('Error marking properties as featured:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the function
markFeaturedProperties(); 