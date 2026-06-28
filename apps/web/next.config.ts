import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mutluet/ui', '@mutluet/db', '@mutluet/lib'],
  typescript: {
    // Type errors are caught by the dedicated tsc --noEmit step in CI.
    // Keeping build fast and separate from type checking is standard practice.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
