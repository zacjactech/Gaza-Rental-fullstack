/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net'
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos'
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 3600 * 24 * 7, // 7 days cache for images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Add terser for better JS minification
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }

    // Suppress React 19 ref warnings - properly configured
    if (!isServer) {
      // More robust way to filter warnings
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /node_modules\/react\/.+/,
          message: /Accessing element\.ref was removed in React 19/,
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
  // Simplified experimental settings to avoid warnings
  experimental: {
    // Only keep stable features
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Performance optimizations
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 15 * 1000, // Reduce to 15 seconds for faster development
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2, // Reduce to 2 for more efficient memory usage
  },
  productionBrowserSourceMaps: false, // disable source maps in production
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

module.exports = nextConfig; 
