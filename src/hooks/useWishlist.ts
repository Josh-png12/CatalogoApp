'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface WishlistState {
  items: Product[]
  toggleWishlist: (product: Product) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  totalItems: () => number
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.find((p) => p.id === product.id)
          return {
            items: exists
              ? state.items.filter((p) => p.id !== product.id)
              : [...state.items, product],
          }
        })
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (productId) => get().items.some((p) => p.id === productId),

      totalItems: () => get().items.length,
    }),
    {
      name: 'beauty-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
