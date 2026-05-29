'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Product } from '@/types'

interface InventoryEntryFormProps {
  storeId: string
  preselectedProductId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const ADJUSTMENT_REASONS = ['Conteo físico', 'Producto dañado', 'Merma', 'Otro']

export function InventoryEntryForm({ storeId, preselectedProductId, open, onOpenChange, onSaved }: InventoryEntryFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState(preselectedProductId ?? '')
  const [type, setType] = useState<'entry' | 'adjustment'>('entry')
  const [quantity, setQuantity] = useState(1)
  const [unitCost, setUnitCost] = useState('')
  const [reason, setReason] = useState('Conteo físico')
  const [notes, setNotes] = useState('')

  const fetchProducts = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('id, name, stock, price')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('name')
    setProducts((data as Product[]) ?? [])
  }, [storeId])

  useEffect(() => {
    if (open) {
      fetchProducts()
      setProductId(preselectedProductId ?? '')
      setType('entry')
      setQuantity(1)
      setUnitCost('')
      setReason('Conteo físico')
      setNotes('')
    }
  }, [open, preselectedProductId, fetchProducts])

  const selectedProduct = products.find((p) => p.id === productId)
  const currentStock = selectedProduct?.stock ?? 0
  const newStock = type === 'entry' ? currentStock + quantity : Math.max(0, currentStock + quantity)

  const handleSave = async () => {
    if (!productId) { toast('Selecciona un producto', 'error'); return }
    if (quantity <= 0) { toast('La cantidad debe ser mayor a 0', 'error'); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const finalNewStock = type === 'entry' ? currentStock + quantity : newStock
      const { error: movError } = await supabase.from('inventory_movements').insert({
        store_id: storeId,
        product_id: productId,
        type,
        quantity,
        unit_cost: unitCost ? Number(unitCost) : null,
        previous_stock: currentStock,
        new_stock: finalNewStock,
        reason: type === 'adjustment' ? reason : null,
        notes: notes || null,
      })
      if (movError) throw movError

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: finalNewStock })
        .eq('id', productId)
      if (stockError) throw stockError

      toast('Movimiento registrado', 'success')
      onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Registrar movimiento</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-4 mt-2">
          {/* Product select */}
          <div className="space-y-1">
            <Label>Producto *</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo de movimiento</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'entry' as const, label: 'Entrada de mercancía', emoji: '📦' },
                { value: 'adjustment' as const, label: 'Ajuste manual', emoji: '✏️' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all text-center"
                  style={
                    type === t.value
                      ? { borderColor: '#E91E8C', background: '#FDF2F8', color: '#E91E8C' }
                      : { borderColor: '#E8E6DF', color: '#374151' }
                  }
                >
                  <span className="text-lg">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <Label>Cantidad *</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </div>

          {/* Unit cost (entry only) */}
          {type === 'entry' && (
            <div className="space-y-1">
              <Label>Costo unitario (opcional, COP)</Label>
              <Input
                type="number"
                min={0}
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          {/* Reason (adjustment only) */}
          {type === 'adjustment' && (
            <div className="space-y-1">
              <Label>Razón del ajuste</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {ADJUSTMENT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notas (opcional)</Label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones..."
            />
          </div>

          {/* Preview */}
          {selectedProduct && (
            <div
              className="rounded-xl p-3 text-sm space-y-1"
              style={{ background: '#F0FDF4', color: '#16A34A' }}
            >
              <p className="font-semibold">Vista previa</p>
              <p>
                Stock actual: <strong>{currentStock}</strong> → Stock nuevo: <strong>{newStock}</strong>
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full text-white"
            style={{ background: '#E91E8C' }}
          >
            {saving ? 'Guardando...' : 'Registrar movimiento'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
