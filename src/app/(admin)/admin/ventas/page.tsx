'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils'
import { Banknote, ShoppingBag, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SaleForm } from '@/components/admin/SaleForm'
import { useToast } from '@/components/ui/toaster'
import type { Sale } from '@/types'

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',  color: '#D97706', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmado', color: '#2563EB', bg: '#DBEAFE' },
  delivered: { label: 'Entregado',  color: '#16A34A', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelado',  color: '#DC2626', bg: '#FEE2E2' },
}

const CHANNEL_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  presencial:  { label: 'Presencial', color: '#374151', bg: '#F3F4F6' },
  whatsapp:    { label: 'WhatsApp',   color: '#16A34A', bg: '#DCFCE7' },
  catalogo:    { label: 'Catálogo',   color: '#E91E8C', bg: '#FCE7F3' },
  feria:       { label: 'Feria',      color: '#7C3AED', bg: '#EDE9FE' },
  referido:    { label: 'Referido',   color: '#D97706', bg: '#FEF3C7' },
}

const FILTER_TABS = ['Todas', 'Hoy', 'Esta semana', 'Este mes']

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: '#E8E6DF' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{title}</p>
        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function VentasPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Todas')
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchSales = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('sales')
      .select('*')
      .eq('store_id', storeId)
      .order('sale_date', { ascending: false })
      .order('created_at', { ascending: false })
    setSales((data as Sale[]) ?? [])
    setLoading(false)
  }, [storeId])

  useEffect(() => { fetchSales() }, [fetchSales])

  const today = new Date().toISOString().slice(0, 10)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

  const activeSales = sales.filter((s) => s.status !== 'cancelled')
  const salesToday = activeSales.filter((s) => s.sale_date === today)
  const salesMonth = activeSales.filter((s) => s.sale_date >= monthStart)
  const pendingSales = sales.filter((s) => !s.payment_received && s.status !== 'cancelled')

  const filtered = sales.filter((s) => {
    if (activeTab === 'Hoy') return s.sale_date === today
    if (activeTab === 'Esta semana') return s.sale_date >= weekAgo
    if (activeTab === 'Este mes') return s.sale_date >= monthStart
    return true
  })

  const markDelivered = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('sales').update({ status: 'delivered' }).eq('id', id)
    if (error) { toast('Error al actualizar', 'error'); return }
    toast('Marcada como entregada', 'success')
    fetchSales()
  }

  const deleteSale = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('sales').delete().eq('id', id)
    if (error) { toast('Error al eliminar', 'error') } else { toast('Venta eliminada', 'success'); fetchSales() }
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventas</h1>
          <p className="text-sm text-muted-foreground">{sales.length} ventas registradas</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="gap-2 text-white"
          style={{ background: '#E91E8C' }}
        >
          <Banknote className="h-4 w-4" />
          Registrar venta
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Ventas hoy"
          value={formatCOP(salesToday.reduce((s, r) => s + r.total, 0))}
          icon={ShoppingBag}
          color="#E91E8C"
        />
        <StatCard
          title="Este mes"
          value={formatCOP(salesMonth.reduce((s, r) => s + r.total, 0))}
          icon={Banknote}
          color="#10B981"
        />
        <StatCard
          title="Pendientes cobro"
          value={formatCOP(pendingSales.reduce((s, r) => s + r.total, 0))}
          icon={Clock}
          color="#F59E0B"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={
              activeTab === tab
                ? { background: '#E91E8C', color: '#fff' }
                : { background: '#F3F4F6', color: '#6B7280' }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#E8E6DF' }}>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Cargando ventas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">💳</p>
            <p className="font-medium text-gray-700">Sin ventas en este período</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#F5F4F0' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Canal</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Pago</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => {
                  const st = STATUS_STYLES[sale.status] ?? STATUS_STYLES.pending
                  const ch = CHANNEL_STYLES[sale.channel] ?? CHANNEL_STYLES.presencial
                  return (
                    <tr
                      key={sale.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#F5F4F0' }}
                    >
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(sale.sale_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {sale.customer_name ?? 'Cliente'}
                        {sale.customer_phone && (
                          <p className="text-xs text-muted-foreground">{sale.customer_phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: ch.bg, color: ch.color }}
                        >
                          {ch.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: '#E91E8C' }}>
                        {formatCOP(sale.total)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs capitalize">
                        {sale.payment_method?.replace('_', ' ')}
                        {sale.payment_received && (
                          <span className="ml-1 text-green-600">✓</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {sale.status === 'confirmed' && (
                            <button
                              onClick={() => markDelivered(sale.id)}
                              className="h-8 px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                              style={{ background: '#F0FDF4', color: '#16A34A' }}
                              title="Marcar entregado"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteSale(sale.id)}
                            disabled={deleting === sale.id}
                            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                            style={{ color: '#EF4444' }}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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

      <SaleForm
        storeId={storeId}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchSales}
      />
    </div>
  )
}
