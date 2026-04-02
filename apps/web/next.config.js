/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@a-team/ui', '@a-team/utils', '@a-team/types', '@a-team/api', '@a-team/db'],
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  },
}

module.exports = nextConfig
