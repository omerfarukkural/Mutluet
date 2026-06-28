'use client'

import Link from 'next/link'
import { useSeason } from '@mutluet/ui'
import type { User } from '@supabase/supabase-js'
import { Bell, Home, Calendar, Trophy, Briefcase, User as UserIcon, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Keşfet', icon: Home },
  { href: '/etkinlikler', label: 'Etkinlikler', icon: Calendar },
  { href: '/yarisma', label: 'Yarışma', icon: Trophy },
  { href: '/is', label: 'İş Bul', icon: Briefcase },
]

export function Navbar({ user }: { user: User | null }) {
  const { season, config } = useSeason()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav style={{
      background: config.primary,
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 20, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          {config.emoji} MutluET
        </Link>

        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <Link href="/bildirimler" style={{ color: 'white', display: 'flex', padding: 8 }}>
                <Bell size={18} />
              </Link>
              <Link href="/profil" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', textDecoration: 'none', fontSize: 13 }}>
                <UserIcon size={15} /> Profil
              </Link>
              <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', padding: 8 }}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: 14, padding: '6px 12px' }}>Giriş</Link>
              <Link href="/kayit" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '6px 14px', borderRadius: 8 }}>Üye Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
