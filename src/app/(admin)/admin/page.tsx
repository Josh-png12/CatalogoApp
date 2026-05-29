import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart, MessageCircle, ClipboardList, DollarSign, TrendingUp,
  Banknote, AlertTriangle, Package,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsChart } from '@/components/admin/AnalyticsChart'
import { formatCOP } from '@/lib/utils'
import type { DailyMetric } from '@/types'

function groupByDay(events: Array<{ event_type: string; created_at: string }>): DailyMetric[] {
  const days: Record<string, { carts: number; clicks: number; orders: number }> = {}
  const seven = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  seven.forEach((day) => { days[day] = { carts: 0, clicks: 0, orders: 0 } })
  events.forEach((e) => {
    const day = e.created_at.slice(0, 10)
    if (!days[day]) return
    if (e.event_type === 'add_to_cart')    days[day].carts++
    if (e.event_type === 'whatsapp_click') days[day].clicks++
    if (e.event_type === 'order_created')  days[day].orders++
  })
  return seven.map((day) => ({
    date: day,
    day: new Date(day + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short' }),
    ...days[day],
  }))
}

function StatCard({ title, value, icon: Icon, accentColor, sub }: {
  title: string; value: string | number; icon: React.ElementType
  accentColor: string; sub?: string
}) {
  return (
    <div
      className="rounded-2xl p-5 border bg-white"
      style={{ borderColor: '#E8E6DF' }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">{title}</p>
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}18` }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
      </div>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const today = new Date().toISOString().slice(0, 10)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { count: totalCartAdds },
    { count: totalWaClicks },
    { count: totalOrders },
    revenueRes,
    last7dRes,
    topProductsRes,
    recentOrdersRes,
    salesTodayRes,
    pendingOrdersRes,
    lowStockRes,
    expensesMonthRes,
  ] = await Promise.all([
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('store_id', storeId).eq('event_type', 'add_to_cart'),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('store_id', storeId).eq('event_type', 'whatsapp_click'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('orders').select('total').eq('store_id', storeId),
    supabase.from('analytics_events').select('event_type, created_at').eq('store_id', storeId).gte('created_at', sevenDaysAgo).order('created_at', { ascending: true }),
    supabase.from('analytics_events').select('product_id').eq('store_id', storeId).eq('event_type', 'add_to_cart').not('product_id', 'is', null),
    supabase.from('orders').select('id, customer_name, total, status, created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(3),
    supabase.from('sales').select('total').eq('store_id', storeId).eq('sale_date', today).neq('status', 'cancelled'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeId).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', storeId).eq('active', true).lte('stock', 5).gt('stock', 0),
    supabase.from('expenses').select('amount').eq('store_id', storeId).gte('expense_date', monthStart.slice(0, 10)),
  ])

  const salesToday = (salesTodayRes.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0)
  const expensesMonth = (expensesMonthRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0)

  const totalRevenue = (revenueRes.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0)
  const dailyData = groupByDay(last7dRes.data ?? [])

  // Top 5 products by add_to_cart
  const productCounts: Record<string, number> = {}
  for (const e of (topProductsRes.data ?? [])) {
    const pid = e.product_id as string
    productCounts[pid] = (productCounts[pid] ?? 0) + 1
  }
  const top5Ids = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }))

  const topProductDetails = await Promise.all(
    top5Ids.map(({ id }) =>
      supabase.from('products')
        .select('id, name, images:product_images(url, is_primary)')
        .eq('id', id)
        .single()
    )
  )

  const topProducts = top5Ids.map(({ id, count }, i) => ({
    count,
    product: topProductDetails[i].data,
  })).filter((t) => t.product != null)

  const maxCount = topProducts[0]?.count ?? 1
  const conversionPct = (totalCartAdds ?? 0) > 0
    ? Math.round(((totalWaClicks ?? 0) / (totalCartAdds ?? 1)) * 100)
    : null

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente', confirmed: 'Confirmado', delivered: 'Entregado', cancelled: 'Cancelado',
  }

  return (
    <div className="space-y-8">
      {/* Business summary today */}
      <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E8E6DF' }}>
        <p className="font-semibold text-gray-800 text-sm">Resumen del negocio hoy</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl p-3 space-y-1" style={{ background: '#FDF2F8' }}>
            <div className="flex items-center gap-1.5">
              <Banknote className="h-4 w-4" style={{ color: '#E91E8C' }} />
              <p className="text-xs text-gray-500">Ventas hoy</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#E91E8C' }}>{formatCOP(salesToday)}</p>
          </div>
          <div className="rounded-xl p-3 space-y-1" style={{ background: '#FFF7ED' }}>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" style={{ color: '#F59E0B' }} />
              <p className="text-xs text-gray-500">Pedidos pendientes</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#F59E0B' }}>{pendingOrdersRes.count ?? 0}</p>
          </div>
          <div className="rounded-xl p-3 space-y-1" style={{ background: '#FEF2F2' }}>
            <div className="flex items-center gap-1.5">
              <Package className="h-4 w-4" style={{ color: '#EF4444' }} />
              <p className="text-xs text-gray-500">Stock bajo</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#EF4444' }}>{lowStockRes.count ?? 0}</p>
          </div>
          <div className="rounded-xl p-3 space-y-1" style={{ background: '#F0FDF4' }}>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" style={{ color: '#10B981' }} />
              <p className="text-xs text-gray-500">Gastos del mes</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#10B981' }}>{formatCOP(expensesMonth)}</p>
          </div>
        </div>

        {/* Alerts */}
        {((pendingOrdersRes.count ?? 0) > 0 || (lowStockRes.count ?? 0) > 0) && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alertas</p>
            {(pendingOrdersRes.count ?? 0) > 0 && (
              <Link
                href="/admin/pedidos"
                className="flex items-center gap-2 p-2.5 rounded-xl text-sm transition-colors hover:bg-amber-100"
                style={{ background: '#FEF3C7' }}
              >
                <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: '#D97706' }} />
                <span style={{ color: '#92400E' }}>
                  Tienes <strong>{pendingOrdersRes.count}</strong> pedido{(pendingOrdersRes.count ?? 0) > 1 ? 's' : ''} pendiente{(pendingOrdersRes.count ?? 0) > 1 ? 's' : ''} de atender →
                </span>
              </Link>
            )}
            {(lowStockRes.count ?? 0) > 0 && (
              <Link
                href="/admin/inventario"
                className="flex items-center gap-2 p-2.5 rounded-xl text-sm transition-colors hover:bg-red-100"
                style={{ background: '#FEE2E2' }}
              >
                <Package className="h-4 w-4 flex-shrink-0" style={{ color: '#DC2626' }} />
                <span style={{ color: '#991B1B' }}>
                  <strong>{lowStockRes.count}</strong> producto{(lowStockRes.count ?? 0) > 1 ? 's' : ''} con stock bajo (≤5) →
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Analytics en tiempo real de tu tienda</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/compartir" className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50" style={{ borderColor: '#E8E6DF', color: '#6b7280' }}>
            Compartir catálogo →
          </Link>
          <Link href="/admin/pedidos" className="text-xs px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90" style={{ background: '#E91E8C' }}>
            Ver pedidos →
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Agregados al carrito"
          value={totalCartAdds ?? 0}
          icon={ShoppingCart}
          accentColor="#E91E8C"
          sub={`${(last7dRes.data ?? []).filter(e => e.event_type === 'add_to_cart').length} esta semana`}
        />
        <StatCard
          title="Clicks a WhatsApp"
          value={totalWaClicks ?? 0}
          icon={MessageCircle}
          accentColor="#25D366"
          sub={conversionPct != null ? `${conversionPct}% conversión` : 'sin datos de conversión'}
        />
        <StatCard
          title="Pedidos recibidos"
          value={totalOrders ?? 0}
          icon={ClipboardList}
          accentColor="#3B82F6"
          sub="total histórico"
        />
        <StatCard
          title="Ingresos estimados"
          value={formatCOP(totalRevenue)}
          icon={DollarSign}
          accentColor="#10B981"
          sub="suma de pedidos"
        />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border bg-white p-5" style={{ borderColor: '#E8E6DF' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <p className="font-medium text-sm text-gray-700">Actividad últimos 7 días</p>
        </div>
        <AnalyticsChart data={dailyData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E8E6DF' }}>
          <p className="font-medium text-sm text-gray-700">Top productos más agregados</p>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aún no hay datos</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map(({ count, product }, i) => {
                if (!product) return null
                const imgs = product.images as Array<{ url: string; is_primary: boolean }>
                const img = imgs?.find((x) => x.is_primary) ?? imgs?.[0]
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {img ? (
                        <Image src={img.url} alt={product.name} width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">💄</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / maxCount) * 100}%`, background: '#E91E8C' }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-400 flex-shrink-0">{count}x</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E8E6DF' }}>
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-gray-700">Pedidos recientes</p>
            <Link href="/admin/pedidos" className="text-xs" style={{ color: '#E91E8C' }}>Ver todos →</Link>
          </div>
          {!recentOrdersRes.data?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">Sin pedidos aún</p>
          ) : (
            <div className="space-y-2">
              {recentOrdersRes.data.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F5F4F0' }}>
                  <div>
                    <p className="text-sm font-medium">{o.customer_name ?? 'Cliente'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#E91E8C' }}>{o.total != null ? formatCOP(o.total) : '—'}</p>
                    <p className="text-xs text-gray-400">{STATUS_LABELS[o.status ?? 'pending'] ?? o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
