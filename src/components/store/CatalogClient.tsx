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
  { label: 'Relevancia',    value: 'featured' },
  { label: 'Precio: menor', value: 'price_asc' },
  { label: 'Precio: mayor', value: 'price_desc' },
  { label: 'Más nuevos',    value: 'newest' },
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

const EDITORIAL_QUOTE = {
  text: 'Los productos que yo misma uso y recomiendo 💄',
  author: 'Angélica Oñate',
  badge: 'Consultora Certificada',
}

export function CatalogClient({ initialProducts, initialCategories }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sort, setSort] = useState('featured')
  const [sortOpen, setSortOpen] = useState(false)

  const filtered = selectedCategory
    ? initialProducts.filter((p) => p.category_id === selectedCategory)
    : initialProducts

  const sorted = sortProducts(filtered, sort)

  return (
    <div>
      {/* Catalog header */}
      <div
        className="flex items-center justify-between mb-0 pb-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 400,
            color: '#1a1a1a',
          }}
        >
          Todo el catálogo
        </h2>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
            style={{ fontSize: 13 }}
          >
            Ordenar: <span className="text-gray-800 font-medium">{SORT_OPTIONS.find(o => o.value === sort)?.label}</span>
            <span style={{ fontSize: 10, marginLeft: 2 }}>▾</span>
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div
                className="absolute right-0 top-full mt-1 z-20 bg-white shadow-lg"
                style={{ minWidth: 160, border: '0.5px solid #e5e7eb', borderRadius: 0 }}
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

      {/* Category filter */}
      {initialCategories.length > 0 && (
        <CategoryFilter
          categories={initialCategories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
      )}

      {/* Product grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p style={{ fontSize: 16 }}>No se encontraron productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {sorted.map((product, i) => (
            <Fragment key={product.id}>
              {/* Editorial card every 8 products */}
              {i > 0 && i % 8 === 0 && (
                <RevealOnScroll delay={0} className="col-span-2">
                  <div
                    className="flex flex-col justify-center"
                    style={{
                      background: 'rgba(233,30,140,0.04)',
                      padding: 24,
                      minHeight: 140,
                    }}
                  >
                    <p
                      className="italic"
                      style={{
                        fontFamily: 'var(--font-editorial)',
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: '#1a1a1a',
                        lineHeight: 1.5,
                        marginBottom: 12,
                      }}
                    >
                      &ldquo;{EDITORIAL_QUOTE.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ fontSize: 13, color: '#1a1a1a' }}>
                        {EDITORIAL_QUOTE.author}
                      </span>
                      <span
                        className="uppercase"
                        style={{
                          fontSize: 9,
                          letterSpacing: '1px',
                          padding: '2px 8px',
                          background: 'var(--brand)',
                          color: 'white',
                          borderRadius: 0,
                        }}
                      >
                        {EDITORIAL_QUOTE.badge}
                      </span>
                    </div>
                  </div>
                </RevealOnScroll>
              )}
              <RevealOnScroll delay={(i % 4) * 0.07}>
                <ProductCard product={product} />
              </RevealOnScroll>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
