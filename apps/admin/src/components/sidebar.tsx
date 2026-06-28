'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Users, Trophy, Briefcase, Bell, Settings, BarChart3 } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/events', label: 'Etkinlikler', icon: CalendarDays },
  { href: '/users', label: 'Kullanıcılar', icon: Users },
  { href: '/memberships', label: 'Üyelikler', icon: Trophy },
  { href: '/jobs', label: 'İş İlanları', icon: Briefcase },
  { href: '/notifications', label: 'Bildirimler', icon: Bell },
  { href: '/analytics', label: 'Analitik', icon: BarChart3 },
  { href: '/settings', label: 'Ayarlar', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{ width: 220, background: 'var(--sidebar)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontWeight: 900, fontSize: 18, color: 'white' }}>🌿 MutluET</p>
        <p style={{ fontSize: 11, color: 'var(--sidebar-text)', marginTop: 2 }}>Admin Paneli</p>
      </div>
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              background: active ? 'var(--sidebar-active)' : 'transparent',
              color: active ? 'white' : 'var(--sidebar-text)',
              textDecoration: 'none', fontSize: 13, fontWeight: active ? 700 : 500,
              transition: 'background 0.15s',
            }}>
              <Icon size={16} /> {label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
        Bir Tebessüm Bin Mutluluk Derneği
      </div>
    </aside>
  )
}
