/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig