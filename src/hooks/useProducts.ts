'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, Promotion } from '@/types'

interface UseProductsOptions {
  categoryId?: string
  featured?: boolean
  storeId?: string
}

function mergePromos(products: Product[], promos: Promotion[]): Product[] {
  const now = new Date().toISOString()
  const active = promos.filter((p) => p.active && (!p.ends_at || p.ends_at > now))
  const promoMap = new Map(active.map((p) => [p.product_id, p]))

  return products.map((product) => {
    const promo = promoMap.get(product.id)
    if (!promo) return product
    const finalPrice =
      promo.discount_type === 'percentage'
        ? Math.round(product.price - (product.price * promo.discount_value) / 100)
        : Math.max(product.price - promo.discount_value, 0)
    return {
      ...product,
      promo_id: promo.id,
      promo_label: promo.label,
      promo_discount_type: promo.discount_type,
      promo_discount_value: promo.discount_value,
      promo_ends_at: promo.ends_at,
      final_price: finalPrice,
    }
  })
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const storeId = options.storeId ?? process.env.NEXT_PUBLIC_STORE_ID

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      let query = supabase
        .from('products')
        .select('*, images:product_images(*), variants(*), category:categories(*)')
        .eq('store_id', storeId!)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (options.categoryId) query = query.eq('category_id', options.categoryId)
      if (options.featured !== undefined) query = query.eq('featured', options.featured)

      const [{ data: productsData, error: productsErr }, { data: promosData }] = await Promise.all([
        query,
        supabase
          .from('promotions')
          .select('*')
          .eq('store_id', storeId!)
          .eq('active', true),
      ])

      if (productsErr) {
        setError(productsErr.message)
      } else {
        const merged = mergePromos(
          (productsData ?? []) as unknown as Product[],
          (promosData ?? []) as unknown as Promotion[]
        )
        setProducts(merged)
      }
      setLoading(false)
    }

    if (storeId) fetchProducts()
  }, [storeId, options.categoryId, options.featured])

  return { products, loading, error }
}
