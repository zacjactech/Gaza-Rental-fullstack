import mongoose from 'mongoose';

// Connection status tracking
interface ConnectionStatus {
  isConnected: boolean;
  hasErrored: boolean;
  lastError: Error | null;
  lastConnected: Date | null;
  connectionAttempts: number;
}

// Create global MongoConnection object
declare global {
  var mongoConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    status: ConnectionStatus;
  };
}

// Initialize global connection object if it doesn't exist
if (!global.mongoConnection) {
  global.mongoConnection = {
    conn: null, 
    promise: null,
    status: {
      isConnected: false,
      hasErrored: false,
      lastError: null,
      lastConnected: null,
      connectionAttempts: 0
    }
  };
}

/**
 * Connect to MongoDB
 * @returns Mongoose instance
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // If we're already connected, return the existing connection
  if (global.mongoConnection.conn) {
    if (mongoose.connection.readyState === 1) {
      return global.mongoConnection.conn;
    }
  }

  // Increment connection attempts counter
  global.mongoConnection.status.connectionAttempts++;

  // Get the MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI is not defined in environment variables');
    global.mongoConnection.status.hasErrored = true;
    global.mongoConnection.status.lastError = error;
    console.error('MongoDB Error: Missing MONGODB_URI environment variable');
    console.error('Please create a .env.local file with your MongoDB connection string or run:');
    console.error('  node create-env.js');
    throw error;
  }

  // If there's no existing connection promise, create a new one
  if (!global.mongoConnection.promise) {
    const opts = {
      bufferCommands: false,
      maxConnecting: 10,
      maxPoolSize: 10, // Keep connection pool size reasonable
      minPoolSize: 1,  // Maintain at least one connection
      socketTimeoutMS: 45000, // How long to wait before timing out
      connectTimeoutMS: 10000, // How long to wait for connection
      serverSelectionTimeoutMS: 10000, // Timeout for server selection
      heartbeatFrequencyMS: 10000, // How often to check server status
      retryWrites: true,
      w: 'majority', // Ensure write operations propagate to the majority
    };

    // Log the connection attempt
    const startTime = Date.now();
    console.log('MongoDB: Connecting to database...');

    // Create the connection promise
    global.mongoConnection.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        const connectionTime = Date.now() - startTime;
        console.log(`MongoDB: Connected successfully in ${connectionTime}ms`);
        
        // Update connection status
        global.mongoConnection.status.isConnected = true;
        global.mongoConnection.status.hasErrored = false;
        global.mongoConnection.status.lastError = null;
        global.mongoConnection.status.lastConnected = new Date();
        
        // Setup connection event listeners
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          global.mongoConnection.status.hasErrored = true;
          global.mongoConnection.status.lastError = err;
        });
        
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected');
          global.mongoConnection.status.isConnected = false;
        });
        
        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected');
          global.mongoConnection.status.isConnected = true;
          global.mongoConnection.status.lastConnected = new Date();
        });
        
        // Properly handle process termination
        process.on('SIGINT', async () => {
          try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
          } catch (err) {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
          }
        });
        
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB Connection Error:', err);
        global.mongoConnection.status.hasErrored = true;
        global.mongoConnection.status.lastError = err;
        global.mongoConnection.status.isConnected = false;

        // Clear the promise so we can retry
        global.mongoConnection.promise = null;
        throw err;
      });
  }

  // Wait for the connection to be established
  try {
    global.mongoConnection.conn = await global.mongoConnection.promise;
    return global.mongoConnection.conn;
  } catch (err) {
    // Clear the promise so we can retry next time
    global.mongoConnection.promise = null;
    throw err;
  }
}

/**
 * Get the current database connection status
 * @returns Connection status object
 */
export function getConnectionStatus(): ConnectionStatus {
  return global.mongoConnection.status;
}

/**
 * Close the database connection
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    if (global.mongoConnection.conn) {
      await mongoose.connection.close();
      global.mongoConnection.conn = null;
      global.mongoConnection.promise = null;
      global.mongoConnection.status.isConnected = false;
      console.log('MongoDB: Connection closed successfully');
    }
  } catch (err) {
    console.error('Error disconnecting from MongoDB:', err);
    throw err;
  }
}

// Create a named export object
const dbUtils = { 
  connectToDatabase, 
  disconnectFromDatabase, 
  getConnectionStatus 
};

export default dbUtils; 