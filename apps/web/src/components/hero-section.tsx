'use client'

import Link from 'next/link'
import { SeasonBackground } from '@mutluet/ui'
import type { Season } from '@mutluet/db'
import type { SeasonConfig } from '@mutluet/lib'

const HERO_TEXT: Record<Season, { heading: string; sub: string }> = {
  ilkbahar: { heading: 'Doğayla Buluşma Zamanı', sub: 'Yeni sezon, yeni başlangıçlar. Etrafında gönüllüler seni bekliyor.' },
  yaz:      { heading: 'Sıcak Bir Yaz, Sıcak Yüzler', sub: 'Kamp ateşini paylaş, ekibini kur, anılarını çoğalt.' },
  sonbahar: { heading: 'Bilgi Mevsimi Başlıyor', sub: 'Atölyeler, eğitimler ve kültür etkinlikleriyle kendini geliştir.' },
  kis:      { heading: 'Dayanışma Hiç Geçmesin', sub: 'Hasta ziyaretleri, sıcak buluşmalar. Kışı birlikte ısıtalım.' },
}

export function HeroSection({ season, config }: { season: Season; config: SeasonConfig }) {
  const { heading, sub } = HERO_TEXT[season]

  return (
    <section style={{
      background: config.gradient,
      borderRadius: 16,
      padding: '48px 40px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 200,
    }}>
      <SeasonBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 10 }}>
          {config.emoji} {config.label} Sezonu
        </p>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 12, textWrap: 'balance' }}>
          {heading}
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 480, marginBottom: 28, lineHeight: 1.6 }}>
          {sub}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/etkinlikler" style={{
            background: 'white',
            color: config.primary,
            padding: '10px 22px',
            borderRadius: 8,
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 14,
          }}>
            Etkinlikleri Keşfet
          </Link>
          <Link href="/lider-bul" style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '10px 22px',
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: 14,
            border: '1px solid rgba(255,255,255,0.4)',
          }}>
            Lider Bul
          </Link>
        </div>
      </div>
    </section>
  )
}
