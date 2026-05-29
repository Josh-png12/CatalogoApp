'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MonthData {
  month: string
  ingresos: number
  egresos: number
}

interface FinanceChartProps {
  data: MonthData[]
}

function formatK(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return String(value)
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border shadow-lg p-3 text-sm" style={{ borderColor: '#E8E6DF' }}>
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-600 capitalize">{entry.name}:</span>
          <span className="font-medium">${formatK(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4} barCategoryGap="30%">
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#6B7280', paddingTop: 8 }}
          formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
        <Bar dataKey="ingresos" name="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="egresos" name="egresos" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
