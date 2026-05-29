'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useStoreConfig } from '@/context/StoreConfigContext'
import { buildWhatsAppURL } from '@/lib/whatsapp'
import { formatCOP } from '@/lib/utils'
import type { Product } from '@/types'

function FloatingCard({
  product,
  style,
  delay,
}: {
  product?: Product
  style: React.CSSProperties
  delay: number
}) {
  const img = product?.images?.find((i) => i.is_primary) ?? product?.images?.[0]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className="absolute rounded-2xl p-3 flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(20px)',
        ...style,
      }}
    >
      <div
        className="rounded-xl overflow-hidden flex items-center justify-center mb-2 flex-shrink-0"
        style={{ width: '100%', aspectRatio: '3/2', background: 'rgba(255,255,255,0.08)' }}
      >
        {img ? (
          <Image
            src={img.url}
            alt={product?.name ?? ''}
            width={200}
            height={133}
            className="object-cover w-full h-full"
          />
        ) : (
          <span style={{ fontSize: 28 }}>💄</span>
        )}
      </div>
      <p className="text-white font-medium line-clamp-1" style={{ fontSize: 11 }}>
        {product?.name ?? 'Producto Beauty'}
      </p>
      <p style={{ fontSize: 12, color: '#F9C2E6', marginTop: 2 }}>
        {product ? formatCOP(product.final_price ?? product.price) : 'Consultar'}
      </p>
    </motion.div>
  )
}

export function HeroSection({ featuredProducts }: { featuredProducts: Product[] }) {
  const config = useStoreConfig()
  const [p1, p2, p3] = featuredProducts

  const waUrl = config.whatsapp_number
    ? buildWhatsAppURL(
        config.whatsapp_number,
        config.contact_message ?? 'Hola, me gustaría hacer un pedido 💄'
      )
    : '#'

  const stats = [
    { value: config.stat_1_number ?? '500+', label: config.stat_1_label ?? 'Clientas' },
    { value: config.stat_2_number ?? '5★',   label: config.stat_2_label ?? 'Calificación' },
    { value: config.stat_3_number ?? 'Riohacha', label: config.stat_3_label ?? 'Entrega' },
  ]

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 70% 50%, #4A0830 0%, #1A0A0E 60%)',
        minHeight: 'clamp(85vh, 100vh, 100vh)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Decorative bokeh */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '15%',
          right: '8%',
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,30,140,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center px-5 md:px-10 lg:px-16 py-12 md:py-20">
        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0 md:pr-8 lg:pr-12">
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 hidden sm:block"
            style={{
              fontSize: 10,
              letterSpacing: '3px',
              color: 'var(--gold)',
              textTransform: 'uppercase',
            }}
          >
            {config.hero_badge_text ?? 'Cosméticos premium · Riohacha'}
          </motion.p>

          {/* Editorial H1 */}
          <h1
            className="mb-5"
            style={{ fontFamily: 'var(--font-editorial)', lineHeight: 1.0 }}
          >
            {(['Descubre', 'tu', 'belleza', 'ideal.'] as const).map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="block"
                style={{
                  fontSize: 'clamp(40px, 9vw, 88px)',
                  fontWeight: 400,
                  color: i === 2 ? 'var(--brand)' : 'white',
                  fontStyle: i === 2 ? 'italic' : 'normal',
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.8,
              maxWidth: 400,
              marginBottom: 32,
            }}
          >
            {config.hero_subtitle ??
              'Productos seleccionados por tu consultora personal.\nCalidad garantizada, entrega directa a tu puerta en Riohacha.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-3"
            style={{ marginBottom: 32 }}
          >
            <a
              href="#catalogo"
              className="font-medium uppercase transition-all"
              style={{
                background: 'var(--brand)',
                color: 'white',
                borderRadius: 0,
                fontSize: 13,
                letterSpacing: '1.5px',
                padding: '14px 32px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--brand-dark)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(233,30,140,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--brand)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Explorar catálogo
            </a>
            {config.whatsapp_number && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium uppercase transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: 0,
                  fontSize: 13,
                  letterSpacing: '1.5px',
                  padding: '14px 32px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                }}
              >
                Hablar con {config.consultant_name?.split(' ')[0] ?? 'Angélica'}
              </a>
            )}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex items-center"
          >
            {stats.map((s, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)', margin: '0 12px' }} />
                )}
                <div>
                  <p className="font-medium text-white" style={{ fontSize: 18 }}>{s.value}</p>
                  <p className="uppercase" style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT COLUMN — stacked product cards */}
        <div
          className="hidden lg:block relative flex-shrink-0"
          style={{ width: 'clamp(280px,35vw,420px)', height: 480 }}
        >
          {/* Card 3 — behind left */}
          {p3 && (
            <FloatingCard
              product={p3}
              delay={0.9}
              style={{
                width: 160,
                opacity: 0.4,
                top: 120,
                left: -30,
                transform: 'rotate(-6deg)',
              }}
            />
          )}
          {/* Card 2 — behind right */}
          {p2 && (
            <FloatingCard
              product={p2}
              delay={0.7}
              style={{
                width: 180,
                opacity: 0.7,
                top: 40,
                right: -20,
                transform: 'rotate(4deg)',
              }}
            />
          )}
          {/* Card 1 — main center */}
          {p1 && (
            <FloatingCard
              product={p1}
              delay={0.5}
              style={{
                width: 220,
                top: 60,
                left: '50%',
                transform: 'translateX(-50%) rotate(-2deg)',
              }}
            />
          )}

          {/* Floating rating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="absolute"
            style={{
              bottom: 40,
              left: 20,
              background: 'white',
              borderRadius: 16,
              padding: '12px 16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 14, marginBottom: 2 }}>⭐⭐⭐⭐⭐</div>
            <p style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 600 }}>4.9 de 5</p>
            <p style={{ fontSize: 10, color: '#888' }}>127 reseñas verificadas</p>
          </motion.div>
        </div>
      </div>

      {/* Mobile bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(transparent, rgba(26,10,14,0.3))' }}
      />
    </section>
  )
}
