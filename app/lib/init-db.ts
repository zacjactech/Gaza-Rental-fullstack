import { connectToDatabase } from '@/lib/db';

/**
 * Initialize the database connection
 * This function is called from the DatabaseInitializer component
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database connection from init-db.ts...');
    await connectToDatabase();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

export default initializeDatabase; 