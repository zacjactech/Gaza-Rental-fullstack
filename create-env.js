/**
 * Environment Variables Setup Script
 * This script helps create a .env.local file with necessary environment variables
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const readline = require('readline');

// Define required environment variables with descriptions
const ENV_VARS = [
  {
    name: 'MONGODB_URI',
    default: '',
    description: 'MongoDB connection URI',
    example: 'mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority',
    required: true
  },
  {
    name: 'JWT_SECRET',
    default: crypto.randomBytes(64).toString('hex'),
    description: 'Secret key for JWT token generation',
    example: 'randomly generated for you',
    required: true
  },
  {
    name: 'JWT_EXPIRES_IN',
    default: '7d',
    description: 'JWT token expiration time',
    example: '7d, 24h, 60m, etc.',
    required: false
  },
  {
    name: 'COOKIE_NAME',
    default: 'gazarental_auth',
    description: 'Authentication cookie name',
    example: 'gazarental_auth',
    required: false
  },
  {
    name: 'NODE_ENV',
    default: 'development',
    description: 'Node environment (development, production, test)',
    example: 'development',
    required: false
  }
];

// Check if .env.local already exists
const envFilePath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create .env.local file
async function createEnvFile() {
  console.log('\n===== Gaza Rental Website Environment Setup =====\n');
  
  let existingEnv = {};
  
  // Check if .env.local already exists
  if (fs.existsSync(envFilePath)) {
    console.log('An existing .env.local file was found.');
    const answer = await askQuestion('Do you want to overwrite it? (y/n): ');
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Your existing .env.local file remains unchanged.');
      rl.close();
      return;
    }
    
    // Read existing .env.local to preserve values user might want to keep
    try {
      const envContent = fs.readFileSync(envFilePath, 'utf8');
      envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            existingEnv[key.trim()] = value.trim();
          }
        }
      });
    } catch (error) {
      console.error('Error reading existing .env.local file:', error.message);
    }
  }
  
  // Copy content from env.example if it exists
  let exampleEnv = {};
  if (fs.existsSync(envExamplePath)) {
    try {
      const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
      exampleContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            exampleEnv[key.trim()] = value.trim();
          }
        }
      });
      console.log('Found env.example file and loaded default values.');
    } catch (error) {
      console.error('Error reading env.example file:', error.message);
    }
  }
  
  // Build the content for the .env.local file
  let envContent = `# Gaza Rental Website Environment Variables\n`;
  envContent += `# Generated on ${new Date().toISOString()}\n\n`;
  
  for (const envVar of ENV_VARS) {
    envContent += `# ${envVar.description}\n`;
    
    // Get existing value, user input, or default
    let value;
    if (existingEnv[envVar.name]) {
      const keepExisting = await askQuestion(
        `${envVar.name} already has a value. Keep it? (y/n, current: ${maskSensitiveValue(envVar.name, existingEnv[envVar.name])}): `
      );
      
      if (keepExisting.toLowerCase() === 'y') {
        value = existingEnv[envVar.name];
      } else {
        value = await askQuestion(
          `Enter ${envVar.name} (${envVar.required ? 'required' : 'optional'}, example: ${envVar.example}): `,
          envVar.default,
          envVar.required
        );
      }
    } else if (exampleEnv[envVar.name] && exampleEnv[envVar.name] !== '') {
      const useExample = await askQuestion(
        `Use example value for ${envVar.name}? (y/n, example: ${maskSensitiveValue(envVar.name, exampleEnv[envVar.name])}): `
      );
      
      if (useExample.toLowerCase() === 'y') {
        value = exampleEnv[envVar.name];
      } else {
        value = await askQuestion(
          `Enter ${envVar.name} (${envVar.required ? 'required' : 'optional'}, example: ${envVar.example}): `,
          envVar.default,
          envVar.required
        );
      }
    } else {
      value = await askQuestion(
        `Enter ${envVar.name} (${envVar.required ? 'required' : 'optional'}, example: ${envVar.example}): `,
        envVar.default,
        envVar.required
      );
    }
    
    envContent += `${envVar.name}=${value}\n\n`;
  }
  
  // Write the .env.local file
  try {
    fs.writeFileSync(envFilePath, envContent);
    console.log(`\n✅ Success! .env.local file created successfully.`);
  } catch (error) {
    console.error(`\n❌ Error writing .env.local file:`, error.message);
  }
  
  rl.close();
}

// Helper function to ask a question and return the answer
function askQuestion(question, defaultValue = '', required = false) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      // If answer is empty and there's a default, use the default
      if (!answer && defaultValue) {
        console.log(`Using default: ${maskSensitiveValue(question, defaultValue)}`);
        resolve(defaultValue);
      } 
      // If answer is empty, required is true, and no default, ask again
      else if (!answer && required && !defaultValue) {
        console.log('This field is required. Please provide a value.');
        askQuestion(question, defaultValue, required).then(resolve);
      } 
      // Otherwise use the provided answer
      else {
        resolve(answer || defaultValue);
      }
    });
  });
}

// Mask sensitive values for display (e.g., database passwords, secrets)
function maskSensitiveValue(name, value) {
  const sensitiveFields = ['SECRET', 'PASSWORD', 'KEY', 'URI', 'TOKEN'];
  
  if (sensitiveFields.some(field => name.toUpperCase().includes(field)) && value && value.length > 8) {
    return value.substring(0, 3) + '...' + value.substring(value.length - 3);
  }
  
  return value;
}

// Run the script
createEnvFile().catch(error => {
  console.error('Error creating .env.local file:', error);
  rl.close();
}); 