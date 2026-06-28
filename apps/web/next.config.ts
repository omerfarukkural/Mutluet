import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@mutluet/ui', '@mutluet/db', '@mutluet/lib'],
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
      { hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
