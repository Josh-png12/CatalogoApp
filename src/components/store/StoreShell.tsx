'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { SearchOverlay } from '@/components/store/SearchOverlay'
import { WishlistDrawer } from '@/components/store/WishlistDrawer'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

export function StoreShell() {
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [products,     setProducts]     = useState<Product[]>([])

  useEffect(() => {
    const storeId = process.env.NEXT_PUBLIC_STORE_ID!
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, images:product_images(*), variants(*), category:categories(*)')
      .eq('store_id', storeId)
      .eq('active', true)
      .then(({ data }) => { if (data) setProducts(data as unknown as Product[]) })
  }, [])

  return (
    <>
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
      />
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
      />
    </>
  )
}
