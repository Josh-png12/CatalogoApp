import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/utils'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { CustomerDetailClient } from './CustomerDetailClient'
import type { Customer, Sale } from '@/types'

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendiente',  color: '#D97706', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmado', color: '#2563EB', bg: '#DBEAFE' },
  delivered: { label: 'Entregado',  color: '#16A34A', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelado',  color: '#DC2626', bg: '#FEE2E2' },
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: customer }, { data: sales }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', id).single(),
    supabase.from('sales').select('*').eq('customer_id', id).order('sale_date', { ascending: false }),
  ])

  if (!customer) notFound()

  const c = customer as Customer
  const saleList = (sales ?? []) as Sale[]

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      {/* Header */}
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#E8E6DF' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style={{ background: '#E91E8C' }}
          >
            {initials(c.name)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{c.name}</h1>
            <p className="text-sm text-muted-foreground">{c.phone ?? c.whatsapp ?? 'Sin teléfono'}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(c.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: '#FCE7F3', color: '#E91E8C' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {(c.whatsapp || c.phone) && (
              <a
                href={`https://wa.me/57${(c.whatsapp ?? c.phone ?? '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            <CustomerDetailClient customer={c} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E8E6DF' }}>
          <p className="font-semibold text-gray-800">Información del perfil</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Ciudad', value: c.city },
              { label: 'Barrio', value: c.neighborhood },
              { label: 'Dirección', value: c.address },
              { label: 'Cumpleaños', value: c.birthday },
              { label: 'Tipo de piel', value: c.skin_type },
              { label: 'Tono de piel', value: c.skin_tone },
              { label: 'Total compras', value: formatCOP(c.total_spent ?? 0) },
              { label: 'Activa', value: c.active ? 'Sí' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-gray-900">{value ?? '—'}</p>
              </div>
            ))}
          </div>
          {c.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notas</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{c.notes}</p>
            </div>
          )}
        </div>

        {/* Purchase history */}
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E8E6DF' }}>
          <p className="font-semibold text-gray-800">Historial de compras ({saleList.length})</p>
          {saleList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin compras registradas</p>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-80">
              {saleList.map((sale) => {
                const st = STATUS_LABELS[sale.status] ?? STATUS_LABELS.pending
                return (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ borderColor: '#F5F4F0' }}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(sale.sale_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{sale.channel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                      <p className="text-sm font-semibold" style={{ color: '#E91E8C' }}>
                        {formatCOP(sale.total)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
