'use client'

import Image from 'next/image'
import { Heart, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWishlist } from '@/hooks/useWishlist'
import { useCart } from '@/hooks/useCart'
import { useStoreConfig } from '@/context/StoreConfigContext'
import { formatCOP, getEffectivePrice } from '@/lib/utils'
import { useToastStore } from '@/components/ui/toaster'

interface Props {
  open: boolean
  onClose: () => void
}

export function WishlistDrawer({ open, onClose }: Props) {
  const { items, toggleWishlist, clearWishlist, totalItems } = useWishlist()
  const { addItem, openCart } = useCart()
  const config = useStoreConfig()
  const toast = useToastStore((s) => s.toast)
  const count = totalItems()

  const handleAddAll = () => {
    items.forEach((p) => addItem(p))
    clearWishlist()
    onClose()
    openCart()
  }

  const handleShareWhatsApp = () => {
    if (!config.whatsapp_number) return
    const lines = items
      .map((p) => `• ${p.name} - ${formatCOP(getEffectivePrice(p))}`)
      .join('\n')
    const msg = encodeURIComponent(
      `Hola ${config.consultant_name ?? 'Angélica'}! Esta es mi lista de productos que me interesan 💄\n\n${lines}\n\n¿Cuáles tienes disponibles? 😊`
    )
    window.open(`https://wa.me/${config.whatsapp_number}?text=${msg}`, '_blank')
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="flex flex-col w-full sm:w-[420px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" style={{ color: 'var(--brand)' }} />
            Mi lista de deseos
            <span className="text-sm font-normal text-gray-400">({count} items)</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 px-6">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Heart className="h-16 w-16 opacity-15" />
            </motion.div>
            <p className="font-medium text-gray-500" style={{ fontSize: 16 }}>
              Aún no has guardado productos
            </p>
            <p className="text-center" style={{ fontSize: 13 }}>
              Toca el ♥ en cualquier producto para guardarlo
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                <AnimatePresence initial={false}>
                  {items.map((product) => {
                    const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
                    const price = getEffectivePrice(product)
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 items-center"
                      >
                        <div
                          className="relative w-16 h-16 flex-shrink-0 overflow-hidden"
                          style={{ borderRadius: 8, background: 'var(--cream)' }}
                        >
                          {img ? (
                            <Image src={img.url} alt={product.name} fill className="object-cover" sizes="64px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--brand)' }}>
                            {formatCOP(price)}
                          </p>
                          <button
                            onClick={() => { addItem(product) }}
                            className="flex items-center gap-1 mt-1 transition-colors hover:opacity-70"
                            style={{ fontSize: 11, color: '#6b7280' }}
                          >
                            <ShoppingBag className="h-3 w-3" />
                            Agregar al carrito
                          </button>
                        </div>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="px-6 pb-6 pt-4 border-t space-y-3" style={{ borderColor: 'var(--brand-100)' }}>
              <button
                onClick={handleAddAll}
                className="w-full font-medium uppercase transition-all"
                style={{
                  fontSize: 12,
                  letterSpacing: '1px',
                  padding: '13px 0',
                  background: 'var(--brand)',
                  color: 'white',
                  borderRadius: 0,
                }}
              >
                <ShoppingBag className="inline h-3.5 w-3.5 mr-2" />
                Agregar todo al carrito
              </button>
              {config.whatsapp_number && (
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full font-medium uppercase transition-all"
                  style={{
                    fontSize: 12,
                    letterSpacing: '1px',
                    padding: '13px 0',
                    background: '#25D366',
                    color: 'white',
                    borderRadius: 0,
                  }}
                >
                  ♥ Enviar wishlist por WhatsApp
                </button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
