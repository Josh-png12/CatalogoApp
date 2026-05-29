'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { PromoBadge } from '@/components/store/PromoBadge'
import { formatCOP } from '@/lib/utils'
import type { Promotion } from '@/types'

interface SimpleProduct {
  id: string
  name: string
  price: number
}

interface PromotionFormProps {
  products: SimpleProduct[]
  existingPromo?: Promotion | null
  onSaved: () => void
  onCancel: () => void
}

export function PromotionForm({ products, existingPromo, onSaved, onCancel }: PromotionFormProps) {
  const { toast } = useToast()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const [productId,     setProductId]     = useState(existingPromo?.product_id ?? '')
  const [label,         setLabel]         = useState(existingPromo?.label ?? 'Oferta')
  const [discountType,  setDiscountType]  = useState<'percentage' | 'fixed'>(existingPromo?.discount_type ?? 'percentage')
  const [discountValue, setDiscountValue] = useState(existingPromo?.discount_value?.toString() ?? '')
  const [startsAt,      setStartsAt]      = useState(
    existingPromo?.starts_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)
  )
  const [noExpiry,  setNoExpiry]  = useState(!existingPromo?.ends_at)
  const [endsAt,    setEndsAt]    = useState(existingPromo?.ends_at?.slice(0, 10) ?? '')
  const [saving,    setSaving]    = useState(false)

  const selectedProduct = products.find((p) => p.id === productId)
  const discountNum = parseFloat(discountValue) || 0

  let finalPrice: number | null = null
  if (selectedProduct && discountNum > 0) {
    finalPrice =
      discountType === 'percentage'
        ? Math.round(selectedProduct.price - (selectedProduct.price * discountNum) / 100)
        : Math.max(selectedProduct.price - discountNum, 0)
  }

  const discountText =
    discountType === 'percentage'
      ? `-${discountNum}%`
      : discountNum > 0
      ? `-${formatCOP(discountNum)}`
      : ''

  const handleSave = async () => {
    if (!productId) { toast('Selecciona un producto', 'error'); return }
    if (!label.trim()) { toast('Ingresa un label para la promo', 'error'); return }
    if (!discountNum || discountNum <= 0) { toast('El descuento debe ser mayor a 0', 'error'); return }
    if (finalPrice !== null && finalPrice <= 0) { toast('El precio final no puede ser cero o negativo', 'error'); return }

    setSaving(true)
    const supabase = createClient()

    // If creating (not editing), check for existing promo on this product
    if (!existingPromo) {
      const { data: existing } = await supabase
        .from('promotions')
        .select('id')
        .eq('store_id', storeId)
        .eq('product_id', productId)
        .single()

      if (existing) {
        const ok = window.confirm('Este producto ya tiene una promo activa. ¿Reemplazarla?')
        if (!ok) { setSaving(false); return }
        await supabase.from('promotions').delete().eq('id', existing.id)
      }
    }

    const payload = {
      store_id: storeId,
      product_id: productId,
      label: label.trim(),
      discount_type: discountType,
      discount_value: discountNum,
      starts_at: new Date(startsAt + 'T00:00:00').toISOString(),
      ends_at: noExpiry || !endsAt ? null : new Date(endsAt + 'T23:59:59').toISOString(),
      active: true,
    }

    const { error } = existingPromo
      ? await supabase.from('promotions').update(payload).eq('id', existingPromo.id)
      : await supabase.from('promotions').insert(payload)

    setSaving(false)
    if (error) { toast('Error: ' + error.message, 'error'); return }
    toast('Promoción guardada')
    onSaved()
  }

  return (
    <div className="space-y-5">
      {/* Product select */}
      <div className="space-y-1.5">
        <Label htmlFor="promo-product">Producto *</Label>
        <select
          id="promo-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">-- Selecciona un producto --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {formatCOP(p.price)}
            </option>
          ))}
        </select>
        {selectedProduct && (
          <p className="text-xs text-muted-foreground">
            Precio actual: {formatCOP(selectedProduct.price)}
          </p>
        )}
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label htmlFor="promo-label">Label de la promo *</Label>
        <Input
          id="promo-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Oferta de temporada, Liquidación, 2x1..."
        />
      </div>

      {/* Discount type */}
      <div className="space-y-1.5">
        <Label>Tipo de descuento *</Label>
        <div className="flex gap-4">
          {(['percentage', 'fixed'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={discountType === type}
                onChange={() => setDiscountType(type)}
                className="accent-[var(--brand-500)]"
              />
              <span className="text-sm">{type === 'percentage' ? 'Porcentaje (%)' : 'Monto fijo ($)'}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount value */}
      <div className="space-y-1.5">
        <Label htmlFor="promo-value">
          Valor del descuento *{' '}
          <span className="text-muted-foreground font-normal">
            {discountType === 'percentage' ? '(%)' : '($)'}
          </span>
        </Label>
        <Input
          id="promo-value"
          type="number"
          min="0"
          max={discountType === 'percentage' ? '100' : undefined}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === 'percentage' ? '20' : '10000'}
        />
        {selectedProduct && discountNum > 0 && (
          <p className="text-xs">
            {discountType === 'percentage'
              ? `= ${formatCOP((selectedProduct.price * discountNum) / 100)} de descuento`
              : null}
            {finalPrice !== null && finalPrice > 0 && (
              <span className="font-medium" style={{ color: 'var(--brand-600)' }}>
                {' '}→ Precio final: {formatCOP(finalPrice)}
              </span>
            )}
            {finalPrice !== null && finalPrice <= 0 && (
              <span className="text-red-500"> Precio inválido</span>
            )}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="starts-at">Inicia</Label>
          <Input id="starts-at" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ends-at">Vence</Label>
          <Input
            id="ends-at"
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            disabled={noExpiry}
            className={noExpiry ? 'opacity-40' : ''}
          />
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={noExpiry}
              onChange={(e) => setNoExpiry(e.target.checked)}
              className="accent-[var(--brand-500)]"
            />
            <span className="text-xs text-muted-foreground">Sin fecha de vencimiento</span>
          </label>
        </div>
      </div>

      {/* Badge preview */}
      {discountText && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Vista previa del badge</Label>
          <div className="p-3 rounded-lg border inline-flex">
            <PromoBadge
              label={label || 'Oferta'}
              discountText={discountText}
              endsAt={noExpiry ? undefined : endsAt ? new Date(endsAt + 'T23:59:59').toISOString() : undefined}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 text-white"
          style={{ backgroundColor: 'var(--brand-500)' }}
        >
          {saving ? 'Guardando...' : existingPromo ? 'Actualizar' : 'Crear promoción'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
