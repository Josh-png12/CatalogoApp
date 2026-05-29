'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCOP, getEffectivePrice, hasActivePromo } from '@/lib/utils'
import { useStoreConfig } from '@/context/StoreConfigContext'
import type { Product } from '@/types'

const POPULAR = ['Labial', 'Base', 'Sérum', 'Hidratante', 'Perfume', 'Ojos']

interface Props {
  open: boolean
  onClose: () => void
  products: Product[]
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function SearchOverlay({ open, onClose, products }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const config = useStoreConfig()
  const debouncedQuery = useDebounce(query, 150)

  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'description', weight: 1 },
          { name: 'category.name', weight: 2 },
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    [products]
  )

  const results = useMemo(
    () =>
      debouncedQuery.trim().length > 0
        ? fuse.search(debouncedQuery).slice(0, 12).map((r) => r.item)
        : [],
    [debouncedQuery, fuse]
  )

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleProductClick = (product: Product) => {
    onClose()
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleWhatsApp = () => {
    if (!config.whatsapp_number) return
    const msg = encodeURIComponent(
      `Hola ${config.consultant_name ?? 'Angélica'}! Busqué "${query}" en el catálogo y no encontré lo que necesito. ¿Tienes algo así? 💄`
    )
    window.open(`https://wa.me/${config.whatsapp_number}?text=${msg}`, '_blank')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-overlay"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] bg-white overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
            {/* Search input */}
            <div
              className="flex items-center gap-3 mb-8"
              style={{ borderBottom: '2px solid var(--brand)', paddingBottom: 8 }}
            >
              <Search className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--brand)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca productos, tonos, beneficios..."
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: '#1a1a1a' }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 flex-shrink-0"
                style={{ width: 36, height: 36, color: '#6b7280' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* States */}
            {!query.trim() ? (
              <div className="space-y-8">
                {/* Popular searches */}
                <div>
                  <p
                    className="uppercase mb-4"
                    style={{ fontSize: 11, letterSpacing: '2px', color: '#9ca3af' }}
                  >
                    Búsquedas populares
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="transition-all"
                        style={{
                          fontSize: 13,
                          padding: '8px 16px',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: 0,
                          color: '#4b5563',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--brand-light)'
                          e.currentTarget.style.borderColor = 'var(--brand)'
                          e.currentTarget.style.color = 'var(--brand)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f9fafb'
                          e.currentTarget.style.borderColor = '#e5e7eb'
                          e.currentTarget.style.color = '#4b5563'
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured products */}
                <div>
                  <p
                    className="uppercase mb-4"
                    style={{ fontSize: 11, letterSpacing: '2px', color: '#9ca3af' }}
                  >
                    Productos populares
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {products.slice(0, 4).map((p) => (
                      <SearchProductCard key={p.id} product={p} onClick={() => handleProductClick(p)} />
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div>
                <p className="mb-4" style={{ fontSize: 13, color: '#6b7280' }}>
                  {results.length} resultado{results.length !== 1 ? 's' : ''} para{' '}
                  <strong className="text-gray-900">&ldquo;{query}&rdquo;</strong>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {results.map((p) => (
                    <SearchProductCard key={p.id} product={p} query={query} onClick={() => handleProductClick(p)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p className="font-medium text-gray-800 mb-2" style={{ fontSize: 18 }}>
                  No encontramos &ldquo;{query}&rdquo;
                </p>
                <p className="text-gray-400 mb-6" style={{ fontSize: 14 }}>
                  Prueba con: {POPULAR.slice(0, 3).join(', ')}
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 font-medium text-white"
                  style={{
                    fontSize: 13,
                    padding: '12px 24px',
                    background: '#25D366',
                    borderRadius: 0,
                  }}
                >
                  Hablar con {config.consultant_name?.split(' ')[0] ?? 'Angélica'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SearchProductCard({
  product,
  query,
  onClick,
}: {
  product: Product
  query?: string
  onClick: () => void
}) {
  const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
  const price = getEffectivePrice(product)
  const hasPromo = hasActivePromo(product)

  let displayName = product.name
  if (query) {
    const idx = product.name.toLowerCase().indexOf(query.toLowerCase())
    if (idx >= 0) {
      displayName = product.name
    }
  }

  return (
    <button
      onClick={onClick}
      className="text-left group cursor-pointer"
    >
      <div
        className="relative overflow-hidden mb-2"
        style={{ aspectRatio: '1', background: 'var(--cream)' }}
      >
        {img ? (
          <Image
            src={img.url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">✨</div>
        )}
      </div>
      <p className="text-gray-800 leading-tight line-clamp-2" style={{ fontSize: 12 }}>
        {displayName}
      </p>
      <p className="font-medium mt-0.5" style={{ fontSize: 13, color: hasPromo ? 'var(--brand)' : '#1a1a1a' }}>
        {formatCOP(price)}
      </p>
    </button>
  )
}
