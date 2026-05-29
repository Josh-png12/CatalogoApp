'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatCOP } from '@/lib/utils'
import { Plus, Minus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product, SaleItem } from '@/types'

interface SaleFormProps {
  storeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const CHANNELS = [
  { value: 'presencial', label: 'Presencial', emoji: '🏪' },
  { value: 'whatsapp',   label: 'WhatsApp',   emoji: '💬' },
  { value: 'catalogo',   label: 'Catálogo',   emoji: '📖' },
  { value: 'feria',      label: 'Feria',      emoji: '🎪' },
  { value: 'referido',   label: 'Referido',   emoji: '🤝' },
]

const PAYMENT_METHODS = [
  { value: 'efectivo',        label: 'Efectivo',        emoji: '💵' },
  { value: 'nequi',           label: 'Nequi',           emoji: '📱' },
  { value: 'daviplata',       label: 'Daviplata',       emoji: '💳' },
  { value: 'transferencia',   label: 'Transferencia',   emoji: '🏦' },
  { value: 'contra_entrega',  label: 'Contra entrega',  emoji: '📦' },
]

export function SaleForm({ storeId, open, onOpenChange, onSaved }: SaleFormProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')

  // Step 1 fields
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [channel, setChannel] = useState('presencial')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10))

  // Step 2 fields
  const [cartItems, setCartItems] = useState<SaleItem[]>([])
  const [discount, setDiscount] = useState(0)

  // Step 3 fields
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [paymentReceived, setPaymentReceived] = useState(false)
  const [notes, setNotes] = useState('')

  const subtotal = cartItems.reduce((s, i) => s + i.total, 0)
  const total = Math.max(0, subtotal - discount)

  const fetchProducts = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('name')
    setProducts((data as Product[]) ?? [])
  }, [storeId])

  useEffect(() => {
    if (open) fetchProducts()
  }, [open, fetchProducts])

  const resetForm = () => {
    setStep(1)
    setCustomerName('')
    setCustomerPhone('')
    setChannel('presencial')
    setSaleDate(new Date().toISOString().slice(0, 10))
    setCartItems([])
    setDiscount(0)
    setPaymentMethod('efectivo')
    setPaymentReceived(false)
    setNotes('')
    setProductSearch('')
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) resetForm()
    onOpenChange(o)
  }

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price }
            : i
        )
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          total: product.price,
        },
      ]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.product_id !== productId) return i
          const qty = Math.max(1, i.quantity + delta)
          return { ...i, quantity: qty, total: qty * i.unit_price }
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product_id !== productId))
  }

  const handleSubmit = async () => {
    if (!customerName.trim()) { toast('Ingresa el nombre del cliente', 'error'); return }
    if (cartItems.length === 0) { toast('Agrega al menos un producto', 'error'); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error: saleError } = await supabase.from('sales').insert({
        store_id: storeId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone || null,
        channel,
        items: cartItems,
        subtotal,
        discount,
        total,
        payment_method: paymentMethod,
        payment_received: paymentReceived,
        payment_received_at: paymentReceived ? new Date().toISOString() : null,
        status: 'confirmed',
        notes: notes || null,
        sale_date: saleDate,
      })
      if (saleError) throw saleError

      // Update stock for each product
      await Promise.all(
        cartItems.map(async (item) => {
          const prod = products.find((p) => p.id === item.product_id)
          if (!prod) return
          const newStock = Math.max(0, (prod.stock ?? 0) - item.quantity)
          await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id)
        })
      )

      toast('Venta registrada exitosamente', 'success')
      onSaved()
      handleOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar venta'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[560px] flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle>Registrar venta</SheetTitle>
          {/* Steps indicator */}
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    s === step
                      ? { background: '#E91E8C', color: '#fff' }
                      : s < step
                      ? { background: '#10B981', color: '#fff' }
                      : { background: '#E5E7EB', color: '#6B7280' }
                  }
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 3 && <div className="h-0.5 w-8 rounded-full" style={{ background: s < step ? '#10B981' : '#E5E7EB' }} />}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {step === 1 ? 'Cliente' : step === 2 ? 'Productos' : 'Pago'}
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="space-y-1">
                <Label>Nombre del cliente</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre completo" />
              </div>
              <div className="space-y-1">
                <Label>Teléfono (opcional)</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Ej: 3001234567" />
              </div>
              <div className="space-y-2">
                <Label>Canal de venta</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setChannel(c.value)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all"
                      style={
                        channel === c.value
                          ? { borderColor: '#E91E8C', background: '#FDF2F8', color: '#E91E8C' }
                          : { borderColor: '#E8E6DF', color: '#374151' }
                      }
                    >
                      <span className="text-lg">{c.emoji}</span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Fecha de venta</Label>
                <Input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="space-y-1">
                <Label>Buscar producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Nombre del producto..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Product list */}
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border" style={{ borderColor: '#E8E6DF' }}>
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 text-center">Sin resultados</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <span className="text-xs" style={{ color: '#E91E8C' }}>{formatCOP(p.price)}</span>
                    </button>
                  ))
                )}
              </div>

              <Separator />

              {/* Cart */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Productos agregados</p>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Agrega productos de la lista</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">{formatCOP(item.unit_price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.product_id, -1)}
                          className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          style={{ borderColor: '#E8E6DF' }}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product_id, 1)}
                          className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-gray-100"
                          style={{ borderColor: '#E8E6DF' }}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold w-20 text-right" style={{ color: '#E91E8C' }}>
                        {formatCOP(item.total)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-400 hover:text-red-600 text-xs ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Discount + totals */}
              <div className="space-y-1">
                <Label>Descuento (COP)</Label>
                <Input
                  type="number"
                  min={0}
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="rounded-xl bg-gray-50 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Descuento</span>
                  <span>-{formatCOP(discount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span style={{ color: '#E91E8C' }}>{formatCOP(total)}</span>
                </div>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() => setPaymentMethod(pm.value)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all"
                      style={
                        paymentMethod === pm.value
                          ? { borderColor: '#E91E8C', background: '#FDF2F8', color: '#E91E8C' }
                          : { borderColor: '#E8E6DF', color: '#374151' }
                      }
                    >
                      <span className="text-lg">{pm.emoji}</span>
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPaymentReceived((v) => !v)}
                className="w-full flex items-center justify-between p-3 rounded-xl border transition-all"
                style={
                  paymentReceived
                    ? { borderColor: '#10B981', background: '#F0FDF4' }
                    : { borderColor: '#E8E6DF', background: '#fff' }
                }
              >
                <span className="text-sm font-medium">¿Ya recibiste el pago?</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={
                    paymentReceived
                      ? { background: '#10B981', color: '#fff' }
                      : { background: '#E5E7EB', color: '#6B7280' }
                  }
                >
                  {paymentReceived ? 'Sí' : 'No'}
                </span>
              </button>

              <div className="space-y-1">
                <Label>Notas (opcional)</Label>
                <textarea
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones, instrucciones de entrega..."
                />
              </div>

              {/* Summary */}
              <div className="rounded-xl border p-3 space-y-1 text-sm bg-gray-50" style={{ borderColor: '#E8E6DF' }}>
                <p className="font-semibold text-gray-800">Resumen</p>
                <div className="flex justify-between text-gray-600"><span>Cliente</span><span>{customerName}</span></div>
                <div className="flex justify-between text-gray-600"><span>Canal</span><span className="capitalize">{channel}</span></div>
                <div className="flex justify-between text-gray-600"><span>Productos</span><span>{cartItems.length}</span></div>
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span style={{ color: '#E91E8C' }}>{formatCOP(total)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-4 pb-4 pt-2 border-t flex gap-2" style={{ borderColor: '#E8E6DF' }}>
          {step > 1 && (
            <Button variant="outline" className="gap-1" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
          )}
          {step < 3 ? (
            <Button
              className="flex-1 gap-1 text-white"
              style={{ background: '#E91E8C' }}
              onClick={() => {
                if (step === 1 && !customerName.trim()) { toast('Ingresa el nombre del cliente', 'error'); return }
                setStep((s) => s + 1)
              }}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="flex-1 text-white"
              style={{ background: '#E91E8C' }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Registrando...' : 'Registrar venta'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
