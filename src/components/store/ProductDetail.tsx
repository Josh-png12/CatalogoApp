'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/utils'
import type { Product, Variant } from '@/types'

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>()
  const [activeImage, setActiveImage] = useState(
    () => Math.max(0, product.images?.findIndex((i) => i.is_primary) ?? 0)
  )

  const unitPrice = product.price + (selectedVariant?.price_delta ?? 0)

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.images?.[activeImage] ? (
              <Image
                src={product.images[activeImage].url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, #FCE4F3, #F9C2E6)' }}>
                💄
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    idx === activeImage ? 'border-pink-500' : 'border-transparent'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {product.category && (
            <Badge variant="secondary">{product.category.name}</Badge>
          )}
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-pink-500">{formatCOP(unitPrice)}</p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {product.variants?.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Opciones:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() =>
                      setSelectedVariant(selectedVariant?.id === variant.id ? undefined : variant)
                    }
                    className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-border hover:border-pink-300'
                    }`}
                  >
                    {variant.value}
                    {variant.price_delta !== 0 && (
                      <span className="text-xs ml-1 opacity-70">
                        {variant.price_delta > 0 ? '+' : ''}
                        {formatCOP(variant.price_delta)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-base"
            onClick={() => addItem(product, selectedVariant)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </main>
  )
}
