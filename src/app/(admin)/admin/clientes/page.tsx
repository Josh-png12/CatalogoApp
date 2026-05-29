'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils'
import { UserPlus, Search, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomerForm } from '@/components/admin/CustomerForm'
import type { Customer } from '@/types'

function relativeDate(dateStr?: string | null): string {
  if (!dateStr) return 'Nunca'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  const months = Math.floor(days / 30)
  return `Hace ${months} mes${months > 1 ? 'es' : ''}`
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  VIP:       { bg: '#FDF6E3', color: '#C9A84C' },
  Frecuente: { bg: '#EFF6FF', color: '#3B82F6' },
  Nueva:     { bg: '#F0FDF4', color: '#10B981' },
  Inactiva:  { bg: '#F3F4F6', color: '#6B7280' },
}

const FILTER_TABS = ['Todas', 'VIP', 'Frecuentes', 'Inactivas']

export default function ClientesPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Todas')
  const [formOpen, setFormOpen] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    setCustomers((data as Customer[]) ?? [])
    setLoading(false)
  }, [storeId])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? '').includes(search)

    const matchTab =
      activeTab === 'Todas' ||
      (activeTab === 'VIP' && c.tags?.includes('VIP')) ||
      (activeTab === 'Frecuentes' && c.tags?.includes('Frecuente')) ||
      (activeTab === 'Inactivas' && (!c.active || c.tags?.includes('Inactiva')))

    return matchSearch && matchTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{customers.length} clientes en total</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="gap-2 text-white"
          style={{ background: '#E91E8C' }}
        >
          <UserPlus className="h-4 w-4" />
          Nueva cliente
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: '#E8E6DF' }}>
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Cargando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-medium text-gray-700">No hay clientes aún</p>
            <p className="text-sm text-muted-foreground mt-1">Agrega tu primera cliente para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#F5F4F0' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Total compras</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Última compra</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Etiquetas</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#F5F4F0' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white"
                          style={{ background: '#E91E8C' }}
                        >
                          {initials(customer.name)}
                        </div>
                        <div>
                          <Link
                            href={`/admin/clientes/${customer.id}`}
                            className="font-medium text-gray-900 hover:underline"
                            style={{ color: '#111' }}
                          >
                            {customer.name}
                          </Link>
                          {customer.city && (
                            <p className="text-xs text-muted-foreground">{customer.city}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                      {customer.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell font-medium" style={{ color: '#E91E8C' }}>
                      {formatCOP(customer.total_spent ?? 0)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {relativeDate(customer.last_purchase_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(customer.tags ?? []).map((tag) => {
                          const colors = TAG_COLORS[tag] ?? { bg: '#F3F4F6', color: '#6B7280' }
                          return (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: colors.bg, color: colors.color }}
                            >
                              {tag}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {(customer.whatsapp || customer.phone) && (
                          <a
                            href={`https://wa.me/57${(customer.whatsapp ?? customer.phone ?? '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                            style={{ background: '#F0FDF4', color: '#16A34A' }}
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          href={`/admin/clientes/${customer.id}`}
                          className="h-8 px-3 flex items-center justify-center rounded-lg text-xs font-medium transition-colors"
                          style={{ background: '#F3F4F6', color: '#374151' }}
                        >
                          Ver
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerForm
        storeId={storeId}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchCustomers}
      />
    </div>
  )
}
