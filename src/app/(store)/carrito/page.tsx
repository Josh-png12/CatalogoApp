'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/store/WhatsAppButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/useCart'
import { formatCOP } from '@/lib/utils'
import type { Store, OrderData } from '@/types'
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'

const storeConfig: Store = {
  id: process.env.NEXT_PUBLIC_STORE_ID ?? '',
  slug: process.env.NEXT_PUBLIC_STORE_SLUG ?? 'beauty-angelica',
  name: 'Beauty',
  whatsapp_number: '3154764675',
  primary_color: '#E91E8C',
  logo_url: null,
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const total = totalPrice()
  const isFormValid = name.trim() && address.trim()

  const orderData: OrderData = {
    items,
    customer_name: name,
    customer_phone: phone,
    customer_address: address,
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <p className="text-xl font-medium mb-2">Tu carrito está vacío</p>
          <p className="text-muted-foreground mb-6">Agrega productos para continuar</p>
          <Button onClick={() => router.push('/')} className="bg-pink-500 hover:bg-pink-600 text-white">
            Ver catálogo
          </Button>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Seguir comprando
        </Button>

        <h1 className="text-2xl font-bold mb-6">Finalizar pedido</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Productos seleccionados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, idx) => {
                const key = `${item.product.id}-${item.variant?.id ?? idx}`
                const unitPrice = item.product.price + (item.variant?.price_delta ?? 0)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-sm font-bold mt-0.5">{formatCOP(unitPrice * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeItem(item.product.id, item.variant?.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                )
              })}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total estimado</span>
                <span className="text-pink-500">{formatCOP(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tus datos de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección / Barrio *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Tu dirección o barrio"
                />
              </div>
            </CardContent>
          </Card>

          {isFormValid ? (
            <WhatsAppButton
              orderData={orderData}
              storeConfig={storeConfig}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Completa tu nombre y dirección para continuar
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
