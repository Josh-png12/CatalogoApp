'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import type { DailyMetric } from '@/types'

interface AnalyticsChartProps {
  data: DailyMetric[]
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border rounded-xl px-3 py-2 shadow-lg text-xs space-y-1" style={{ borderColor: '#E8E6DF' }}>
      <p className="font-medium text-gray-700 capitalize">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const hasData = data.some((d) => d.carts > 0 || d.clicks > 0 || d.orders > 0)

  if (!hasData) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
        <p className="text-2xl">📊</p>
        <p className="text-sm">Aún no hay datos de los últimos 7 días.</p>
        <p className="text-xs">Los eventos aparecerán cuando las clientas interactúen con la tienda.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => <span style={{ color: '#6b7280' }}>{value}</span>}
        />
        <Line
          type="monotone" dataKey="carts" name="Al carrito"
          stroke="#E91E8C" strokeWidth={2} dot={{ r: 3, fill: '#E91E8C' }} activeDot={{ r: 5 }}
        />
        <Line
          type="monotone" dataKey="clicks" name="WhatsApp"
          stroke="#25D366" strokeWidth={2} dot={{ r: 3, fill: '#25D366' }} activeDot={{ r: 5 }}
        />
        <Line
          type="monotone" dataKey="orders" name="Pedidos"
          stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: '#3B82F6' }} activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
