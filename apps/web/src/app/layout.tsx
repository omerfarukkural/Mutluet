import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SeasonProvider } from '@mutluet/ui'
import { detectSeason } from '@mutluet/lib'
import { createClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'MutluET — Bir Tebessüm Bin Mutluluk',
  description: 'Gönüllü etkinlikler, topluluk eşleştirme ve sosyal etki platformu',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'MutluET', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#2E7D5C',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const season = detectSeason()

  return (
    <html lang="tr" data-season={season} suppressHydrationWarning>
      <body>
        <SeasonProvider initialSeason={season}>
          <Navbar user={user} />
          <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
            {children}
          </main>
        </SeasonProvider>
      </body>
    </html>
  )
}
