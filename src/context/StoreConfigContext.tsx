'use client'

import { createContext, useContext } from 'react'
import type { StoreConfig } from '@/types'

const fallback: StoreConfig = {
  id: '',
  store_id: '',
  whatsapp_number: '',
  primary_color: '#E91E8C',
  store_name: 'Beauty',
  consultant_name: 'Angélica Oñate',
  consultant_bio: 'Consultora independiente con más de 5 años de experiencia ayudando a mujeres a descubrir y realzar su belleza natural. Mi compromiso es brindarte productos de la más alta calidad con una atención completamente personalizada.',
  hero_title: 'Descubre tu\nbelleza ideal',
  hero_badge_text: 'Catálogo Oficial · Beauty',
  hero_subtitle: 'Productos seleccionados por tu consultora personal. Calidad garantizada, entrega directa a tu puerta.',
  promo_banner_text: '✨ Envío a domicilio  •  💄 Productos originales  •  🎁 Consulta gratis  •  ⭐ Paga contra entrega',
  certified_label: 'Consultora Certificada',
  feature_1: 'Asesoría personalizada gratuita',
  feature_2: 'Entrega a domicilio en Riohacha',
  feature_3: 'Garantía de satisfacción',
  contact_message: 'Hola Angélica, me gustaría recibir asesoría 💄',
  footer_text: 'Hecho con ♥ en Riohacha · Beauty by Angélica',
}

function mergeWithFallback(config: StoreConfig | null, fb: StoreConfig): StoreConfig {
  if (!config) return fb
  const merged = { ...config }
  for (const key of Object.keys(fb) as Array<keyof StoreConfig>) {
    if (merged[key] == null) {
      ;(merged as Record<string, unknown>)[key] = fb[key]
    }
  }
  return merged
}

const StoreConfigContext = createContext<StoreConfig>(fallback)

export function StoreConfigProvider({
  config,
  children,
}: {
  config: StoreConfig | null
  children: React.ReactNode
}) {
  return (
    <StoreConfigContext.Provider value={mergeWithFallback(config, fallback)}>
      {children}
    </StoreConfigContext.Provider>
  )
}

export function useStoreConfig() {
  return useContext(StoreConfigContext)
}
