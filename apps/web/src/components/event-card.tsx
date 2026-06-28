import Link from 'next/link'
import { Calendar, MapPin, Users, Zap } from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = {
  doga: '🌿', kamp: '🏕️', hasta_ziyareti: '🏥', tanisma: '🤝',
  oyun: '🎮', sanat: '🎨', cevre: '🌱', egitim: '📚',
  yemek: '🍽️', spor: '⚽', kultur: '🎭', hackathon: '💡',
}

type EventRow = {
  id: string
  title: string
  description: string
  category: string
  event_date: string
  location_name: string | null
  city: string | null
  max_capacity: number
  current_participants: number
  xp_reward: number
  image_url: string | null
  users?: { full_name: string | null; avatar_url: string | null; level: number } | null
}

export function EventCard({ event }: { event: EventRow }) {
  const date = new Date(event.event_date)
  const filled = Math.round((event.current_participants / event.max_capacity) * 100)
  const isFull = event.current_participants >= event.max_capacity

  return (
    <Link href={`/etkinlikler/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <article style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
      >
        {/* Image / placeholder */}
        <div style={{
          height: 130,
          background: event.image_url ? `url(${event.image_url}) center/cover` : 'var(--season-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          position: 'relative',
        }}>
          {!event.image_url && CATEGORY_EMOJI[event.category]}
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.55)',
            color: 'white', borderRadius: 99, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)',
          }}>
            +{event.xp_reward} XP
          </span>
          {isFull && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              background: '#DC2626', color: 'white',
              borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
            }}>DOLU</span>
          )}
        </div>

        <div style={{ padding: '14px 16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{event.title}</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={12} />
              {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {(event.location_name || event.city) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={12} />
                {event.location_name ?? event.city}
              </span>
            )}
          </div>

          {/* Capacity bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Users size={10} /> {event.current_participants}/{event.max_capacity}
              </span>
              <span>{filled}%</span>
            </div>
            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 99 }}>
              <div style={{
                height: '100%',
                width: `${filled}%`,
                background: isFull ? '#DC2626' : 'var(--season-primary)',
                borderRadius: 99,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
