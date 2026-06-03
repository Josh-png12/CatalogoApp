'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/utils'
import { CustomerForm } from '@/components/store/CustomerForm'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.099 1.507 5.829L.057 23.8l6.122-1.428A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.006-1.37l-.36-.214-3.633.952.969-3.542-.235-.374A9.845 9.845 0 012.182 12c0-5.413 4.405-9.818 9.818-9.818 5.413 0 9.818 4.405 9.818 9.818 0 5.414-4.405 9.818-9.818 9.818z"/>
  </svg>
)

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const count = totalItems()
  const total = totalPrice()

  // 4B: total savings across discounted items
  const savings = items.reduce((acc, item) => {
    const orig = item.product.price + (item.variant?.price_delta ?? 0)
    const final = item.final_price ?? orig
    return acc + (orig - final) * item.quantity
  }, 0)

  const GOAL = 200_000
  const progress = Math.min(100, (total / GOAL) * 100)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart() }}>
        <SheetContent side="right" className="flex flex-col w-full sm:w-[420px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-base">
              Mi carrito{' '}
              <span className="text-sm font-normal text-gray-500">({count} items)</span>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 px-6">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <ShoppingCart className="h-16 w-16 opacity-20" />
              </motion.div>
              <p className="text-lg font-medium text-gray-500">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="px-5 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Explorar productos
              </button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((item, idx) => {
                      const key = `${item.product.id}-${item.variant?.id ?? idx}`
                      const primaryImage = item.product.images?.find((i) => i.is_primary) ?? item.product.images?.[0]
                      const unitPrice = item.final_price ?? (item.product.price + (item.variant?.price_delta ?? 0))
                      const originalPrice = item.product.price + (item.variant?.price_delta ?? 0)
                      const hasDiscount = item.final_price != null && item.final_price < originalPrice

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 60 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-3"
                        >
                          <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden"
                            style={{ background: 'var(--warm-100)' }}>
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-1">{item.product.name}</p>
                            {item.variant && (
                              <p className="text-xs text-gray-400">
                                {item.variant.name}: {item.variant.value}
                              </p>
                            )}
                            <div className="mt-0.5">
                              {hasDiscount && (
                                <p className="text-xs text-gray-400 line-through leading-none">{formatCOP(originalPrice)}</p>
                              )}
                              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--brand-600)' }}>
                                {formatCOP(unitPrice)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white transition-colors"
                                style={{ background: 'var(--brand-500)' }}
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-mono w-5 text-center">{item.quantity}</span>
                              <button
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white transition-colors"
                                style={{ background: 'var(--brand-500)' }}
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                className="h-7 w-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-auto"
                                onClick={() => removeItem(item.product.id, item.variant?.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="px-6 pb-6 space-y-3 border-t pt-4" style={{ borderColor: 'var(--brand-100)' }}>
                {/* 4A: progress bar toward $200.000 */}
                {total < GOAL ? (
                  <div>
                    <p className="text-gray-500 mb-1.5" style={{ fontSize: 11 }}>
                      Te faltan <strong>{formatCOP(GOAL - total)}</strong> para un pedido especial 🎁
                    </p>
                    <div style={{ height: 4, background: '#f0ede8', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: '#22c55e',
                          transition: 'width 600ms ease',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="font-medium" style={{ fontSize: 12, color: '#16a34a' }}>
                    🎉 ¡Pedido especial desbloqueado!
                  </p>
                )}

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-500">Total estimado</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--brand-600)' }}>
                    {formatCOP(total)}
                  </span>
                </div>

                {/* 4B: savings summary */}
                {savings > 0 && (
                  <p className="font-medium" style={{ fontSize: 12, color: '#16a34a' }}>
                    Ahorras: {formatCOP(savings)} en este pedido 💰
                  </p>
                )}

                <button
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Vaciar carrito
                </button>

                {/* 4C: urgency WA button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex flex-col items-center justify-center gap-0.5 py-3 text-white font-semibold rounded-xl"
                  style={{ background: '#25D366' }}
                  onClick={() => setShowCustomerForm(true)}
                >
                  <span className="flex items-center gap-2 text-base">
                    <WhatsAppIcon />
                    Pedir ahora por WhatsApp 🛍️
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 400 }}>
                    Respuesta en menos de 1 hora
                  </span>
                </motion.button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CustomerForm
        open={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
      />
    </>
  )
}
