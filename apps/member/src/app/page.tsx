import Link from 'next/link'

export default function MemberHome() {
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 32, background: 'linear-gradient(135deg, #3A1A1A 0%, #8B3A1A 100%)', borderRadius: 16, color: 'white' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🏅</p>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Üye Portalına Hoş Geldin</h1>
        <p style={{ opacity: 0.85, fontSize: 15 }}>Bir Tebessüm Bin Mutluluk Derneği üyelerine özel alan</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { href: '/kimlik-kartim', emoji: '🪪', title: 'Dijital Kimlik Kartım', desc: 'Üye kimlik kartını görüntüle ve indir' },
          { href: '/etkinliklerim', emoji: '📅', title: 'Etkinliklerim', desc: 'Katıldığın etkinlikleri gör' },
          { href: '/sertifikalarim', emoji: '🎓', title: 'Sertifikalarım', desc: 'Gönüllü sertifikalarını indir' },
          { href: '/forum', emoji: '💬', title: 'Üye Forumu', desc: 'Üyelerle özel toplulukta buluş' },
          { href: '/belgeler', emoji: '📄', title: 'Dernek Belgeleri', desc: 'Tüzük, kararlar ve yönetmelikler' },
          { href: '/basvuru', emoji: '✅', title: 'Üyelik Başvurusu', desc: 'Henüz üye değilsen başvur' },
        ].map(({ href, emoji, title, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <p style={{ fontSize: 30, marginBottom: 10 }}>{emoji}</p>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#3A1A1A', marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
