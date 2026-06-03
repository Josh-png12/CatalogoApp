'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatCOP, getEffectivePrice, hasActivePromo, formatDiscount } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import { PromoBadge } from '@/components/store/PromoBadge'
import type { Product } from '@/types'

export function ProductCard({ product, wide = false }: { product: Product; wide?: boolean }) {
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [added,   setAdded]   = useState(false)
  const [hovered, setHovered] = useState(false)

  const primaryImage   = product.images?.find((img) => img.is_primary) ?? product.images?.[0]
  const isNew          = (() => {
    const created = (product as unknown as { created_at?: string }).created_at
    return created ? Date.now() - new Date(created).getTime() < 15 * 24 * 60 * 60 * 1000 : false
  })()
  const outOfStock     = product.stock === 0
  const hasPromo       = hasActivePromo(product)
  const effectivePrice = getEffectivePrice(product)
  const liked          = isInWishlist(product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (outOfStock || added) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    trackEvent('add_to_cart', product.id, { price: effectivePrice })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      className="relative overflow-hidden cursor-pointer flex flex-col"
      style={{ background: 'white', borderRadius: 0 }}
    >
      <Link href={`/producto/${product.id}`} className="flex flex-col flex-1">
      {/* Image zone */}
      <div
        className={`relative overflow-hidden ${wide ? 'aspect-[4/3]' : 'aspect-square md:aspect-[3/4]'}`}
        style={{ background: 'var(--cream)' }}
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover"
            style={{
              transition: 'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg, #FCE4F3, #F9C2E6)' }}
          >
            ✨
          </div>
        )}

        {/* Category pill badge — bottom-left of image */}
        {product.category && (
          <div
            className="absolute bottom-2 left-2 pointer-events-none z-10"
            style={{
              background: 'var(--brand)',
              color: 'white',
              fontSize: 8,
              letterSpacing: '0.5px',
              padding: '3px 8px',
              borderRadius: 20,
              opacity: 0.9,
            }}
          >
            {product.category.name}
          </div>
        )}

        {/* Hover overlay with "Ver detalle" */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.30)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
        >
          <span
            className="text-white font-medium uppercase"
            style={{ fontSize: 11, letterSpacing: '1.5px' }}
          >
            Ver detalle
          </span>
        </div>

        {/* Hover add button (desktop) / always visible (mobile touch) */}
        <div
          className="absolute bottom-2 left-2 right-2 hidden sm:block"
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            opacity: hovered ? 1 : 0,
            transition: 'transform 300ms ease, opacity 300ms ease',
          }}
        >
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-full font-medium uppercase transition-colors duration-150 disabled:cursor-not-allowed"
            style={{
              fontSize: 11,
              letterSpacing: '1px',
              padding: '9px 0',
              borderRadius: 0,
              background: outOfStock ? '#9ca3af' : added ? '#22c55e' : 'white',
              color: outOfStock ? 'white' : added ? 'white' : '#1a1a1a',
            }}
          >
            <AnimatePresence mode="wait">
              {outOfStock ? (
                <motion.span key="stock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Sin stock
                </motion.span>
              ) : added ? (
                <motion.span key="added" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  ✓ Agregado
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Agregar al carrito
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasPromo ? (
            <PromoBadge
              label={product.promo_label ?? 'Oferta'}
              discountText={formatDiscount(product)}
              endsAt={product.promo_ends_at}
            />
          ) : outOfStock ? (
            <span
              className="text-gray-500 uppercase font-medium"
              style={{ fontSize: 8, padding: '2px 6px', background: '#e5e7eb', borderRadius: 0 }}
            >
              Agotado
            </span>
          ) : isNew ? (
            <span
              className="text-white uppercase font-medium"
              style={{ fontSize: 8, padding: '2px 6px', background: 'var(--warm-dark)', borderRadius: 0 }}
            >
              Nuevo
            </span>
          ) : null}
        </div>

        {/* Wishlist heart */}
        <motion.button
          onClick={handleWishlist}
          whileTap={{ scale: 1.4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute top-2 right-2 flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '50%',
            border: 'none',
            padding: 0,
          }}
          aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            style={{
              width: 13,
              height: 13,
              color: liked ? 'var(--brand)' : '#9ca3af',
              fill: liked ? 'var(--brand)' : 'none',
              strokeWidth: 1.5,
              transition: 'color 200ms ease, fill 200ms ease',
            }}
          />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: '8px 4px 12px' }}>
        {product.category && (
          <p
            className="uppercase font-medium"
            style={{ fontSize: 8, letterSpacing: '0.08em', color: 'var(--brand)', opacity: 0.7, marginBottom: 2 }}
          >
            {product.category.name}
          </p>
        )}
        <h3
          className="leading-tight line-clamp-2 text-gray-900"
          style={{ fontSize: 12, fontWeight: 400, marginBottom: 4 }}
        >
          {product.name}
        </h3>

        {/* Price */}
        {hasPromo ? (
          <div>
            <p className="text-gray-400 line-through" style={{ fontSize: 10 }}>{formatCOP(product.price)}</p>
            <p className="font-semibold" style={{ fontSize: 14, color: 'var(--brand)' }}>{formatCOP(effectivePrice)}</p>
          </div>
        ) : (
          <p className="font-medium text-gray-900" style={{ fontSize: 14 }}>
            {formatCOP(product.price)}
          </p>
        )}

        {/* Low-stock badge (Part 2) */}
        {!outOfStock && product.stock <= 5 && (
          <p className="font-medium mt-1" style={{ fontSize: 11, color: '#dc2626' }}>
            🔥 ¡Solo quedan {product.stock} unidades!
          </p>
        )}

        {/* Mobile add button — always visible */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="w-full font-medium uppercase mt-2 sm:hidden transition-colors duration-150 disabled:cursor-not-allowed"
          style={{
            fontSize: 10,
            letterSpacing: '0.5px',
            padding: '7px 0',
            borderRadius: 0,
            background: outOfStock ? '#e5e7eb' : added ? '#22c55e' : 'var(--brand)',
            color: outOfStock ? '#9ca3af' : 'white',
          }}
        >
          {outOfStock ? 'Sin stock' : added ? '✓ Agregado' : 'Agregar'}
        </button>
      </div>
      </Link>
    </motion.div>
  )
}
