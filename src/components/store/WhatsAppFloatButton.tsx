'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStoreConfig } from '@/context/StoreConfigContext'
import { buildWhatsAppURL } from '@/lib/whatsapp'

export function WhatsAppFloatButton() {
  const config = useStoreConfig()
  const [hovered, setHovered] = useState(false)

  if (!config.whatsapp_number) return null

  const waUrl = buildWhatsAppURL(
    config.whatsapp_number,
    `Hola ${config.consultant_name}! Estoy viendo tu catálogo y tengo una pregunta 😊`
  )

  return (
    <motion.div
      className="fixed bottom-6 left-5 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 2 }}
    >
      <div className="relative flex items-center">
        {/* Tooltip — desktop only */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="absolute left-14 hidden sm:block bg-gray-900 text-white rounded-lg px-3 py-1.5 whitespace-nowrap pointer-events-none"
              style={{ fontSize: 12 }}
            >
              Hablar con {config.consultant_name}
              <span
                className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                style={{ borderRightColor: '#111827' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Hablar con ${config.consultant_name} por WhatsApp`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 52,
            height: 52,
            background: '#25D366',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.40)',
            flexShrink: 0,
          }}
          animate={{ rotate: [0, -15, 15, -10, 0] }}
          transition={{
            repeat: Infinity,
            repeatDelay: 8,
            duration: 0.6,
            ease: 'easeInOut',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            style={{ width: 26, height: 26, fill: 'white' }}
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.099 1.507 5.829L.057 23.8l6.122-1.428A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.006-1.37l-.36-.214-3.633.952.969-3.542-.235-.374A9.845 9.845 0 012.182 12c0-5.413 4.405-9.818 9.818-9.818 5.413 0 9.818 4.405 9.818 9.818 0 5.414-4.405 9.818-9.818 9.818z" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  )
}
