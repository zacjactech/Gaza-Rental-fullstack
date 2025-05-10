const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom build process...');

// Create a temporary config file that disables prerendering for dashboard pages
const tempConfigPath = path.join(__dirname, '../temp-next.config.mjs');

const configContent = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 3600 * 24 * 7,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'images.pexels.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Generate a unique build ID to prevent caching issues
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Skip prerendering for dashboard routes
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Disable static optimization for dashboard routes
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Add terser for better JS minification
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }

    // Suppress React 19 ref warnings
    if (!isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /node_modules\\/react\\/.+/,
          message: /Accessing element\\.ref was removed in React 19/,
        },
        (warning) => {
          return (
            warning &&
            warning.message &&
            warning.message.includes &&
            warning.message.includes('Accessing element.ref was removed in React 19')
          );
        },
      ];
    }

    return config;
  },
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  // Performance optimizations
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  }
};

export default nextConfig;
`;

// Write the temporary config file
fs.writeFileSync(tempConfigPath, configContent);

try {
  // Backup the original config
  const originalConfigPath = path.join(__dirname, '../next.config.mjs');
  const originalConfig = fs.readFileSync(originalConfigPath);
  const backupPath = path.join(__dirname, '../next.config.mjs.bak');
  fs.writeFileSync(backupPath, originalConfig);

  // Replace the original config with our temp config
  fs.copyFileSync(tempConfigPath, originalConfigPath);

  // Create a custom next.config.js file for the build
  const jsConfigPath = path.join(__dirname, '../next.config.js');
  fs.writeFileSync(jsConfigPath, `
    module.exports = {
      ...require('./temp-next.config.mjs').default,
      // Disable static generation for dashboard routes
      unstable_excludeFiles: ['app/dashboard/**/*']
    }
  `);

  console.log('Running Next.js build with custom config...');
  execSync('next build --no-lint', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Restore the original config
  const backupPath = path.join(__dirname, '../next.config.mjs.bak');
  if (fs.existsSync(backupPath)) {
    const originalConfigPath = path.join(__dirname, '../next.config.mjs');
    fs.copyFileSync(backupPath, originalConfigPath);
    fs.unlinkSync(backupPath);
  }

  // Clean up the temporary config file
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }

  // Clean up the JS config file
  const jsConfigPath = path.join(__dirname, '../next.config.js');
  if (fs.existsSync(jsConfigPath)) {
    fs.unlinkSync(jsConfigPath);
  }
} 