/**
 * Environment variables checker script
 * Run with: node check-env.js
 */

// Required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'NODE_ENV'
];

// Optional environment variables
const optionalEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'VERCEL_PROJECT_ID',
  'VERCEL_ORG_ID',
  'NEXT_PUBLIC_ANALYTICS_ID',
  'COOKIE_NAME',
  'SECURE_COOKIES',
  'NEXT_PUBLIC_SITE_URL'
];

// Load environment variables from .env and .env.local files if not in production
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config(); // Load from .env
    console.log('✅ Loaded variables from .env');
  } catch (err) {
    console.log('⚠️ No .env file found');
  }
  
  try {
    require('dotenv').config({ path: '.env.local', override: true }); // Load from .env.local with override
    console.log('✅ Loaded variables from .env.local');
  } catch (err) {
    console.log('⚠️ No .env.local file found');
  }
}

// Load variables from process.env and .env file into a combined object
const env = { ...process.env };

// Check required environment variables
console.log('\n🔍 Checking required environment variables...');
let missingRequired = false;

requiredEnvVars.forEach(envVar => {
  if (!env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    missingRequired = true;
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

// Check optional environment variables
console.log('\n🔍 Checking optional environment variables...');
optionalEnvVars.forEach(envVar => {
  if (!env[envVar]) {
    console.warn(`⚠️ Missing optional environment variable: ${envVar}`);
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

// Check MongoDB URI format
if (env.MONGODB_URI) {
  const mongoUriRegex = /^mongodb(\+srv)?:\/\/.+/;
  if (!mongoUriRegex.test(env.MONGODB_URI)) {
    console.error('❌ MONGODB_URI format appears to be invalid');
    missingRequired = true;
  } else {
    console.log('✅ MONGODB_URI format appears valid');
  }
}

// Check JWT_SECRET strength
if (env.JWT_SECRET) {
  if (env.JWT_SECRET.length < 32) {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters long for security');
  } else {
    console.log('✅ JWT_SECRET length is good');
  }
}

// Final result
console.log('\n📝 Environment check summary:');
if (missingRequired) {
  console.error('❌ Some required environment variables are missing or invalid');
  console.log('Please set all required environment variables before deploying');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  console.log('You are ready to deploy! 🚀');
  process.exit(0);
} 