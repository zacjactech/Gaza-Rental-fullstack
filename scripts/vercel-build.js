const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure scripts directory exists
if (!fs.existsSync('scripts')) {
  fs.mkdirSync('scripts');
}

// Function to check if MongoDB connection string is available
function checkMongoDBConnection() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      return envContent.includes('MONGODB_URI=');
    }
    return false;
  } catch (error) {
    console.error('Error checking MongoDB connection:', error);
    return false;
  }
}

// Main build process
try {
  console.log('Starting build process...');
  
  // Check MongoDB connection
  const hasMongoDB = checkMongoDBConnection();
  console.log('MongoDB connection available:', hasMongoDB);

  // Run Next.js build
  console.log('Running Next.js build...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 