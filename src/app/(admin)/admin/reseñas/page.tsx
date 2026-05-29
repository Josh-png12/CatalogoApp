'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Trash2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/components/ui/toaster'
import type { Review } from '@/types'

type Filter = 'pending' | 'approved' | 'all'

interface ReviewWithProduct extends Review {
  product?: { name: string } | null
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= rating ? '#C9A84C' : '#e5e7eb', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

export default function ReseñasPage() {
  const [reviews, setReviews]   = useState<ReviewWithProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<Filter>('pending')
  const [actionId, setActionId] = useState<string | null>(null)
  const toast = useToastStore((s) => s.toast)
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const fetchReviews = async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase
      .from('reviews')
      .select('*, product:products(name)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (filter === 'pending')  q = q.eq('approved', false)
    if (filter === 'approved') q = q.eq('approved', true)

    const { data } = await q
    setReviews((data ?? []) as unknown as ReviewWithProduct[])
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [filter])

  const approve = async (id: string) => {
    setActionId(id)
    const supabase = createClient()
    await supabase.from('reviews').update({ approved: true }).eq('id', id)
    toast('Reseña aprobada ✓')
    await fetchReviews()
    setActionId(null)
  }

  const reject = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    setActionId(id)
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    toast('Reseña eliminada')
    await fetchReviews()
    setActionId(null)
  }

  const FILTERS: { label: string; value: Filter }[] = [
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobadas',  value: 'approved' },
    { label: 'Todas',      value: 'all' },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Reseñas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Modera las reseñas de tus clientas
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: '#e5e7eb' }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-4 py-2.5 text-sm transition-colors"
            style={{
              borderBottom: filter === f.value ? '2px solid var(--brand)' : '2px solid transparent',
              color: filter === f.value ? '#1a1a1a' : '#9ca3af',
              fontWeight: filter === f.value ? 500 : 400,
              marginBottom: -1,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Cargando…</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No hay reseñas {filter === 'pending' ? 'pendientes' : ''}.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex gap-4 p-4 rounded-xl border bg-white"
              style={{ borderColor: '#e5e7eb', opacity: actionId === r.id ? 0.5 : 1 }}
            >
              {/* Photo thumbnail */}
              {r.photo_url ? (
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={r.photo_url} alt="Foto reseña" fill className="object-cover" />
                </div>
              ) : (
                <div
                  className="w-16 h-16 flex-shrink-0 rounded-lg flex items-center justify-center text-2xl"
                  style={{ background: '#f3f4f6' }}
                >
                  💬
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{r.reviewer_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Stars rating={r.rating} />
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!r.approved && (
                      <button
                        onClick={() => approve(r.id)}
                        disabled={actionId === r.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors"
                        style={{ background: '#22c55e' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#16a34a' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#22c55e' }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Aprobar
                      </button>
                    )}
                    <button
                      onClick={() => reject(r.id)}
                      disabled={actionId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>

                {r.product && (
                  <p className="text-xs text-gray-400 mt-1">
                    Producto: <span className="font-medium text-gray-600">{r.product.name}</span>
                  </p>
                )}

                {r.comment && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{r.comment}</p>
                )}

                <div className="flex flex-wrap gap-3 mt-2">
                  {r.skin_type && (
                    <span className="text-xs text-gray-400">Piel {r.skin_type}</span>
                  )}
                  {r.skin_tone && (
                    <span className="text-xs text-gray-400">Tono {r.skin_tone}</span>
                  )}
                  {r.reviewer_phone && (
                    <span className="text-xs text-gray-400">📱 {r.reviewer_phone}</span>
                  )}
                  {r.approved && (
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>✓ Publicada</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
