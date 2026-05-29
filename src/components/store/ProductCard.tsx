'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatCOP, getEffectivePrice, hasActivePromo, formatDiscount } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import { PromoBadge } from '@/components/store/PromoBadge'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [added, setAdded] = useState(false)

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0]
  const isNew        = (() => {
    const created = (product as unknown as { created_at?: string }).created_at
    return created ? Date.now() - new Date(created).getTime() < 7 * 24 * 60 * 60 * 1000 : false
  })()
  const outOfStock    = product.stock === 0
  const hasPromo      = hasActivePromo(product)
  const effectivePrice = getEffectivePrice(product)
  const liked         = isInWishlist(product.id)

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
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="product-card relative overflow-hidden cursor-pointer flex flex-col group"
      style={{ background: 'white', borderRadius: 0 }}
    >
      {/* Image zone */}
      <div
        className="relative product-image-wrapper"
        style={{ aspectRatio: '4/5', background: 'var(--cream)' }}
      >
        {/* Product image */}
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover"
            style={{ transition: 'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: 'linear-gradient(135deg, #FCE4F3, #F9C2E6)' }}
          >
            ✨
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.28) 100%)',
            opacity: 0,
            transition: 'opacity 300ms ease',
          }}
          ref={(el) => {
            if (!el) return
            const parent = el.closest('.group')
            if (!parent) return
            const show = () => { el.style.opacity = '1' }
            const hide = () => { el.style.opacity = '0' }
            parent.addEventListener('mouseenter', show)
            parent.addEventListener('mouseleave', hide)
          }}
        />

        {/* Hover add button */}
        <div
          className="absolute bottom-3 left-3 right-3 overflow-hidden"
          style={{ transform: 'translateY(6px)', opacity: 0, transition: 'transform 300ms ease, opacity 300ms ease' }}
          ref={(el) => {
            if (!el) return
            const parent = el.closest('.group')
            if (!parent) return
            const show = () => { el.style.transform = 'translateY(0)'; el.style.opacity = '1' }
            const hide = () => { el.style.transform = 'translateY(6px)'; el.style.opacity = '0' }
            parent.addEventListener('mouseenter', show)
            parent.addEventListener('mouseleave', hide)
          }}
        >
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-full font-medium uppercase transition-all duration-150 disabled:cursor-not-allowed"
            style={{
              fontSize: 11,
              letterSpacing: '1px',
              padding: '10px 0',
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
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {hasPromo ? (
            <PromoBadge
              label={product.promo_label ?? 'Oferta'}
              discountText={formatDiscount(product)}
              endsAt={product.promo_ends_at}
            />
          ) : outOfStock ? (
            <span
              className="text-gray-500 uppercase font-medium"
              style={{
                fontSize: 9,
                padding: '3px 7px',
                letterSpacing: '0.8px',
                background: '#e5e7eb',
                borderRadius: 0,
              }}
            >
              Agotado
            </span>
          ) : isNew ? (
            <span
              className="text-white uppercase font-medium"
              style={{
                fontSize: 9,
                padding: '3px 7px',
                letterSpacing: '0.8px',
                background: 'var(--warm-dark)',
                borderRadius: 0,
              }}
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
          className="absolute top-2.5 right-2.5 flex items-center justify-center"
          style={{ background: 'none', border: 'none', padding: 4 }}
          aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            className="h-4 w-4 drop-shadow-sm"
            style={{
              color: liked ? 'var(--brand)' : 'rgba(255,255,255,0.85)',
              fill: liked ? 'var(--brand)' : 'none',
              strokeWidth: 1.5,
              transition: 'color 200ms ease, fill 200ms ease',
            }}
          />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 4px 14px' }}>
        {product.category && (
          <p
            className="uppercase font-medium"
            style={{
              fontSize: 9,
              letterSpacing: '0.08em',
              color: 'var(--brand)',
              opacity: 0.7,
              marginBottom: 3,
            }}
          >
            {product.category.name}
          </p>
        )}
        <h3
          className="leading-tight line-clamp-2 text-gray-900"
          style={{ fontSize: 13, fontWeight: 400, marginBottom: 4 }}
        >
          {product.name}
        </h3>

        {/* Price */}
        {hasPromo ? (
          <div style={{ marginTop: 6 }}>
            <p className="text-gray-400 line-through" style={{ fontSize: 11 }}>{formatCOP(product.price)}</p>
            <p className="font-semibold" style={{ fontSize: 15, color: 'var(--brand)' }}>{formatCOP(effectivePrice)}</p>
          </div>
        ) : (
          <p className="font-medium text-gray-900" style={{ fontSize: 15, marginTop: 6 }}>
            {formatCOP(product.price)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
