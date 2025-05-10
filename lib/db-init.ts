import { connectToDatabase } from './db';
import { shouldSkipDbConnection, logSkippedConnection } from './db-skip';

// Initialize database connection
let connectionPromise: Promise<any> | null = null;

export async function initializeDatabase() {
  // Skip database connection during build
  if (shouldSkipDbConnection()) {
    logSkippedConnection();
    return Promise.resolve(true);
  }

  if (!connectionPromise) {
    connectionPromise = connectToDatabase()
      .then(() => {
        console.log('Database initialized during server startup');
        return true;
      })
      .catch((err) => {
        console.error('Failed to initialize database during server startup:', err);
        // Reset the promise so we can try again
        connectionPromise = null;
        return false;
      });
  }
  return connectionPromise;
}

// Export a function to get the connection promise
export function getConnectionPromise() {
  if (!connectionPromise) {
    return initializeDatabase();
  }
  return connectionPromise;
}

// Initialize the connection immediately when this module is imported
// Only if we're not in a build environment
if (!shouldSkipDbConnection()) {
  initializeDatabase();
} 