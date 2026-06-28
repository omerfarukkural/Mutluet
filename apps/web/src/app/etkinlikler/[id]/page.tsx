import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Users, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { JoinButton } from './join-button'

const CATEGORY_EMOJI: Record<string, string> = {
  doga: '🌿', kamp: '🏕️', hasta_ziyareti: '🏥', tanisma: '🤝',
  oyun: '🎮', sanat: '🎨', cevre: '🌱', egitim: '📚',
  yemek: '🍽️', spor: '⚽', kultur: '🎭', hackathon: '💡',
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: event }, { data: { user } }] = await Promise.all([
    supabase.from('events').select('*, users!leader_id(id, full_name, avatar_url, level, xp)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!event) notFound()

  const { data: myReg } = user
    ? await supabase.from('event_registrations').select('status').eq('event_id', id).eq('user_id', user.id).single()
    : { data: null }

  const date = new Date(event.event_date)
  const filled = Math.round((event.current_participants / event.max_capacity) * 100)
  const leader = event.users as { id: string; full_name: string | null; avatar_url: string | null; level: number; xp: number } | null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 13, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Geri
      </Link>

      {/* Header */}
      <div style={{
        background: 'var(--season-gradient)',
        borderRadius: 16,
        padding: '36px 32px',
        color: 'white',
        marginBottom: 24,
        fontSize: 48,
        textAlign: 'center',
      }}>
        {event.image_url
          ? <img src={event.image_url} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }} />
          : CATEGORY_EMOJI[event.category]}
        <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 16, marginBottom: 0 }}>{event.title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        {/* Main */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--season-primary)' }}>Etkinlik Hakkında</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 14 }}>{event.description}</p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--season-primary)' }}>Detaylar</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={16} color="var(--muted)" />
                {date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' '}{date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {(event.location_name || event.city) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={16} color="var(--muted)" />
                  {event.location_name}{event.city && ` — ${event.city}`}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={16} color="var(--muted)" />
                {event.current_participants}/{event.max_capacity} katılımcı
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={16} color="var(--muted)" />
                Kazanç: <strong>+{event.xp_reward} XP</strong>
              </span>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ height: 6, background: '#E5E7EB', borderRadius: 99 }}>
                <div style={{ height: '100%', width: `${filled}%`, background: 'var(--season-primary)', borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{filled}% dolu</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <JoinButton eventId={id} userId={user?.id} currentStatus={myReg?.status ?? null} isFull={event.current_participants >= event.max_capacity} />

          {leader && (
            <div className="card">
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 12 }}>Etkinlik Lideri</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--season-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                  {leader.avatar_url
                    ? <img src={leader.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    : (leader.full_name?.[0] ?? '?')}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{leader.full_name ?? 'Anonim'}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>Seviye {leader.level}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
