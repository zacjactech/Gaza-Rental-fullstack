const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if running on Windows
const isWindows = process.platform === 'win32';

// Helper function to run commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to execute command: ${command}`);
    console.error(error);
    return false;
  }
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting deployment process...');

  // 1. Clean up any previous build artifacts
  console.log('🧹 Cleaning up previous build...');
  if (fs.existsSync('.next')) {
    if (isWindows) {
      runCommand('rmdir /s /q .next');
    } else {
      runCommand('rm -rf .next');
    }
  }
  
  // 2. Install dependencies
  console.log('📦 Installing dependencies...');
  if (!runCommand('npm install')) {
    process.exit(1);
  }

  // 3. Create or verify .vercelignore
  console.log('📝 Verifying .vercelignore...');
  const vercelIgnore = [
    '.git',
    'node_modules',
    '.next',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store'
  ].join('\n');
  
  fs.writeFileSync('.vercelignore', vercelIgnore);
  
  // 4. Deploy to Vercel with production flag
  console.log('🚀 Deploying to Vercel...');
  runCommand('vercel --prod');

  console.log('✅ Deployment completed!');
}

// Run deployment
deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 