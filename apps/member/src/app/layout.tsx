import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MutluET Üye Portalı',
  description: 'Bir Tebessüm Bin Mutluluk Derneği — Üyelik Portalı',
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <nav style={{ background: '#3A1A1A', color: 'white', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: 'white', textDecoration: 'none' }}>🏅 Üye Portalı</Link>
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            {[['/', 'Ana Sayfa'], ['/kimlik-kartim', 'Kimlik Kartım'], ['/etkinliklerim', 'Etkinliklerim'], ['/forum', 'Forum']].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </nav>
        <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>{children}</main>
      </body>
    </html>
  )
}
