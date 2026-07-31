/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'via.placeholder.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
  // Remove experimental.appDir - it's now default in Next.js 14
  // The App Router is stable and doesn't need this flag anymore
}

module.exports = nextConfig