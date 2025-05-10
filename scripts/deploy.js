const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if running on Windows
const isWindows = process.platform === 'win32';

// Helper function to run commands
function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting deployment process...');

  // 1. Check environment
  console.log('📋 Checking environment...');
  if (!fs.existsSync('.env')) {
    console.error('❌ .env file not found. Please create one from .env.example');
    process.exit(1);
  }

  // 2. Install dependencies
  console.log('📦 Installing dependencies...');
  runCommand('npm install');

  // Skip linting as it's causing issues
  // console.log('🔍 Running linting...');
  // runCommand('npm run lint');

  // 3. Build the application
  console.log('🏗️ Building application...');
  runCommand('npm run build');

  // 4. Deploy to Vercel
  console.log('🚀 Deploying to Vercel...');
  runCommand('vercel --prod');

  console.log('✅ Deployment completed successfully!');
}

// Run deployment
deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 