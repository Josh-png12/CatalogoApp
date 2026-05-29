'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { PromotionForm } from '@/components/admin/PromotionForm'
import { formatCOP } from '@/lib/utils'
import type { Promotion } from '@/types'

interface SimpleProduct {
  id: string
  name: string
  price: number
  images?: Array<{ url: string; is_primary: boolean }>
}

interface PromotionWithProduct extends Promotion {
  product?: SimpleProduct
}

interface PromotionListProps {
  initialPromotions: PromotionWithProduct[]
  products: SimpleProduct[]
  storeId: string
  now: string
}

function isActive(promo: Promotion, now: string): boolean {
  return promo.active && (!promo.ends_at || promo.ends_at > now)
}

function DiscountCell({ promo, product }: { promo: Promotion; product?: SimpleProduct }) {
  if (!product) return <span className="text-muted-foreground">—</span>
  const finalPrice =
    promo.discount_type === 'percentage'
      ? Math.round(product.price - (product.price * promo.discount_value) / 100)
      : Math.max(product.price - promo.discount_value, 0)
  const discountText =
    promo.discount_type === 'percentage'
      ? `${promo.discount_value}%`
      : formatCOP(promo.discount_value)

  return (
    <div>
      <span
        className="font-bold text-sm"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #E91E8C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        -{discountText}
      </span>
      <div className="text-xs text-muted-foreground">
        <span className="line-through">{formatCOP(product.price)}</span>
        {' → '}
        <span className="font-medium" style={{ color: 'var(--brand-600)' }}>{formatCOP(finalPrice)}</span>
      </div>
    </div>
  )
}

export function PromotionList({ initialPromotions, products, storeId, now }: PromotionListProps) {
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<PromotionWithProduct[]>(initialPromotions)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [showExpired, setShowExpired] = useState(false)

  const active = promotions.filter((p) => isActive(p, now))
  const expired = promotions.filter((p) => !isActive(p, now)).slice(0, 5)

  const refresh = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('promotions')
      .select('*, product:products(id, name, price, images:product_images(url, is_primary))')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    if (data) setPromotions(data as unknown as PromotionWithProduct[])
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta promoción?')) return
    const supabase = createClient()
    const { error } = await supabase.from('promotions').delete().eq('id', id)
    if (error) { toast('Error al eliminar', 'error'); return }
    toast('Promoción eliminada')
    refresh()
  }

  const handleReactivate = async (promo: Promotion) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('promotions')
      .update({ active: true, ends_at: null })
      .eq('id', promo.id)
    if (error) { toast('Error al reactivar', 'error'); return }
    toast('Promoción reactivada')
    refresh()
  }

  const PromoRow = ({ promo, expired: exp }: { promo: PromotionWithProduct; expired?: boolean }) => {
    const img = promo.product?.images?.find((i) => i.is_primary) ?? promo.product?.images?.[0]
    return (
      <tr className={`border-b last:border-0 ${exp ? 'opacity-60' : ''}`}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--warm-100)' }}>
              {img ? (
                <Image src={img.url} alt={promo.product?.name ?? ''} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">💄</div>
              )}
            </div>
            <span className="text-sm font-medium line-clamp-1">{promo.product?.name ?? promo.product_id}</span>
          </div>
        </td>
        <td className="py-3 px-4 text-sm">{promo.label}</td>
        <td className="py-3 px-4">
          <DiscountCell promo={promo} product={promo.product} />
        </td>
        <td className="py-3 px-4 text-xs text-muted-foreground">
          <div>{new Date(promo.starts_at).toLocaleDateString('es-CO')}</div>
          <div>{promo.ends_at ? new Date(promo.ends_at).toLocaleDateString('es-CO') : 'Sin venc.'}</div>
        </td>
        <td className="py-3 px-4">
          {isActive(promo, now) ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Activa</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Vencida</Badge>
          )}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            {exp ? (
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Reactivar" onClick={() => handleReactivate(promo)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(promo); setFormOpen(true) }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(promo.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  const TableHeader = () => (
    <thead>
      <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
        <th className="py-2 px-4 text-left font-medium">Producto</th>
        <th className="py-2 px-4 text-left font-medium">Label</th>
        <th className="py-2 px-4 text-left font-medium">Descuento</th>
        <th className="py-2 px-4 text-left font-medium">Fechas</th>
        <th className="py-2 px-4 text-left font-medium">Estado</th>
        <th className="py-2 px-4 text-left font-medium">Acciones</th>
      </tr>
    </thead>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promociones</h1>
          <p className="text-sm text-muted-foreground">Las promociones vencidas se desactivan automáticamente.</p>
        </div>
        <Button
          className="gap-2 text-white"
          style={{ backgroundColor: 'var(--brand-500)' }}
          onClick={() => { setEditing(null); setFormOpen(true) }}
        >
          <Plus className="h-4 w-4" />
          Nueva promoción
        </Button>
      </div>

      {/* Active promotions table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {active.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-medium">No hay promociones activas</p>
            <p className="text-sm mt-1">Crea una para empezar a atraer clientas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <TableHeader />
              <tbody>
                {active.map((p) => <PromoRow key={p.id} promo={p} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expired promotions */}
      {expired.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <button
            onClick={() => setShowExpired(!showExpired)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-gray-50 transition-colors"
          >
            <span>Promociones vencidas (últimas {expired.length})</span>
            {showExpired ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showExpired && (
            <div className="border-t overflow-x-auto">
              <table className="w-full">
                <TableHeader />
                <tbody>
                  {expired.map((p) => <PromoRow key={p.id} promo={p} expired />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null) } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar promoción' : 'Nueva promoción'}</DialogTitle>
          </DialogHeader>
          <PromotionForm
            products={products}
            existingPromo={editing}
            onSaved={() => { setFormOpen(false); setEditing(null); refresh() }}
            onCancel={() => { setFormOpen(false); setEditing(null) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
