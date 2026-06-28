import { createClient } from '@/lib/supabase-server'
import { Users, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeEvents },
    { count: pendingEvents },
    { count: pendingMembers },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'yayinda'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'onay_bekliyor'),
    supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'bekliyor'),
  ])

  const { data: recentEvents } = await supabase
    .from('events')
    .select('id, title, status, event_date, category, current_participants, max_capacity')
    .order('created_at', { ascending: false })
    .limit(8)

  const STATS = [
    { label: 'Toplam Kullanıcı', value: totalUsers ?? 0, icon: Users, color: '#1C3D30' },
    { label: 'Aktif Etkinlik', value: activeEvents ?? 0, icon: CalendarDays, color: '#2E7D5C' },
    { label: 'Onay Bekleyen', value: pendingEvents ?? 0, icon: AlertCircle, color: '#D4820A', alert: true },
    { label: 'Üyelik Talebi', value: pendingMembers ?? 0, icon: TrendingUp, color: '#8B3A1A', alert: true },
  ]

  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    taslak: { label: 'Taslak', cls: 'badge badge-gray' },
    onay_bekliyor: { label: 'Onay Bekl.', cls: 'badge badge-yellow' },
    yayinda: { label: 'Yayında', cls: 'badge badge-green' },
    tamamlandi: { label: 'Tamamlandı', cls: 'badge badge-green' },
    iptal: { label: 'İptal', cls: 'badge badge-red' },
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STATS.map(({ label, value, icon: Icon, color, alert }) => (
          <div key={label} className="card" style={{ borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: alert && value > 0 ? color : 'var(--foreground)' }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Son Etkinlikler</h2>
          <a href="/events" style={{ fontSize: 13, color: '#2E7D5C', textDecoration: 'none', fontWeight: 600 }}>Tümünü Gör →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Etkinlik', 'Tarih', 'Durum', 'Katılım'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEvents?.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ev.title}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                    {new Date(ev.event_date).toLocaleDateString('tr-TR')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={(STATUS_BADGE[ev.status] ?? STATUS_BADGE.taslak).cls}>
                      {(STATUS_BADGE[ev.status] ?? STATUS_BADGE.taslak).label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>
                    {ev.current_participants}/{ev.max_capacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
