'use client'

import { motion } from 'framer-motion'

export function FullWidthBanner() {
  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, var(--brand-900) 0%, var(--brand) 100%)',
        minHeight: 'clamp(180px, 22vh, 280px)',
      }}
    >
      {/* Noise overlay for texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />

      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="uppercase"
          style={{
            fontSize: 11,
            letterSpacing: '3px',
            color: 'var(--gold)',
            marginBottom: 12,
          }}
        >
          Colección Actual
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 400,
            color: 'white',
            marginBottom: 20,
          }}
        >
          Encuentra tu rutina perfecta
        </motion.h2>
        <motion.a
          href="#catalogo"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block uppercase font-medium transition-all"
          style={{
            fontSize: 12,
            letterSpacing: '1.5px',
            padding: '12px 28px',
            border: '1px solid rgba(255,255,255,0.6)',
            color: 'white',
            borderRadius: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Ver todo el catálogo
        </motion.a>
      </div>
    </section>
  )
}
