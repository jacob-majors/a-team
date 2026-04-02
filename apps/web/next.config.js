const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@a-team/ui',
    '@a-team/utils',
    '@a-team/types',
    '@a-team/db',
    '@a-team/api',
  ],
  webpack: (config) => {
    // Resolve workspace package deps from the monorepo root node_modules
    config.resolve.modules = [
      ...config.resolve.modules ?? ['node_modules'],
      path.resolve(__dirname, '../../node_modules'),
    ]
    return config
  },
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  },
}

module.exports = nextConfig
