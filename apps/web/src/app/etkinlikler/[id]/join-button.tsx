'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useSeason } from '@mutluet/ui'

type RegistrationStatus = 'kayitli' | 'bekleme_listesi' | 'iptal' | 'tamamlandi' | null

export function JoinButton({ eventId, userId, currentStatus, isFull }: {
  eventId: string
  userId?: string
  currentStatus: RegistrationStatus
  isFull: boolean
}) {
  const [status, setStatus] = useState<RegistrationStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const { config } = useSeason()
  const router = useRouter()

  async function join() {
    if (!userId) { router.push('/giris'); return }
    const uid = userId // capture as non-optional after narrowing
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('event_registrations').insert({
      event_id: eventId,
      user_id: uid,
      status: isFull ? 'bekleme_listesi' : 'kayitli',
    })
    if (!error) {
      setStatus(isFull ? 'bekleme_listesi' : 'kayitli')
      router.refresh()
    }
    setLoading(false)
  }

  async function cancel() {
    if (!userId) return
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('event_registrations').update({ status: 'iptal' }).eq('event_id', eventId).eq('user_id', userId)
    setStatus('iptal')
    router.refresh()
    setLoading(false)
  }

  if (status === 'kayitli') {
    return (
      <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 20, marginBottom: 6 }}>✅</p>
        <p style={{ fontWeight: 700, color: '#065F46', fontSize: 14 }}>Kayıt Tamamlandı</p>
        <button onClick={cancel} disabled={loading} style={{ marginTop: 12, fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Kaydı İptal Et
        </button>
      </div>
    )
  }

  if (status === 'bekleme_listesi') {
    return (
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>⏳ Bekleme Listesinde</p>
        <p style={{ fontSize: 12, color: '#B45309', marginTop: 6 }}>Yer açılırsa bildirim alacaksın.</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <button
        onClick={join}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          background: config.primary,
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Kaydediliyor...' : isFull ? 'Bekleme Listesine Gir' : 'Etkinliğe Katıl'}
      </button>
      {!userId && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Giriş yapman gerekiyor.</p>}
    </div>
  )
}
