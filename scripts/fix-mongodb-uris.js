/**
 * Script to remove hardcoded MongoDB URIs from test scripts
 * for security reasons
 */

const fs = require('fs');
const path = require('path');

// Files to process (relative to scripts directory)
const FILES_TO_FIX = [
  'test-login.js',
  'test-auth.js',
  'seed-db.js',
  'fix-user-schema.js',
  'create-test-user.js',
  'create-and-login.js',
  // Already fixed individually:
  // 'test-user-login.js',
  // 'test-simple.js',
];

// The replacement code
const REPLACEMENT_CODE = `const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables');
  console.error('Please create a .env.local file with your MongoDB connection string or run:');
  console.error('  node create-env.js');
  process.exit(1);
}`;

// Regular expression to match hardcoded MongoDB URIs
const MONGODB_URI_REGEX = /const MONGODB_URI = process\.env\.MONGODB_URI \|\| ['"]mongodb\+srv:\/\/.*['"]/;

// Process each file
FILES_TO_FIX.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filename}`);
      return;
    }
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Count original occurrences for verification
    const originalMatches = content.match(MONGODB_URI_REGEX);
    
    if (!originalMatches) {
      console.log(`No hardcoded MongoDB URI found in ${filename}`);
      return;
    }
    
    // Replace the hardcoded URI with the environment variable check
    content = content.replace(MONGODB_URI_REGEX, REPLACEMENT_CODE);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`✅ Fixed: ${filename}`);
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log('Done! Removed hardcoded MongoDB URIs from script files.'); 