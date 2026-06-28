import { createClient } from '@/lib/supabase-server'
import { getLevelInfo } from '@mutluet/lib'

const CATEGORY_LABELS: Record<string, string> = {
  doga: 'Doğa 🌿', kamp: 'Kamp 🏕️', hasta_ziyareti: 'Hasta Ziyareti 🏥',
  tanisma: 'Tanışma 🤝', oyun: 'Oyun 🎮', sanat: 'Sanat 🎨',
  cevre: 'Çevre 🌱', egitim: 'Eğitim 📚', yemek: 'Yemek 🍽️', spor: 'Spor ⚽',
}

export default async function LeaderFinderPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>
}) {
  const { kategori } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('id, full_name, avatar_url, level, xp, city, bio, user_interests(category)')
    .eq('is_leader_willing', true)
    .order('xp', { ascending: false })
    .limit(20)

  const { data: leaders } = await query

  const filtered = kategori
    ? leaders?.filter(l =>
        (l.user_interests as { category: string }[])?.some(i => i.category === kategori)
      )
    : leaders

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--season-primary)', marginBottom: 8 }}>🧭 Lider Bul</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Etkinlik için deneyimli bir lider mi arıyorsun? İlgini çeken alana göre filtrele, doğrudan etkinlik talep et.
        </p>
      </div>

      {/* Kategori filtresi */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <a key={key} href={`/lider-bul?kategori=${key}`} style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12, textDecoration: 'none',
            background: kategori === key ? 'var(--season-primary)' : 'white',
            color: kategori === key ? 'white' : 'var(--foreground)',
            border: '1px solid var(--border)',
            fontWeight: kategori === key ? 700 : 500,
          }}>
            {label}
          </a>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered?.map(leader => {
          const levelInfo = getLevelInfo(leader.xp)
          const interests = (leader.user_interests as { category: string }[])?.map(i => CATEGORY_LABELS[i.category] ?? i.category) ?? []
          return (
            <div key={leader.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--season-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
                  {leader.avatar_url
                    ? <img src={leader.avatar_url} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                    : levelInfo.emoji}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{leader.full_name ?? 'Anonim'}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{levelInfo.emoji} {levelInfo.name} · Seviye {leader.level}</p>
                  {leader.city && <p style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {leader.city}</p>}
                </div>
              </div>

              {leader.bio && <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{leader.bio}</p>}

              {interests.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {interests.slice(0, 4).map(i => (
                    <span key={i} style={{ fontSize: 10, background: 'var(--season-bg)', color: 'var(--season-primary)', padding: '2px 8px', borderRadius: 99, fontWeight: 600, border: '1px solid var(--border)' }}>{i}</span>
                  ))}
                </div>
              )}

              <button style={{
                width: '100%', padding: '9px', background: 'var(--season-primary)', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                Etkinlik Talep Et
              </button>
            </div>
          )
        })}
      </div>

      {(!filtered || filtered.length === 0) && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <p style={{ fontWeight: 600 }}>Bu kategoride aktif lider bulunamadı.</p>
        </div>
      )}
    </div>
  )
}
