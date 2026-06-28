import { createClient } from '@/lib/supabase-server'
import { detectSeason, SEASON_CONFIG } from '@mutluet/lib'
import { EventCard } from '@/components/event-card'
import { HeroSection } from '@/components/hero-section'
import { CategoryFilter } from '@/components/category-filter'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; sehir?: string }>
}) {
  const { kategori, sehir } = await searchParams
  const supabase = await createClient()
  const season = detectSeason()
  const seasonCfg = SEASON_CONFIG[season]

  let query = supabase
    .from('events')
    .select('*, users!leader_id(full_name, avatar_url, level)')
    .eq('status', 'yayinda')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(12)

  if (kategori) query = query.eq('category', kategori)
  if (sehir) query = query.eq('city', sehir)

  const { data: events } = await query

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <HeroSection season={season} config={seasonCfg} />

      <section style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--season-primary)' }}>
            Yaklaşan Etkinlikler
          </h2>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{events?.length ?? 0} etkinlik</span>
        </div>

        <CategoryFilter active={kategori} />

        {events && events.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
            marginTop: 20,
          }}>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>{seasonCfg.emoji}</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Seçilen kategoride etkinlik bulunamadı.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Başka bir kategori veya şehir deneyin.</p>
          </div>
        )}
      </section>
    </div>
  )
}
