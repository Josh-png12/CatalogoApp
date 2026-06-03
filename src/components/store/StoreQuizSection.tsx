'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { SkinQuiz } from '@/components/store/SkinQuiz'
import { ProductCard } from '@/components/store/ProductCard'
import type { QuizProfile } from '@/components/store/SkinQuiz'
import type { Product } from '@/types'

export function StoreQuizSection({ products }: { products: Product[] }) {
  const [results, setResults]   = useState<Product[] | null>(null)
  const [profile, setProfile]   = useState<QuizProfile | null>(null)
  const resultsRef              = useRef<HTMLDivElement>(null)

  // Scroll to results section when they appear
  useEffect(() => {
    if (results && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 400)
    }
  }, [results])

  const handleResults = (recommended: Product[], quizProfile: QuizProfile) => {
    setResults(recommended)
    setProfile(quizProfile)
  }

  const clearResults = () => {
    setResults(null)
    setProfile(null)
  }

  return (
    <>
      <SkinQuiz products={products} onResults={handleResults} />

      <AnimatePresence>
        {results && (
          <motion.section
            ref={resultsRef}
            key="quiz-results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <h2
                  className="text-gray-900 mb-3"
                  style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 400 }}
                >
                  Productos recomendados para tu perfil ✨
                </h2>
                {profile && (
                  <div
                    className="inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--brand-light)', fontSize: 12, color: 'var(--brand)' }}
                  >
                    <span>Tono {profile.tone}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>Piel {profile.skinType}</span>
                    {profile.concerns.length > 0 && (
                      <>
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span>{profile.concerns.join(', ')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={clearResults}
                className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors self-start"
                style={{ fontSize: 13, flexShrink: 0 }}
              >
                <X className="h-4 w-4" />
                Ver todo el catálogo
              </button>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* CTA bar */}
            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg"
              style={{ background: 'var(--brand-light)' }}
            >
              <p className="text-gray-600" style={{ fontSize: 13 }}>
                ¿No encuentras lo que buscas? Angélica puede ayudarte a elegir el producto perfecto.
              </p>
              <button
                onClick={clearResults}
                className="whitespace-nowrap font-medium uppercase transition-opacity hover:opacity-70"
                style={{ fontSize: 11, letterSpacing: '1px', color: 'var(--brand)', flexShrink: 0 }}
              >
                Ver todo el catálogo →
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
