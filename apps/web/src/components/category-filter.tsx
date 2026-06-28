'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSeason } from '@mutluet/ui'

const CATEGORIES = [
  { key: '', label: 'Tümü', emoji: '🌍' },
  { key: 'doga', label: 'Doğa', emoji: '🌿' },
  { key: 'kamp', label: 'Kamp', emoji: '🏕️' },
  { key: 'hasta_ziyareti', label: 'Hasta Ziyareti', emoji: '🏥' },
  { key: 'tanisma', label: 'Tanışma', emoji: '🤝' },
  { key: 'oyun', label: 'Oyun', emoji: '🎮' },
  { key: 'sanat', label: 'Sanat', emoji: '🎨' },
  { key: 'cevre', label: 'Çevre', emoji: '🌱' },
  { key: 'egitim', label: 'Eğitim', emoji: '📚' },
  { key: 'spor', label: 'Spor', emoji: '⚽' },
  { key: 'kultur', label: 'Kültür', emoji: '🎭' },
]

export function CategoryFilter({ active }: { active?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { config } = useSeason()

  function select(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key) params.set('kategori', key)
    else params.delete('kategori')
    router.push(`/?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
      {CATEGORIES.map(({ key, label, emoji }) => {
        const isActive = (active ?? '') === key
        return (
          <button
            key={key}
            onClick={() => select(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 14px',
              borderRadius: 99,
              border: isActive ? `2px solid ${config.primary}` : '1px solid var(--border)',
              background: isActive ? config.primary : 'white',
              color: isActive ? 'white' : 'var(--foreground)',
              fontWeight: isActive ? 700 : 500,
              fontSize: 13,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {emoji} {label}
          </button>
        )
      })}
    </div>
  )
}
