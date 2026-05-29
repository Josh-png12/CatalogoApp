'use client'

import { useEffect, useRef } from 'react'
import { ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useCart } from '@/hooks/useCart'

export function FloatingCartButton() {
  const { openCart, totalItems, isOpen } = useCart()
  const count = totalItems()
  const prevCount = useRef(count)
  const controls = useAnimation()

  useEffect(() => {
    if (count > prevCount.current) {
      controls.start({ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.4 } })
    }
    prevCount.current = count
  }, [count, controls])

  return (
    <AnimatePresence>
      {!isOpen && count > 0 && (
        <motion.button
          key="floating-cart"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onClick={openCart}
          className="md:hidden fixed bottom-6 right-4 z-40 rounded-full text-white flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            background: '#E91E8C',
            boxShadow: '0 4px 20px rgba(233,30,140,0.4)',
          }}
          aria-label="Abrir carrito"
        >
          <motion.span animate={controls}>
            <ShoppingBag className="h-5 w-5" />
          </motion.span>

          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-white font-bold"
            style={{ fontSize: 10, background: '#1a1a1a' }}
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
