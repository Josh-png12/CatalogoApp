'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import { formatCOP } from '@/lib/utils'
import type { Order, CartItem } from '@/types'

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pendiente',   bg: '#FEF3C7', color: '#92400E' },
  confirmed: { label: 'Confirmado',  bg: '#DBEAFE', color: '#1E40AF' },
  delivered: { label: 'Entregado',   bg: '#D1FAE5', color: '#065F46' },
  cancelled: { label: 'Cancelado',   bg: '#FEE2E2', color: '#991B1B' },
}

const STATUS_OPTIONS = [
  { value: 'all',       label: 'Todos'       },
  { value: 'pending',   label: 'Pendientes'  },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'delivered', label: 'Entregados'  },
  { value: 'cancelled', label: 'Cancelados'  },
]

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  const h = Math.floor(min / 60)
  const d = Math.floor(h / 24)
  if (min < 60) return `hace ${min}min`
  if (h < 24)   return `hace ${h}h`
  if (d < 7)    return `hace ${d}d`
  return new Date(dateStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

function parseItems(raw: Order['items']): CartItem[] {
  try {
    if (typeof raw === 'string') return JSON.parse(raw)
    if (Array.isArray(raw)) return raw as CartItem[]
    return []
  } catch { return [] }
}

interface OrderDetailProps {
  order: Order
  onClose: () => void
  storeWhatsapp: string
}

function OrderDetail({ order, onClose, storeWhatsapp }: OrderDetailProps) {
  const items = parseItems(order.items)

  const waHref = order.customer_phone
    ? `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customer_name ?? ''}, te llamo por tu pedido.`)}`
    : storeWhatsapp
      ? `https://wa.me/${storeWhatsapp.replace(/\D/g, '')}`
      : '#'

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Client info */}
          <div className="rounded-xl p-3 space-y-1 text-sm" style={{ background: '#FAFAF8' }}>
            {order.customer_name && (
              <p><span className="text-gray-400">Nombre:</span> <span className="font-medium">{order.customer_name}</span></p>
            )}
            {order.customer_phone && (
              <p><span className="text-gray-400">Teléfono:</span> {order.customer_phone}</p>
            )}
            {order.customer_address && (
              <p><span className="text-gray-400">Dirección:</span> {order.customer_address}</p>
            )}
            {order.notes && (
              <p><span className="text-gray-400">Nota:</span> {order.notes}</p>
            )}
          </div>

          {/* Items */}
          {items.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Productos</p>
              {items.map((item, i) => {
                const unitPrice = item.final_price ?? (item.product.price + (item.variant?.price_delta ?? 0))
                return (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0" style={{ borderColor: '#E8E6DF' }}>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-400">{item.variant.name}: {item.variant.value}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                      <p className="font-medium">{formatCOP(unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Detalles no disponibles</p>
          )}

          {/* Total */}
          {order.total != null && (
            <div className="flex justify-between items-center pt-1">
              <span className="font-medium text-sm">Total estimado</span>
              <span className="font-bold text-base" style={{ color: '#E91E8C' }}>{formatCOP(order.total)}</span>
            </div>
          )}

          {/* Actions */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 justify-center w-full py-2.5 text-white font-medium rounded-xl text-sm"
            style={{ background: '#25D366' }}
          >
            <MessageCircle className="h-4 w-4" />
            Contactar por WhatsApp
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface OrdersClientProps {
  orders: Order[]
  currentStatus: string
  storeId: string
  storeWhatsapp: string
}

export function OrdersClient({ orders, currentStatus, storeId, storeWhatsapp }: OrdersClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = currentStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === currentStatus)

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .eq('store_id', storeId)
    setUpdating(null)
    if (error) { toast('Error al actualizar', 'error'); return }
    toast('Estado actualizado')
    router.refresh()
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <ClipboardList className="h-16 w-16 opacity-20" />
        <p className="font-medium text-gray-500">Aún no has recibido pedidos</p>
        <p className="text-sm text-center max-w-xs">
          Cuando una clienta complete el proceso de WhatsApp, aparecerá aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => router.push(opt.value === 'all' ? '/admin/pedidos' : `/admin/pedidos?status=${opt.value}`)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
            style={currentStatus === opt.value
              ? { background: '#E91E8C', color: 'white', borderColor: '#E91E8C' }
              : { background: 'white', color: '#6b7280', borderColor: '#E8E6DF' }
            }
          >
            {opt.label}
            {opt.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter((o) => o.status === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: '#E8E6DF' }}>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No hay pedidos con este filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-gray-400" style={{ borderColor: '#E8E6DF' }}>
                  {['ID', 'Cliente', 'Dirección', 'Total', 'Items', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const items = parseItems(order.items)
                  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending
                  const isUpdating = updating === order.id

                  return (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F5F4F0' }}>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">
                        {order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium max-w-[120px] truncate">
                        {order.customer_name ?? '—'}
                        {order.customer_phone && (
                          <p className="text-xs text-gray-400 font-normal">{order.customer_phone}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-[140px] truncate">
                        {order.customer_address ?? '—'}
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: '#E91E8C' }}>
                        {order.total != null ? formatCOP(order.total) : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{items.length}</td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-xs">
                        {relativeTime(order.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: statusInfo.bg, color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setDetailOrder(order)}
                          >
                            Ver
                          </Button>
                          <select
                            className="h-7 text-xs border rounded-lg px-1.5 bg-white text-gray-600 cursor-pointer"
                            style={{ borderColor: '#E8E6DF' }}
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detailOrder && (
        <OrderDetail
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          storeWhatsapp={storeWhatsapp}
        />
      )}
    </div>
  )
}
