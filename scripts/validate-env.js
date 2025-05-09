/**
 * Environment Variables Validation Script
 * 
 * Checks that necessary environment variables are properly set up
 * and validates that MongoDB connection works.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');

const REQUIRED_ENV_VARS = [
  { name: 'MONGODB_URI', description: 'MongoDB connection URI' },
  { name: 'JWT_SECRET', description: 'Secret key for JWT token generation' }
];

const RECOMMENDED_ENV_VARS = [
  { name: 'JWT_EXPIRES_IN', description: 'JWT token expiration time', defaultValue: '7d' },
  { name: 'COOKIE_NAME', description: 'Authentication cookie name', defaultValue: 'gazarental_auth' },
  { name: 'NODE_ENV', description: 'Node environment', defaultValue: 'development' }
];

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

async function main() {
  console.log(`${colors.cyan}${colors.bold}Gaza Rental Website - Environment Validation${colors.reset}\n`);
  
  // Check .env file existence
  let envFileExists = false;
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  
  for (const file of envFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`${colors.green}✓ ${file} file exists${colors.reset}`);
      envFileExists = true;
    }
  }
  
  if (!envFileExists) {
    console.log(`${colors.red}✗ No .env file found. Please run 'node create-env.js' to create one.${colors.reset}`);
  }
  
  // Check required environment variables
  let requiredVarsMissing = false;
  console.log(`\n${colors.cyan}${colors.bold}Required Environment Variables:${colors.reset}`);
  
  for (const envVar of REQUIRED_ENV_VARS) {
    if (process.env[envVar.name]) {
      // Mask sensitive variables for display
      const displayValue = envVar.name.includes('SECRET') || envVar.name.includes('URI') 
        ? '****' 
        : process.env[envVar.name];
      console.log(`${colors.green}✓ ${envVar.name}${colors.reset} is set`);
    } else {
      console.log(`${colors.red}✗ ${envVar.name}${colors.reset} is missing (${envVar.description})`);
      requiredVarsMissing = true;
    }
  }
  
  // Check recommended environment variables
  console.log(`\n${colors.cyan}${colors.bold}Recommended Environment Variables:${colors.reset}`);
  
  for (const envVar of RECOMMENDED_ENV_VARS) {
    if (process.env[envVar.name]) {
      console.log(`${colors.green}✓ ${envVar.name}${colors.reset} is set`);
    } else {
      console.log(`${colors.yellow}! ${envVar.name}${colors.reset} is not set (${envVar.description}) - will use default: ${envVar.defaultValue}`);
    }
  }
  
  // Early exit if required vars are missing
  if (requiredVarsMissing) {
    console.log(`\n${colors.red}${colors.bold}Critical Error: Missing required environment variables.${colors.reset}`);
    console.log(`Please run 'node create-env.js' to set up your environment variables.`);
    process.exit(1);
  }
  
  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length < 32) {
      console.log(`\n${colors.yellow}Warning: JWT_SECRET is too short (${jwtSecret.length} chars).${colors.reset}`);
      console.log(`For security, it should be at least 32 characters long.`);
    } else {
      console.log(`\n${colors.green}✓ JWT_SECRET has sufficient length (${jwtSecret.length} chars)${colors.reset}`);
    }
  }
  
  // Test MongoDB connection
  console.log(`\n${colors.cyan}${colors.bold}Testing MongoDB Connection:${colors.reset}`);
  
  try {
    console.log(`Connecting to MongoDB...`);
    const startTime = Date.now();
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    
    const connectionTime = Date.now() - startTime;
    
    console.log(`${colors.green}✓ Successfully connected to MongoDB in ${connectionTime}ms${colors.reset}`);
    
    // Get database info
    const adminDb = mongoose.connection.db.admin();
    const serverInfo = await adminDb.serverStatus();
    
    console.log(`${colors.green}• MongoDB Version: ${serverInfo.version}${colors.reset}`);
    console.log(`${colors.green}• Database Name: ${mongoose.connection.name}${colors.reset}`);
    
    await mongoose.connection.close();
    console.log(`${colors.green}✓ Connection closed successfully${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ MongoDB connection failed: ${error.message}${colors.reset}`);
    console.log(`Please check your MONGODB_URI value and ensure your database is accessible.`);
    process.exit(1);
  }
  
  // Validation successful
  console.log(`\n${colors.green}${colors.bold}Environment validation completed successfully! Your setup is correct.${colors.reset}`);
}

// Run the validation
main()
  .catch((error) => {
    console.error(`${colors.red}An error occurred during validation:${colors.reset}`, error);
    process.exit(1);
  }); 