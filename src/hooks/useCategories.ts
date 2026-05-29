'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

export function useCategories(storeId?: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resolvedStoreId = storeId ?? process.env.NEXT_PUBLIC_STORE_ID

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true)
      const supabase = createClient()

      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', resolvedStoreId!)
        .order('sort_order', { ascending: true })

      if (err) {
        setError(err.message)
      } else {
        setCategories(data ?? [])
      }
      setLoading(false)
    }

    if (resolvedStoreId) {
      fetchCategories()
    }
  }, [resolvedStoreId])

  return { categories, loading, error }
}
