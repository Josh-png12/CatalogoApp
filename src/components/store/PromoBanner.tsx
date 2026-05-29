'use client'

import { useStoreConfig } from '@/context/StoreConfigContext'

const DEFAULT_TEXT =
  '✨ Envíos a domicilio disponibles  •  💄 Productos 100% originales  •  🎁 Consulta personalizada gratis  •  ⭐ Paga contra entrega  •  '

export function PromoBanner() {
  const config = useStoreConfig()
  const text = config.promo_banner_text || DEFAULT_TEXT
  if (!text.trim()) return null

  return (
    <div
      className="relative overflow-hidden flex items-center"
      style={{ background: '#C2157A', height: 36 }}
    >
      {/* Fade left */}
      <div
        className="absolute left-0 top-0 h-full w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #C2157A, transparent)' }}
      />
      {/* Fade right */}
      <div
        className="absolute right-0 top-0 h-full w-12 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #C2157A, transparent)' }}
      />
      <div className="animate-marquee flex whitespace-nowrap" style={{ animationDuration: '25s' }}>
        {[text, text, text, text].map((t, i) => (
          <span key={i} className="text-white font-medium px-6" style={{ fontSize: 12 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
