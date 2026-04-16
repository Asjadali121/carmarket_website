/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',    port: '8000', pathname: '/media/**' },
      { protocol: 'https', hostname: '*.railway.app', pathname: '/media/**' },
      { protocol: 'https', hostname: '*.up.railway.app', pathname: '/media/**' },
      { protocol: 'https', hostname: 'placehold.co',  pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { serverComponentsExternalPackages: [] },
}

module.exports = nextConfig
