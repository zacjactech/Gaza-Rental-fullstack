/**
 * MongoDB Connection Test Script
 * 
 * This script tests the connection to MongoDB and lists available collections.
 * Run with: node scripts/test-db-connection.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Attempt to load environment variables from multiple possible locations
const envFiles = ['.env.local', '.env'];

let envLoaded = false;

// Try to load environment variables from available files
for (const file of envFiles) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    console.log('Loading environment from:', envPath);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.log('No .env files found, using process environment variables');
  dotenv.config();
}

// MongoDB connection string from env - no hardcoded default
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not defined.');
  console.log('Please create a .env.local file with your MongoDB connection string or run:');
  console.log('  node create-env.js');
  process.exit(1);
}

// Only show part of the URI for logging (hiding credentials)
const sanitizedUri = MONGODB_URI.replace(
  /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
  'mongodb$1://$2:****@'
);
console.log('Attempting to connect to MongoDB at:', sanitizedUri);

// Connect to MongoDB with timeout option
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000 // 10 seconds timeout
})
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    
    // List all collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      if (collections.length === 0) {
        console.log('\nNo collections found in the database.');
      } else {
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });

        // Count documents in each collection
        console.log('\nDocument counts:');
        for (const collection of collections) {
          try {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`- ${collection.name}: ${count} documents`);
          } catch (err) {
            console.log(`- ${collection.name}: Error counting documents - ${err.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error listing collections:', error.message);
    }
    
    // Close the connection
    try {
      await mongoose.connection.close();
      console.log('\nMongoDB connection closed');
    } catch (err) {
      console.error('Error closing connection:', err.message);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.error('Please check your connection string and ensure your MongoDB instance is running.');
    process.exit(1);
  }); 