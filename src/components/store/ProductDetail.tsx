'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingCart, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useStoreConfig } from '@/context/StoreConfigContext'
import { buildWhatsAppURL } from '@/lib/whatsapp'
import { formatCOP, getEffectivePrice, hasActivePromo } from '@/lib/utils'
import type { Product, Variant } from '@/types'

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()
  const config = useStoreConfig()

  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>()
  const [activeImage, setActiveImage] = useState(
    () => Math.max(0, product.images?.findIndex((i) => i.is_primary) ?? 0)
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const hasPromo = hasActivePromo(product)
  const effectivePrice = getEffectivePrice(product)
  const unitPrice = effectivePrice + (selectedVariant?.price_delta ?? 0)
  const baseUnitPrice = product.price + (selectedVariant?.price_delta ?? 0)

  const handleAdd = () => {
    if (product.stock === 0 || added) return
    addItem(product, selectedVariant, quantity)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      openCart()
    }, 1500)
  }

  const waUrl = config.whatsapp_number
    ? buildWhatsAppURL(
        config.whatsapp_number,
        `Hola ${config.consultant_name}! Me interesa: ${product.name} 💄`
      )
    : '#'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6" style={{ fontSize: 12, color: '#9ca3af' }}>
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Inicio
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <span style={{ color: 'var(--brand)' }}>{product.category.name}</span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-500 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* LEFT: Images */}
        <div className="space-y-3">
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '1', background: '#F5F4F0' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {product.images?.[activeImage] ? (
                  <Image
                    src={product.images[activeImage].url}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl"
                    style={{ background: 'linear-gradient(135deg, #FCE4F3, #F9C2E6)' }}
                  >
                    💄
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className="relative flex-shrink-0 overflow-hidden transition-all"
                  style={{
                    width: 64,
                    height: 64,
                    background: '#F5F4F0',
                    border: `2px solid ${idx === activeImage ? 'var(--brand)' : 'transparent'}`,
                    outline: 'none',
                  }}
                >
                  <Image src={img.url} alt="" fill className="object-contain" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <p
              className="uppercase font-medium tracking-widest"
              style={{ fontSize: 10, color: 'var(--brand)' }}
            >
              {product.category.name}
            </p>
          )}

          <h1
            className="leading-tight text-gray-900"
            style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 400 }}
          >
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="font-bold" style={{ fontSize: 26, color: 'var(--brand)' }}>
              {formatCOP(unitPrice)}
            </span>
            {hasPromo && (
              <span className="text-gray-400 line-through" style={{ fontSize: 16 }}>
                {formatCOP(baseUnitPrice)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-500" style={{ fontSize: 14, lineHeight: 1.8 }}>
              {product.description}
            </p>
          )}

          {product.variants?.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-gray-700" style={{ fontSize: 13 }}>
                Opciones:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(selectedVariant?.id === variant.id ? undefined : variant)
                    }
                    className="px-3 py-1.5 transition-all"
                    style={{
                      fontSize: 13,
                      border: `1.5px solid ${selectedVariant?.id === variant.id ? 'var(--brand)' : '#e5e7eb'}`,
                      background: selectedVariant?.id === variant.id ? '#FDF0F8' : 'white',
                      color: selectedVariant?.id === variant.id ? 'var(--brand)' : '#374151',
                      borderRadius: 4,
                    }}
                  >
                    {variant.value}
                    {variant.price_delta !== 0 && (
                      <span className="ml-1 opacity-60" style={{ fontSize: 11 }}>
                        {variant.price_delta > 0 ? '+' : ''}
                        {formatCOP(variant.price_delta)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr style={{ borderColor: '#f0ede8' }} />

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-gray-500" style={{ fontSize: 13 }}>
                Cantidad:
              </span>
              <div
                className="flex items-center"
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 4 }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30"
                  style={{ width: 36, height: 36 }}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className="font-medium text-gray-900"
                  style={{ minWidth: 32, textAlign: 'center', fontSize: 15 }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30"
                  style={{ width: 36, height: 36 }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {product.stock <= 5 && (
                <span className="text-amber-600" style={{ fontSize: 12 }}>
                  Solo {product.stock} disponibles
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 font-medium uppercase transition-all disabled:cursor-not-allowed"
            style={{
              padding: '14px 0',
              fontSize: 12,
              letterSpacing: '1.2px',
              background: product.stock === 0 ? '#e5e7eb' : added ? '#22c55e' : 'var(--brand)',
              color: product.stock === 0 ? '#9ca3af' : 'white',
              borderRadius: 0,
              transition: 'background 300ms ease',
            }}
          >
            <AnimatePresence mode="wait">
              {product.stock === 0 ? (
                <motion.span key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Producto agotado
                </motion.span>
              ) : added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  ✓ Agregado al carrito
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Agregar al carrito
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {config.whatsapp_number && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 font-medium uppercase transition-colors hover:bg-green-50"
              style={{
                padding: '12px 0',
                fontSize: 12,
                letterSpacing: '1.2px',
                border: '1.5px solid #25D366',
                color: '#25D366',
                borderRadius: 0,
                textDecoration: 'none',
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Consultar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
