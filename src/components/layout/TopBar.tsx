'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStoreConfig } from '@/context/StoreConfigContext'

const SESSION_KEY = 'beauty-topbar-dismissed'
const DEFAULT_TEXT = 'Envíos a domicilio en Riohacha · Consulta personalizada GRATIS · Productos 100% originales · Paga contra entrega'

export function TopBar() {
  const config = useStoreConfig()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const rawText = config.promo_banner_text || DEFAULT_TEXT
  const messages = rawText.split('•').map((s) => s.trim()).filter(Boolean)
  const repeated = [...messages, ...messages]

  return (
    <div
      className="relative overflow-hidden flex items-center"
      style={{ background: 'var(--brand-dark)', height: 38 }}
    >
      {/* Marquee track */}
      <div className="flex items-center" style={{ whiteSpace: 'nowrap' }}>
        <div
          className="flex items-center"
          style={{ animation: 'marquee 30s linear infinite', whiteSpace: 'nowrap' }}
        >
          {repeated.map((msg, i) => (
            <span key={i} className="flex items-center" style={{ fontSize: 11, color: 'white', letterSpacing: '0.4px' }}>
              {msg}
              <span className="mx-6" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8 }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ width: 24, height: 24 }}
        aria-label="Cerrar"
      >
        <X className="h-3 w-3 text-white/70" />
      </button>
    </div>
  )
}
