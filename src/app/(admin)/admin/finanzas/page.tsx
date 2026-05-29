import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react'
import { FinanceChart } from '@/components/admin/FinanceChart'
import { FinanzasClient } from './FinanzasClient'
import type { Expense } from '@/types'

function StatCard({
  title, value, icon: Icon, color, sub,
}: {
  title: string; value: string; icon: React.ElementType; color: string; sub?: string
}) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: '#E8E6DF' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default async function FinanzasPage() {
  const supabase = await createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthStartDate = monthStart.slice(0, 10)

  // Current month data
  const [salesRes, expensesRes, storeConfigRes] = await Promise.all([
    supabase.from('sales').select('total').eq('store_id', storeId).neq('status', 'cancelled').gte('sale_date', monthStartDate),
    supabase.from('expenses').select('*').eq('store_id', storeId).gte('expense_date', monthStartDate).order('expense_date', { ascending: false }),
    supabase.from('store_config').select('monthly_goal').eq('store_id', storeId).single(),
  ])

  const ingresos = (salesRes.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0)
  const egresos = (expensesRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0)
  const utilidad = ingresos - egresos
  const monthlyGoal: number = (storeConfigRes.data as { monthly_goal?: number } | null)?.monthly_goal ?? 0
  const goalProgress = monthlyGoal > 0 ? Math.min(100, Math.round((ingresos / monthlyGoal) * 100)) : 0

  // Last 6 months data for chart
  const months: Array<{ month: string; ingresos: number; egresos: number }> = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = d.toISOString().slice(0, 10)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
    const label = d.toLocaleDateString('es-CO', { month: 'short' })

    const [sRes, eRes] = await Promise.all([
      supabase.from('sales').select('total').eq('store_id', storeId).neq('status', 'cancelled').gte('sale_date', start).lte('sale_date', end),
      supabase.from('expenses').select('amount').eq('store_id', storeId).gte('expense_date', start).lte('expense_date', end),
    ])
    months.push({
      month: label,
      ingresos: (sRes.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0),
      egresos: (eRes.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0),
    })
  }

  const currentMonthExpenses = (expensesRes.data ?? []) as Expense[]

  const CATEGORY_LABELS: Record<string, string> = {
    mercancia: '📦 Mercancía',
    domicilios: '🚗 Domicilios',
    publicidad: '📱 Publicidad',
    local: '🏠 Local',
    transporte: '🚌 Transporte',
    otros: '📝 Otros',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finanzas</h1>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ingresos" value={formatCOP(ingresos)} icon={TrendingUp} color="#10B981" sub="ventas este mes" />
        <StatCard title="Egresos" value={formatCOP(egresos)} icon={TrendingDown} color="#EF4444" sub="gastos este mes" />
        <StatCard
          title="Utilidad"
          value={formatCOP(utilidad)}
          icon={DollarSign}
          color={utilidad >= 0 ? '#10B981' : '#EF4444'}
          sub={utilidad >= 0 ? 'Balance positivo' : 'Balance negativo'}
        />
        <div className="rounded-2xl border bg-white p-5 col-span-2 lg:col-span-1" style={{ borderColor: '#E8E6DF' }}>
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm text-gray-500">Meta del mes</p>
            <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E91E8C18' }}>
              <Target className="h-5 w-5" style={{ color: '#E91E8C' }} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{goalProgress}%</p>
          <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${goalProgress}%`, background: goalProgress >= 100 ? '#10B981' : '#E91E8C' }}
            />
          </div>
          {monthlyGoal > 0 && (
            <p className="text-xs text-gray-400 mt-1">{formatCOP(ingresos)} / {formatCOP(monthlyGoal)}</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border bg-white p-5" style={{ borderColor: '#E8E6DF' }}>
        <p className="font-medium text-sm text-gray-700 mb-4">Ingresos vs Egresos — últimos 6 meses</p>
        <FinanceChart data={months} />
      </div>

      {/* Expenses section */}
      <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E8E6DF' }}>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-800">Gastos este mes ({currentMonthExpenses.length})</p>
          <FinanzasClient storeId={storeId} />
        </div>

        {currentMonthExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin gastos registrados este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: '#F5F4F0' }}>
                  <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoría</th>
                  <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Descripción</th>
                  <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-right px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b last:border-0" style={{ borderColor: '#F5F4F0' }}>
                    <td className="px-2 py-2.5 text-gray-700">
                      {CATEGORY_LABELS[expense.category] ?? expense.category}
                    </td>
                    <td className="px-2 py-2.5 text-gray-500 hidden sm:table-cell">
                      {expense.description ?? '—'}
                    </td>
                    <td className="px-2 py-2.5 text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-2 py-2.5 text-right font-semibold" style={{ color: '#EF4444' }}>
                      -{formatCOP(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
