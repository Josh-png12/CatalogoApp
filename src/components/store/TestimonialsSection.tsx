'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Review } from '@/types'

const FALLBACK: { name: string; rating: number; comment: string; skin: string }[] = [
  {
    name: 'María García',
    rating: 5,
    comment:
      'Excelente producto, me lo recomendó Angélica y quedé encantada. Mi piel se siente suave toda la semana.',
    skin: 'Piel mixta · Tono medio',
  },
  {
    name: 'Laura Martínez',
    rating: 5,
    comment:
      '100% recomendado. Angélica me asesoró perfectamente. Llegó rápido y el producto es original.',
    skin: 'Piel seca · Tono claro',
  },
  {
    name: 'Carolina Pérez',
    rating: 5,
    comment:
      'La calidad es increíble, y el servicio de Angélica es personalizado y muy amable. Volvería a comprar siempre.',
    skin: 'Piel normal · Tono medio oscuro',
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: 13, color: s <= rating ? '#C9A84C' : 'rgba(255,255,255,0.2)' }}>
          ★
        </span>
      ))}
    </div>
  )
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const init = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0 font-medium text-white uppercase"
      style={{
        width: 36,
        height: 36,
        background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
        fontSize: 12,
      }}
    >
      {init}
    </div>
  )
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('reviews')
      .select('*')
      .eq('store_id', storeId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setReviews(data as Review[])
      })
  }, [storeId])

  const items =
    reviews.length > 0
      ? reviews.map((r) => ({
          name: r.reviewer_name,
          rating: r.rating,
          comment: r.comment ?? '',
          skin: [r.skin_type, r.skin_tone].filter(Boolean).join(' · '),
        }))
      : FALLBACK

  return (
    <section
      className="py-16"
      style={{ background: 'var(--warm-dark)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="uppercase"
            style={{
              fontSize: 11,
              letterSpacing: '3px',
              color: 'var(--gold)',
              marginBottom: 12,
            }}
          >
            Social proof
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 400,
              color: 'white',
              marginBottom: 8,
            }}
          >
            Lo que dicen nuestras clientas
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Experiencias reales de clientas en Riohacha
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div
          className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:overflow-visible"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {items.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0"
              style={{
                minWidth: 'clamp(260px, 75vw, 320px)',
                scrollSnapAlign: 'start',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <Stars rating={item.rating} />
              <p
                className="italic"
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.7,
                  marginTop: 12,
                  marginBottom: 16,
                }}
              >
                &ldquo;{item.comment}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <Initials name={item.name} />
                <div>
                  <p className="font-medium text-white" style={{ fontSize: 13 }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--brand)', marginTop: 2 }}>
                    {item.skin || 'Clienta verificada ✓'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
