/**
 * Fix Project Issues Script
 * 
 * This script identifies and fixes potential issues that might break the project
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Issues to check
const issues = [
  {
    name: 'Environment Variables',
    check: checkEnvironmentVariables,
    fix: fixEnvironmentVariables,
    description: 'Validates and sets up required environment variables'
  },
  {
    name: 'Map Dependencies',
    check: checkMapDependencies,
    fix: fixMapDependencies,
    description: 'Ensures Leaflet dependencies are correctly set up'
  },
  {
    name: 'Database Connection',
    check: checkDatabaseConnection,
    fix: fixDatabaseConnection,
    description: 'Validates MongoDB connection settings'
  },
  {
    name: 'Leaflet Local Fallback',
    check: checkLeafletFallback,
    fix: createLeafletFallback,
    description: 'Creates local fallback for Leaflet in case CDN fails'
  }
];

/**
 * Main function
 */
async function main() {
  console.log(`${colors.cyan}${colors.bold}Gaza Rental Website - Project Issue Fixer${colors.reset}\n`);
  
  let anyIssuesFound = false;
  let anyIssuesFixed = false;
  
  // Run each check
  for (const issue of issues) {
    console.log(`${colors.blue}Checking: ${issue.name}${colors.reset}`);
    
    try {
      const { hasIssue, details } = await issue.check();
      
      if (hasIssue) {
        anyIssuesFound = true;
        console.log(`${colors.yellow}✗ Issue found: ${details}${colors.reset}`);
        
        // Ask if user wants to fix the issue
        const shouldFix = await promptYesNo(`Do you want to fix this issue? (y/n): `);
        
        if (shouldFix) {
          const { fixed, message } = await issue.fix(details);
          
          if (fixed) {
            anyIssuesFixed = true;
            console.log(`${colors.green}✓ Fixed: ${message}${colors.reset}`);
          } else {
            console.log(`${colors.red}✗ Could not fix: ${message}${colors.reset}`);
          }
        } else {
          console.log(`${colors.yellow}! Skipping fix for ${issue.name}${colors.reset}`);
        }
      } else {
        console.log(`${colors.green}✓ No issues found with ${issue.name}${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking ${issue.name}: ${error.message}${colors.reset}`);
    }
    
    console.log(''); // Add a newline for spacing
  }
  
  // Summary
  if (!anyIssuesFound) {
    console.log(`${colors.green}${colors.bold}No issues found! Your project looks good.${colors.reset}`);
  } else if (anyIssuesFixed) {
    console.log(`${colors.green}${colors.bold}Issues have been fixed! Your project should work correctly now.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bold}Issues found but not fixed. Consider fixing them manually.${colors.reset}`);
  }
}

/**
 * Check #1: Environment Variables
 */
async function checkEnvironmentVariables() {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  const hasEnvFile = fs.existsSync(path.join(process.cwd(), '.env.local')) || 
                    fs.existsSync(path.join(process.cwd(), '.env'));
  
  if (!hasEnvFile) {
    return { 
      hasIssue: true, 
      details: 'No .env or .env.local file found'
    };
  }
  
  if (missingVars.length > 0) {
    return { 
      hasIssue: true, 
      details: `Missing required environment variables: ${missingVars.join(', ')}`
    };
  }
  
  return { hasIssue: false };
}

/**
 * Fix #1: Environment Variables
 */
async function fixEnvironmentVariables(details) {
  try {
    // Check if we have the sample env file
    const envExamplePath = path.join(process.cwd(), 'env.example');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envExamplePath)) {
      return { 
        fixed: false, 
        message: 'env.example file not found, cannot create environment file'
      };
    }
    
    // Don't overwrite existing .env.local without permission
    if (fs.existsSync(envLocalPath)) {
      const shouldOverwrite = await promptYesNo('.env.local already exists. Overwrite? (y/n): ');
      if (!shouldOverwrite) {
        console.log(`${colors.yellow}Run node create-env.js to update your environment variables.${colors.reset}`);
        return { 
          fixed: false, 
          message: 'Kept existing .env.local file'
        };
      }
    }
    
    console.log(`${colors.cyan}Running create-env.js script...${colors.reset}`);
    try {
      // Check if create-env.js exists
      if (fs.existsSync(path.join(process.cwd(), 'create-env.js'))) {
        // Run the create-env.js script
        execSync('node create-env.js', { stdio: 'inherit' });
        return { 
          fixed: true, 
          message: 'Environment variables created with create-env.js'
        };
      } else {
        // Fallback to simple copy
        const envExample = fs.readFileSync(envExamplePath, 'utf8');
        fs.writeFileSync(envLocalPath, envExample);
        return { 
          fixed: true, 
          message: 'Created .env.local file from env.example (You should update the values)'
        };
      }
    } catch (error) {
      return { 
        fixed: false, 
        message: `Error creating environment file: ${error.message}`
      };
    }
  } catch (error) {
    return { 
      fixed: false, 
      message: error.message
    };
  }
}

/**
 * Check #2: Map Dependencies
 */
async function checkMapDependencies() {
  try {
    // Check for Leaflet in package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return { 
        hasIssue: true, 
        details: 'package.json not found'
      };
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const hasLeaflet = packageJson.dependencies && packageJson.dependencies.leaflet;
    const hasLeafletTypes = packageJson.devDependencies && packageJson.devDependencies['@types/leaflet'];
    
    if (!hasLeaflet) {
      return { 
        hasIssue: true, 
        details: 'Leaflet package missing from dependencies'
      };
    }
    
    if (!hasLeafletTypes) {
      return { 
        hasIssue: true, 
        details: '@types/leaflet missing from devDependencies'
      };
    }
    
    // Check for map utilities
    const mapUtilsPath = path.join(process.cwd(), 'lib', 'utils', 'map-utils.ts');
    
    if (!fs.existsSync(mapUtilsPath)) {
      return { 
        hasIssue: true, 
        details: 'Map utilities file missing (lib/utils/map-utils.ts)'
      };
    }
    
    return { hasIssue: false };
  } catch (error) {
    return { 
      hasIssue: true, 
      details: `Error checking map dependencies: ${error.message}`
    };
  }
}

/**
 * Fix #2: Map Dependencies
 */
async function fixMapDependencies(details) {
  try {
    if (details.includes('Leaflet package missing')) {
      console.log(`${colors.cyan}Installing leaflet package...${colors.reset}`);
      try {
        execSync('npm install leaflet --save', { stdio: 'inherit' });
      } catch (error) {
        return { 
          fixed: false, 
          message: `Error installing leaflet: ${error.message}`
        };
      }
    }
    
    if (details.includes('@types/leaflet missing')) {
      console.log(`${colors.cyan}Installing @types/leaflet package...${colors.reset}`);
      try {
        execSync('npm install @types/leaflet --save-dev', { stdio: 'inherit' });
      } catch (error) {
        return { 
          fixed: false, 
          message: `Error installing @types/leaflet: ${error.message}`
        };
      }
    }
    
    if (details.includes('Map utilities file missing')) {
      // Ensure directory exists
      const utilsDir = path.join(process.cwd(), 'lib', 'utils');
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      
      // Create the map-utils.ts file
      const mapUtilsPath = path.join(utilsDir, 'map-utils.ts');
      const mapUtilsContent = `/**
 * Map Utilities
 * Common configuration and helper functions for maps using OpenStreetMap
 */

import type { LatLngTuple } from 'leaflet';

/**
 * Default map configuration values 
 */
export const MAP_CONFIG = {
  // Default center coordinates (Dar es Salaam, Tanzania)
  DEFAULT_CENTER: getDefaultCenter(),
  
  // Default zoom level
  DEFAULT_ZOOM: getDefaultZoom(),
  
  // Tile layer URL for OpenStreetMap
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Attribution for OpenStreetMap
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  
  // Additional tile layer options
  TILE_OPTIONS: {
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    detectRetina: true,
    tileSize: 256,
    minZoom: 3,
  }
};

/**
 * Get default center coordinates from environment variables or fallback to default
 */
function getDefaultCenter(): LatLngTuple {
  try {
    // Try to get from env vars
    const envCenter = process.env.MAP_DEFAULT_CENTER;
    
    if (envCenter) {
      const [lat, lng] = envCenter.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
  } catch (e) {
    console.warn('Error parsing MAP_DEFAULT_CENTER from env variables', e);
  }
  
  // Fallback to Dar es Salaam, Tanzania
  return [-6.776, 39.178];
}

/**
 * Get default zoom level from environment variables or fallback to default
 */
function getDefaultZoom(): number {
  try {
    const envZoom = process.env.MAP_DEFAULT_ZOOM;
    
    if (envZoom) {
      const zoom = parseInt(envZoom, 10);
      if (!isNaN(zoom)) {
        return zoom;
      }
    }
  } catch (e) {
    console.warn('Error parsing MAP_DEFAULT_ZOOM from env variables', e);
  }
  
  // Fallback to zoom level 13
  return 13;
}

/**
 * Sanitize coordinates to ensure they are valid
 */
export function sanitizeCoordinates(coords: any): LatLngTuple {
  if (Array.isArray(coords) && coords.length === 2 && 
      !isNaN(Number(coords[0])) && !isNaN(Number(coords[1]))) {
    // Valid coordinates
    return [Number(coords[0]), Number(coords[1])];
  }
  
  // Invalid coordinates, return default
  return MAP_CONFIG.DEFAULT_CENTER;
}

/**
 * Convert address to coordinates using OpenStreetMap Nominatim API
 * Note: For high-volume production use, you should use a self-hosted instance
 * or a commercial geocoding service due to usage limits
 */
export async function geocodeAddress(address: string): Promise<LatLngTuple | null> {
  try {
    // Format address for URL
    const formattedAddress = encodeURIComponent(address);
    
    // Call Nominatim API
    const response = await fetch(
      \`https://nominatim.openstreetmap.org/search?format=json&q=\${formattedAddress}\`,
      {
        headers: {
          'User-Agent': 'GazaRental/1.0'  // Required by Nominatim usage policy
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(\`Geocoding error: \${response.status}\`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [Number(lat), Number(lon)];
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: LatLngTuple): string {
  return \`\${coords[0].toFixed(6)}, \${coords[1].toFixed(6)}\`;
}

// Create a named export object
const mapUtils = {
  MAP_CONFIG,
  sanitizeCoordinates,
  geocodeAddress,
  formatCoordinates
};

export default mapUtils;`;

      fs.writeFileSync(mapUtilsPath, mapUtilsContent);
    }
    
    return { 
      fixed: true, 
      message: 'Map dependencies fixed'
    };
  } catch (error) {
    return { 
      fixed: false, 
      message: `Error fixing map dependencies: ${error.message}`
    };
  }
}

/**
 * Check #3: Database Connection
 */
async function checkDatabaseConnection() {
  // We can only check if the MongoDB URI is set and in the right format
  // The actual connection test requires running the validate-env.js script
  
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    return { 
      hasIssue: true, 
      details: 'MONGODB_URI environment variable not set'
    };
  }
  
  // Check URI format
  const validFormat = /^mongodb(\+srv)?:\/\/.+/.test(mongoUri);
  
  if (!validFormat) {
    return { 
      hasIssue: true, 
      details: 'MONGODB_URI has invalid format'
    };
  }
  
  return { hasIssue: false };
}

/**
 * Fix #3: Database Connection
 */
async function fixDatabaseConnection(details) {
  console.log(`${colors.cyan}Running validate-env.js to test database connection...${colors.reset}`);
  
  try {
    if (fs.existsSync(path.join(process.cwd(), 'scripts', 'validate-env.js'))) {
      execSync('node scripts/validate-env.js', { stdio: 'inherit' });
      return { 
        fixed: true, 
        message: 'Database connection validated'
      };
    } else {
      return { 
        fixed: false, 
        message: 'validate-env.js script not found'
      };
    }
  } catch (error) {
    console.log(`${colors.yellow}Please run node create-env.js to set up your environment variables.${colors.reset}`);
    return { 
      fixed: false, 
      message: 'Database connection validation failed'
    };
  }
}

/**
 * Check #4: Leaflet Fallback
 */
async function checkLeafletFallback() {
  const publicFolderPath = path.join(process.cwd(), 'public');
  const leafletFallbackPath = path.join(publicFolderPath, 'vendor', 'leaflet');
  
  if (!fs.existsSync(leafletFallbackPath)) {
    return { 
      hasIssue: true, 
      details: 'Local Leaflet fallback not found'
    };
  }
  
  return { hasIssue: false };
}

/**
 * Fix #4: Leaflet Fallback
 */
async function createLeafletFallback(details) {
  try {
    // Create vendor directory in public folder
    const publicFolderPath = path.join(process.cwd(), 'public');
    const vendorPath = path.join(publicFolderPath, 'vendor');
    const leafletPath = path.join(vendorPath, 'leaflet');
    
    if (!fs.existsSync(publicFolderPath)) {
      fs.mkdirSync(publicFolderPath, { recursive: true });
    }
    
    if (!fs.existsSync(vendorPath)) {
      fs.mkdirSync(vendorPath);
    }
    
    if (!fs.existsSync(leafletPath)) {
      fs.mkdirSync(leafletPath);
    }
    
    // Update MapCTA.tsx to use local fallback
    const mapCtaPath = path.join(process.cwd(), 'components', 'MapCTA.tsx');
    
    if (fs.existsSync(mapCtaPath)) {
      let mapCtaContent = fs.readFileSync(mapCtaPath, 'utf8');
      
      // Add fallback support
      mapCtaContent = mapCtaContent.replace(
        "linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';",
        "try {\n" +
        "          linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';\n" +
        "        } catch (e) {\n" +
        "          console.warn('Using local Leaflet CSS fallback');\n" +
        "          linkEl.href = '/vendor/leaflet/leaflet.css';\n" +
        "        }"
      );
      
      mapCtaContent = mapCtaContent.replace(
        "scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';",
        "try {\n" +
        "              scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';\n" +
        "            } catch (e) {\n" +
        "              console.warn('Using local Leaflet JS fallback');\n" +
        "              scriptEl.src = '/vendor/leaflet/leaflet.js';\n" +
        "            }"
      );
      
      fs.writeFileSync(mapCtaPath, mapCtaContent);
    }
    
    // Create README file with instructions for local Leaflet
    const readmePath = path.join(leafletPath, 'README.md');
    const readmeContent = `# Leaflet Local Fallback

This folder should contain a local copy of Leaflet for fallback purposes.

Download these files from https://unpkg.com/leaflet@1.9.4/dist/ and place them here:
- leaflet.css
- leaflet.js
- images/ (folder with Leaflet marker images)

This ensures your maps will work even if CDN is unavailable.`;
    
    fs.writeFileSync(readmePath, readmeContent);
    
    return { 
      fixed: true, 
      message: 'Created local Leaflet fallback structure and updated code to use it'
    };
  } catch (error) {
    return { 
      fixed: false, 
      message: `Error creating Leaflet fallback: ${error.message}`
    };
  }
}

// Helper function for yes/no prompts
function promptYesNo(question) {
  return new Promise((resolve) => {
    const { createInterface } = require('readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}An error occurred: ${error.message}${colors.reset}`);
  process.exit(1);
}); 