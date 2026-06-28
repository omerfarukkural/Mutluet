import type { Metadata } from 'next'
import './globals.css'
import { AdminSidebar } from '@/components/sidebar'

export const metadata: Metadata = {
  title: 'MutluET Admin',
  description: 'Yönetim Paneli',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>MutluET Yönetim Paneli</div>
            <div style={{ fontSize: 12, background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
              🔒 Admin
            </div>
          </header>
          <main style={{ flex: 1, padding: 28 }}>{children}</main>
        </div>
      </body>
    </html>
  )
}
