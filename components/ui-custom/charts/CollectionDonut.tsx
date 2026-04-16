'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CollectionDonutProps {
  rate: number
  totalBilled: number
  totalPaid: number
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <span className="font-semibold text-slate-700">{entry.name}: </span>
      <span className="text-slate-600">${Number(entry.value).toLocaleString()}</span>
    </div>
  )
}

export function CollectionDonut({ rate, totalBilled, totalPaid }: CollectionDonutProps) {
  const remaining = Math.max(0, totalBilled - totalPaid)
  const data = [
    { name: 'Collected', value: totalPaid },
    { name: 'Outstanding', value: remaining },
  ]

  const color = rate >= 80 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444'
  const trackColor = rate >= 80 ? '#d1fae5' : rate >= 60 ? '#fef3c7' : '#fee2e2'

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={68}
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill={trackColor} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold tabular-nums" style={{ color, letterSpacing: '-0.03em' }}>{rate}%</span>
        <span className="text-[10px] font-medium text-slate-400 mt-0.5">collected</span>
      </div>
    </div>
  )
}
