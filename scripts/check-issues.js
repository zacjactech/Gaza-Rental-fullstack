/**
 * Project Issue Checker
 * 
 * This script scans the project for common issues:
 * - Missing environment variables
 * - Hardcoded credentials
 * - Security vulnerabilities in configuration
 * 
 * Run with: node scripts/check-issues.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { exec } = require('child_process');

// Define issue severity levels
const SEVERITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

// Issues found during scanning
const issues = [];

// Check environment setup
function checkEnvironment() {
  console.log(`${colors.bright}Checking environment configuration...${colors.reset}`);
  
  // Check for .env or .env.local file
  const envFiles = ['.env.local', '.env'];
  let envFileExists = false;
  
  for (const file of envFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`${colors.green}✓ Found ${file}${colors.reset}`);
      envFileExists = true;
      
      // Load for checking required vars
      dotenv.config({ path: path.join(process.cwd(), file) });
      break;
    }
  }
  
  if (!envFileExists) {
    issues.push({
      severity: SEVERITY.HIGH,
      description: 'No .env or .env.local file found',
      solution: 'Run node create-env.js to create environment file'
    });
  }
  
  // Check for required environment variables
  const requiredVars = [
    { name: 'MONGODB_URI', severity: SEVERITY.HIGH },
    { name: 'JWT_SECRET', severity: SEVERITY.HIGH },
    { name: 'JWT_EXPIRES_IN', severity: SEVERITY.MEDIUM },
  ];
  
  for (const { name, severity } of requiredVars) {
    if (!process.env[name]) {
      issues.push({
        severity,
        description: `Missing required environment variable: ${name}`,
        solution: `Add ${name} to your .env.local file`
      });
    } else {
      console.log(`${colors.green}✓ ${name} is defined${colors.reset}`);
    }
  }
}

// Scan for hardcoded credentials in files
function scanForCredentials() {
  console.log(`\n${colors.bright}Scanning for hardcoded credentials...${colors.reset}`);
  
  // Define patterns to look for
  const patterns = [
    { 
      regex: /(mongodb(\+srv)?:\/\/[^"'\s]+:[^"'\s]+@)/g, 
      description: 'MongoDB connection string with credentials',
      severity: SEVERITY.HIGH
    },
    { 
      regex: /(SECRET|JWT_SECRET|API_KEY)(\s*=\s*["'])[^"']*["']/g, 
      description: 'Hardcoded secret or API key',
      severity: SEVERITY.HIGH
    },
    { 
      regex: /(const [A-Z_]+ = process\.env\.[A-Z_]+ \|\| ["'].*?["'])/g,
      description: 'Environment variable with hardcoded fallback',
      severity: SEVERITY.MEDIUM
    }
  ];
  
  // Define directories to scan
  const dirsToScan = ['app', 'components', 'lib', 'scripts'];
  const filesToScan = [];
  
  // Get all files recursively
  for (const dir of dirsToScan) {
    if (fs.existsSync(path.join(process.cwd(), dir))) {
      collectFilesToScan(path.join(process.cwd(), dir), filesToScan);
    }
  }
  
  // Scan collected files
  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf-8');
    
    for (const { regex, description, severity } of patterns) {
      const matches = content.match(regex);
      
      if (matches) {
        issues.push({
          severity,
          description: `${description} found in ${path.relative(process.cwd(), file)}`,
          solution: 'Replace with environment variable'
        });
      }
    }
  }
  
  if (issues.filter(i => i.description.includes('credential')).length === 0) {
    console.log(`${colors.green}✓ No hardcoded credentials found${colors.reset}`);
  }
}

// Check Next.js configuration
function checkNextConfig() {
  console.log(`\n${colors.bright}Checking Next.js configuration...${colors.reset}`);
  
  const configPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(configPath)) {
    issues.push({
      severity: SEVERITY.HIGH,
      description: 'next.config.js not found',
      solution: 'Create a Next.js configuration file'
    });
    return;
  }
  
  const content = fs.readFileSync(configPath, 'utf-8');
  
  // Look for issues
  if (content.includes('ignoreDuringBuilds: true')) {
    issues.push({
      severity: SEVERITY.MEDIUM,
      description: 'ESLint errors are ignored during builds',
      solution: 'Set eslint.ignoreDuringBuilds to false in next.config.js'
    });
  } else {
    console.log(`${colors.green}✓ ESLint errors are checked during builds${colors.reset}`);
  }
  
  if (content.includes('ignoreBuildErrors: true')) {
    issues.push({
      severity: SEVERITY.MEDIUM,
      description: 'TypeScript errors are ignored during builds',
      solution: 'Set typescript.ignoreBuildErrors to false in next.config.js'
    });
  } else {
    console.log(`${colors.green}✓ TypeScript errors are checked during builds${colors.reset}`);
  }
  
  if (content.includes('dangerouslyAllowSVG: true')) {
    console.log(`${colors.yellow}⚠ SVG content is dangerously allowed${colors.reset}`);
    issues.push({
      severity: SEVERITY.LOW,
      description: 'SVG contents are dangerously allowed which can be a security risk',
      solution: 'Consider setting dangerouslyAllowSVG to false if SVGs are not needed'
    });
  }
}

// Check database models for issues
function checkModels() {
  console.log(`\n${colors.bright}Checking database models...${colors.reset}`);
  
  const userModelPath = path.join(process.cwd(), 'lib', 'models', 'user.ts');
  
  if (fs.existsSync(userModelPath)) {
    const content = fs.readFileSync(userModelPath, 'utf-8');
    
    if (content.includes('console.log') && content.includes('password')) {
      issues.push({
        severity: SEVERITY.HIGH,
        description: 'Password comparison logs may expose sensitive information',
        solution: 'Remove logging from password comparison methods'
      });
    } else {
      console.log(`${colors.green}✓ User model password handling looks secure${colors.reset}`);
    }
  }
}

// Check for npm security issues
function checkNpmSecurity() {
  console.log(`\n${colors.bright}Checking for npm package vulnerabilities...${colors.reset}`);
  console.log('Running npm audit...');
  
  exec('npm audit --json', (error, stdout) => {
    try {
      const auditResult = JSON.parse(stdout);
      
      if (auditResult.metadata && auditResult.metadata.vulnerabilities) {
        const { critical, high, moderate, low } = auditResult.metadata.vulnerabilities;
        
        if (critical > 0) {
          issues.push({
            severity: SEVERITY.HIGH,
            description: `${critical} critical npm package vulnerabilities found`,
            solution: 'Run npm audit fix or update affected packages'
          });
        }
        
        if (high > 0) {
          issues.push({
            severity: SEVERITY.MEDIUM,
            description: `${high} high npm package vulnerabilities found`,
            solution: 'Run npm audit fix or update affected packages'
          });
        }
        
        if (critical === 0 && high === 0) {
          if (moderate > 0 || low > 0) {
            console.log(`${colors.yellow}⚠ Found ${moderate} moderate and ${low} low vulnerabilities${colors.reset}`);
          } else {
            console.log(`${colors.green}✓ No npm package vulnerabilities found${colors.reset}`);
          }
        }
      }
      
      // Display results after all checks
      displayResults();
    } catch (e) {
      console.error('Error parsing npm audit result:', e);
      displayResults();
    }
  });
}

// Helper functions
function collectFilesToScan(dirPath, files) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    // Skip node_modules and .git
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    
    if (entry.isDirectory()) {
      collectFilesToScan(fullPath, files);
    } else if (
      entry.isFile() && 
      (fullPath.endsWith('.js') || 
       fullPath.endsWith('.ts') || 
       fullPath.endsWith('.tsx') || 
       fullPath.endsWith('.jsx'))
    ) {
      files.push(fullPath);
    }
  }
}

function displayResults() {
  console.log(`\n${colors.bright}=== Issue Scan Results ===${colors.reset}\n`);
  
  // Group issues by severity
  const highIssues = issues.filter(i => i.severity === SEVERITY.HIGH);
  const mediumIssues = issues.filter(i => i.severity === SEVERITY.MEDIUM);
  const lowIssues = issues.filter(i => i.severity === SEVERITY.LOW);
  const infoIssues = issues.filter(i => i.severity === SEVERITY.INFO);
  
  if (issues.length === 0) {
    console.log(`${colors.green}${colors.bright}No issues found! Your project looks good.${colors.reset}`);
    return;
  }
  
  // Display high severity issues
  if (highIssues.length > 0) {
    console.log(`${colors.red}${colors.bright}HIGH SEVERITY ISSUES (${highIssues.length})${colors.reset}`);
    highIssues.forEach((issue, index) => {
      console.log(`${colors.red}${index + 1}. ${issue.description}${colors.reset}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
  }
  
  // Display medium severity issues
  if (mediumIssues.length > 0) {
    console.log(`${colors.yellow}${colors.bright}MEDIUM SEVERITY ISSUES (${mediumIssues.length})${colors.reset}`);
    mediumIssues.forEach((issue, index) => {
      console.log(`${colors.yellow}${index + 1}. ${issue.description}${colors.reset}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
  }
  
  // Display low severity issues
  if (lowIssues.length > 0) {
    console.log(`${colors.blue}${colors.bright}LOW SEVERITY ISSUES (${lowIssues.length})${colors.reset}`);
    lowIssues.forEach((issue, index) => {
      console.log(`${colors.blue}${index + 1}. ${issue.description}${colors.reset}`);
      console.log(`   Solution: ${issue.solution}\n`);
    });
  }
  
  // Display info issues
  if (infoIssues.length > 0) {
    console.log(`${colors.cyan}${colors.bright}INFORMATIONAL (${infoIssues.length})${colors.reset}`);
    infoIssues.forEach((issue, index) => {
      console.log(`${colors.cyan}${index + 1}. ${issue.description}${colors.reset}`);
      console.log(`   Suggestion: ${issue.solution}\n`);
    });
  }
  
  // Summary
  console.log(`${colors.bright}Total issues: ${issues.length} (${highIssues.length} high, ${mediumIssues.length} medium, ${lowIssues.length} low, ${infoIssues.length} info)${colors.reset}`);
}

// Run checks
checkEnvironment();
scanForCredentials();
checkNextConfig();
checkModels();
checkNpmSecurity();

// If npm audit is slow, ensure we display the other results
setTimeout(() => {
  // Only display if not already displayed by npm audit
  if (issues.length > 0 && issues.every(i => i.severity !== 'NPM_AUDIT_DONE')) {
    issues.push({ severity: 'NPM_AUDIT_DONE', description: '', solution: '' });
    displayResults();
  }
}, 5000); 