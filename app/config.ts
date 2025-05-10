// This file contains global configuration for the Next.js app

// Mark all pages as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

// Export other configuration options
export const config = {
  // Disable static optimization for all pages
  runtime: 'edge',
  regions: ['fra1'],
  // Add any other configuration options here
}; 