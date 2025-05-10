/**
 * Helper to determine if database connections should be skipped
 * Used primarily during build time to prevent connection errors
 */

export function shouldSkipDbConnection(): boolean {
  // Check for environment variable
  if (process.env.NEXT_PUBLIC_SKIP_DB_CONNECTION === 'true') {
    return true;
  }
  
  // Check if we're in a build environment
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return true;
  }
  
  return false;
}

export function logSkippedConnection() {
  console.log('Skipping database connection during build phase');
} 