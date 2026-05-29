'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { formatCOP, getEffectivePrice, hasActivePromo, formatDiscount } from '@/lib/utils'
import { PromoBadge } from '@/components/store/PromoBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Product } from '@/types'

function FeaturedCard({ product, index, wide }: { product: Product; index: number; wide?: boolean }) {
  const { addItem } = useCart()
  const img        = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const hasPromo   = hasActivePromo(product)
  const finalPrice = getEffectivePrice(product)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.15 }}
      viewport={{ once: true, margin: '-60px' }}
      className="group flex-shrink-0 rounded-2xl overflow-hidden flex flex-col snap-start"
      style={{
        width: wide ? undefined : 'clamp(180px, 220px, 240px)',
        background: 'white',
        border: '0.5px solid #E8E6DF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 300ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: wide ? '16/9' : '3/4', background: '#F5F4F0' }}>
        {img ? (
          <Image
            src={img.url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="220px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg, #FCE4F3, #F9C2E6)' }}
          >
            💄
          </div>
        )}
        <div className="absolute top-2 left-2">
          {hasPromo ? (
            <PromoBadge
              label={product.promo_label ?? 'Oferta'}
              discountText={formatDiscount(product)}
              endsAt={product.promo_ends_at}
            />
          ) : (
            <span
              className="text-white font-bold rounded-full"
              style={{ fontSize: 9, padding: '3px 8px', background: '#C9A84C' }}
            >
              ★ Destacado
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1">
        {product.category && (
          <p className="uppercase font-medium" style={{ fontSize: 9, letterSpacing: '0.06em', color: '#E91E8C' }}>
            {product.category.name}
          </p>
        )}
        <p className="font-medium text-gray-900 line-clamp-2 leading-tight" style={{ fontSize: 12 }}>
          {product.name}
        </p>
        {hasPromo ? (
          <div>
            <p className="line-through text-gray-400" style={{ fontSize: 11 }}>{formatCOP(product.price)}</p>
            <p className="font-medium" style={{ fontSize: 15, color: '#E91E8C' }}>{formatCOP(finalPrice)}</p>
          </div>
        ) : (
          <p className="font-medium text-gray-900" style={{ fontSize: 15 }}>{formatCOP(product.price)}</p>
        )}
        <button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="w-full mt-1 font-medium text-white rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: 12, padding: '7px 0', background: '#E91E8C' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#C2157A' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#E91E8C' }}
        >
          {product.stock === 0 ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </motion.div>
  )
}

export function FeaturedSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  const wide = products.length === 1
  const containerClass =
    products.length === 1
      ? 'grid grid-cols-1'
      : products.length === 2
      ? 'grid grid-cols-2 gap-4'
      : 'flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible'

  return (
    <section id="destacados" className="py-10 md:py-16 px-4 md:px-6 lg:px-8" style={{ background: '#FAFAF8' }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader title="Productos destacados" subtitle="Elegidos especialmente para ti" />
        <div className={containerClass}>
          {products.map((p, i) => (
            <FeaturedCard key={p.id} product={p} index={i} wide={wide} />
          ))}
        </div>
      </div>
    </section>
  )
}
