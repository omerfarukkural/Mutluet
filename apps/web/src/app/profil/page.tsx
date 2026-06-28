import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getLevelInfo, getXpProgress } from '@mutluet/lib'

const CATEGORY_LABELS: Record<string, string> = {
  doga: 'Doğa 🌿', kamp: 'Kamp 🏕️', hasta_ziyareti: 'Hasta Ziyareti 🏥',
  tanisma: 'Tanışma 🤝', oyun: 'Oyun 🎮', sanat: 'Sanat 🎨',
  cevre: 'Çevre 🌱', egitim: 'Eğitim 📚', yemek: 'Yemek 🍽️', spor: 'Spor ⚽',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const [{ data: profile }, { data: interests }, { data: registrations }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('user_interests').select('category, skill_level').eq('user_id', user.id),
    supabase.from('event_registrations').select('status, events(title, event_date, xp_reward)').eq('user_id', user.id).limit(5),
  ])

  const xp = profile?.xp ?? 0
  const levelInfo = getLevelInfo(xp)
  const progress = getXpProgress(xp)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--season-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 800 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
              : levelInfo.emoji}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{profile?.full_name ?? user.email}</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{profile?.city ?? 'Şehir belirtilmemiş'}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--season-primary)', marginTop: 2 }}>
              {levelInfo.emoji} {levelInfo.name} · Seviye {levelInfo.level}
            </p>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
            <span>{xp.toLocaleString('tr')} XP</span>
            <span>{levelInfo.maxXp === Infinity ? 'Maks. Seviye' : `${levelInfo.maxXp.toLocaleString('tr')} XP'e ${(levelInfo.maxXp - xp).toLocaleString('tr')} kaldı`}</span>
          </div>
          <div style={{ height: 10, background: '#E5E7EB', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--season-primary)', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, textAlign: 'center' }}>
          {[
            { label: 'Gün Serisi', value: `🔥 ${profile?.streak_days ?? 0}` },
            { label: 'Etkinlik', value: registrations?.filter(r => r.status === 'tamamlandi').length ?? 0 },
            { label: 'Lider mi?', value: profile?.is_leader_willing ? '✅ Evet' : 'Hayır' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 8px' }}>
              <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* İlgi alanları */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--season-primary)', marginBottom: 14 }}>İlgi Alanlarım</h2>
        {interests && interests.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {interests.map(i => (
              <span key={i.category} className="badge-season">{CATEGORY_LABELS[i.category] ?? i.category}</span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Henüz ilgi alanı seçmedin. <a href="/profil/duzenle" style={{ color: 'var(--season-primary)' }}>Ekle</a></p>
        )}
      </div>

      {/* Son etkinlikler */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--season-primary)', marginBottom: 14 }}>Son Etkinliklerim</h2>
        {registrations && registrations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {registrations.map((r, i) => {
              const ev = r.events as { title: string; event_date: string; xp_reward: number } | null
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{ev?.title ?? '—'}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{ev?.event_date ? new Date(ev.event_date).toLocaleDateString('tr-TR') : ''}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.status === 'tamamlandi' ? '#16A34A' : 'var(--muted)' }}>
                    {r.status === 'tamamlandi' ? `+${ev?.xp_reward ?? 0} XP` : r.status}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Henüz etkinliğe katılmadın.</p>
        )}
      </div>
    </div>
  )
}
