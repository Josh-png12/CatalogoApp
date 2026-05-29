'use client'

import { motion } from 'framer-motion'
import { Grid2X2, ShoppingCart } from 'lucide-react'
import type { ElementType } from 'react'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 28, height: 28 }} className="fill-current" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.099 1.507 5.829L.057 23.8l6.122-1.428A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.006-1.37l-.36-.214-3.633.952.969-3.542-.235-.374A9.845 9.845 0 012.182 12c0-5.413 4.405-9.818 9.818-9.818 5.413 0 9.818 4.405 9.818 9.818 0 5.414-4.405 9.818-9.818 9.818z"/>
  </svg>
)

interface Step {
  number: string
  icon: ElementType | null
  iconColor: string
  title: string
  description: string
  isWhatsApp?: boolean
}

const steps: Step[] = [
  {
    number: '01',
    icon: Grid2X2,
    iconColor: '#E91E8C',
    title: 'Explora el catálogo',
    description: 'Navega por todos nuestros productos y encuentra lo que necesitas',
  },
  {
    number: '02',
    icon: ShoppingCart,
    iconColor: '#E91E8C',
    title: 'Arma tu carrito',
    description: 'Agrega todos los productos que quieras, ajusta cantidades',
  },
  {
    number: '03',
    icon: null,
    iconColor: '#25D366',
    title: 'Pide por WhatsApp',
    description: 'Con un clic enviamos tu pedido completo directo a Angélica',
    isWhatsApp: true,
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-10 md:py-16 px-4 md:px-6 lg:px-8" style={{ background: '#fff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 500,
              color: '#1a1a1a',
              marginBottom: 8,
            }}
          >
            ¿Cómo hacer tu pedido?
          </h2>
          <p style={{ fontSize: 14, color: '#888' }}>Simple, rápido y sin complicaciones</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Dashed connector — desktop only */}
          <div
            className="hidden md:block absolute"
            style={{
              top: 36,
              left: '16.67%',
              right: '16.67%',
              height: 2,
              borderTop: '2px dashed rgba(233,30,140,0.25)',
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center"
                style={{ zIndex: 1 }}
              >
                {/* Watermark number */}
                <span
                  className="absolute select-none"
                  style={{
                    fontSize: 80,
                    fontWeight: 700,
                    color: 'rgba(233,30,140,0.07)',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    lineHeight: 1,
                    zIndex: 0,
                  }}
                >
                  {step.number}
                </span>

                {/* Icon circle */}
                <div
                  className="relative flex items-center justify-center rounded-full mb-4"
                  style={{ width: 72, height: 72, background: `${step.iconColor}15`, zIndex: 1 }}
                >
                  {step.isWhatsApp ? (
                    <span style={{ color: step.iconColor }}>
                      <WhatsAppIcon />
                    </span>
                  ) : Icon ? (
                    <Icon style={{ width: 28, height: 28, color: step.iconColor }} />
                  ) : null}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, maxWidth: 200 }}>
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
