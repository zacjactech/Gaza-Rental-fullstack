require('dotenv').config();
const mongoose = require('mongoose');

// Connection string
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables');
  console.error('Please create a .env.local file with your MongoDB connection string or run:');
  console.error('  node create-env.js');
  process.exit(1);
};

async function main() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');
    
    // Get direct access to the collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // List all indexes on the users collection
    console.log('\nCurrent indexes on users collection:');
    const indexes = await usersCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Drop the problematic username index
    console.log('\nDropping username index...');
    try {
      await usersCollection.dropIndex('username_1');
      console.log('Successfully dropped username index');
    } catch (error) {
      console.error('Error dropping index:', error.message);
    }
    
    // List updated indexes
    console.log('\nUpdated indexes on users collection:');
    const updatedIndexes = await usersCollection.indexes();
    console.log(JSON.stringify(updatedIndexes, null, 2));
    
    console.log('\nFix complete!');
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main(); 