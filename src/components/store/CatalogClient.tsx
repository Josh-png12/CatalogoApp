'use client'

import { Fragment, useState } from 'react'
import { CategoryFilter } from '@/components/store/CategoryFilter'
import { ProductCard } from '@/components/store/ProductCard'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import type { Product, Category } from '@/types'

interface CatalogClientProps {
  initialProducts: Product[]
  initialCategories: Category[]
}

const SORT_OPTIONS = [
  { label: 'Relevancia',            value: 'featured'   },
  { label: 'Precio: menor a mayor', value: 'price_asc'  },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Nuevos primero',        value: 'newest'     },
]

function sortProducts(products: Product[], sort: string): Product[] {
  switch (sort) {
    case 'price_asc':
      return [...products].sort((a, b) => (a.final_price ?? a.price) - (b.final_price ?? b.price))
    case 'price_desc':
      return [...products].sort((a, b) => (b.final_price ?? b.price) - (a.final_price ?? a.price))
    case 'newest':
      return [...products].sort((a, b) => {
        const ta = (a as unknown as { created_at?: string }).created_at ?? ''
        const tb = (b as unknown as { created_at?: string }).created_at ?? ''
        return tb.localeCompare(ta)
      })
    default:
      return [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }
}

// Part 1: rotating editorial messages
const EDITORIAL_MESSAGES = [
  {
    quote: 'La belleza no es un estándar, es una expresión. 💄',
    sub:   'Encuentra tu estilo único con Beauty',
  },
  {
    quote: 'Tu piel merece lo mejor. Siempre. ✨',
    sub:   'Productos seleccionados por Angélica Oñate',
  },
  {
    quote: 'Cada producto cuenta una historia de confianza. 🌸',
    sub:   'Calidad garantizada · Entrega a domicilio',
  },
  {
    quote: 'Brilla con luz propia. La belleza empieza en ti. 🌟',
    sub:   'Angélica Oñate · Consultora Certificada',
  },
  {
    quote: 'Cuídate hoy, lúcete mañana. 💫',
    sub:   'Más de 5 años asesorando tu belleza',
  },
]

const CHUNK_SIZE = 8

const CATEGORY_PRIORITY: Record<string, number> = {
  'MAQUILLAJE':           1,
  'CUIDADO DE LA PIEL':   2,
  'CUIDADO CORPORAL':     3,
  'FRAGANCIAS PARA ELLA': 4,
  'FRAGANCIAS PARA ÉL':   5,
}

function getCategoryPriority(product: Product): number {
  const name = product.category?.name?.toUpperCase().trim() ?? ''
  return CATEGORY_PRIORITY[name] ?? 99
}

export function CatalogClient({ initialProducts, initialCategories }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sort, setSort]                         = useState('featured')
  const [sortOpen, setSortOpen]                 = useState(false)

  const baseFiltered = selectedCategory
    ? initialProducts.filter((p) => p.category_id === selectedCategory)
    : initialProducts

  // When showing all products with default sort, apply category priority order
  const filtered =
    selectedCategory === null && sort === 'featured'
      ? [...baseFiltered].sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b))
      : baseFiltered

  const sorted = sortProducts(filtered, sort)

  // Part 2.2 — split into chunks of 8 for alternating backgrounds
  const chunks: Product[][] = []
  for (let i = 0; i < sorted.length; i += CHUNK_SIZE) {
    chunks.push(sorted.slice(i, i + CHUNK_SIZE))
  }

  return (
    <div>
      {/* ── Header editorial (Part 2.4) ──────────────────────────── */}
      <div
        className="flex items-end justify-between pb-5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div>
          {/* Decorative brand line */}
          <div style={{ width: 32, height: 2, background: 'var(--brand)', marginBottom: 10 }} />
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 400,
              color: '#1a1a1a',
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            Catálogo completo
          </h2>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            {sorted.length} productos disponibles
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 hover:text-gray-800 transition-colors"
            style={{ fontSize: 13, color: '#6b7280' }}
          >
            <span style={{ color: '#9ca3af' }}>Ordenar:</span>{' '}
            <span className="font-medium" style={{ color: '#1a1a1a' }}>
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </span>
            <span style={{ fontSize: 10, marginLeft: 2 }}>▾</span>
          </button>

          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white shadow-lg"
                style={{ minWidth: 190, border: '0.5px solid #e5e7eb', borderRadius: 0 }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setSortOpen(false) }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    style={{
                      fontSize: 13,
                      color: sort === opt.value ? 'var(--brand)' : '#4b5563',
                      fontWeight: sort === opt.value ? 500 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Category filter ───────────────────────────────────────── */}
      {initialCategories.length > 0 && (
        <CategoryFilter
          categories={initialCategories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* ── Products ──────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p style={{ fontSize: 16 }}>No se encontraron productos en esta categoría</p>
        </div>
      ) : (
        <div className="mt-6">
          {chunks.map((chunk, chunkIdx) => {
            // Part 1: rotate editorial messages by chunk index
            const msg = EDITORIAL_MESSAGES[chunkIdx % EDITORIAL_MESSAGES.length]

            return (
              <Fragment key={chunkIdx}>
                {/* Part 1: editorial card between chunks */}
                {chunkIdx > 0 && (
                  <RevealOnScroll delay={0}>
                    <div
                      className="my-2 py-7 px-6"
                      style={{ background: 'rgba(233,30,140,0.04)' }}
                    >
                      <p
                        className="italic"
                        style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: 'clamp(16px, 2vw, 20px)',
                          color: '#1a1a1a',
                          lineHeight: 1.5,
                          marginBottom: 8,
                          maxWidth: 520,
                        }}
                      >
                        &ldquo;{msg.quote}&rdquo;
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af' }}>{msg.sub}</p>
                    </div>
                  </RevealOnScroll>
                )}

                {/* Part 2.2: alternating background per chunk */}
                <div
                  className="-mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 py-5"
                  style={{ background: chunkIdx % 2 === 1 ? '#FDF8F5' : 'transparent' }}
                >
                  {/* Part 2.1: 4-col grid, col-span-2 every 5th product */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chunk.map((product, i) => {
                      const isWide = i % 5 === 0
                      return (
                        <RevealOnScroll
                          key={product.id}
                          delay={(i % 4) * 0.07}
                          className={isWide ? 'col-span-2' : undefined}
                        >
                          <ProductCard product={product} wide={isWide} />
                        </RevealOnScroll>
                      )
                    })}
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
