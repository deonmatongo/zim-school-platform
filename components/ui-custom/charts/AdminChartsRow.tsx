'use client'

import { memo } from 'react'
import { FeesAreaChart } from './FeesAreaChart'
import { CollectionDonut } from './CollectionDonut'

interface AdminChartsRowProps {
  collectionRate: number
  totalBilled: number
  totalPaid: number
  monthlyTrend: { month: string; billed: number; collected: number }[]
}

export const AdminChartsRow = memo(function AdminChartsRow({
  collectionRate, totalBilled, totalPaid, monthlyTrend,
}: AdminChartsRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Area chart — spans 2 cols */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Fee Collection Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Billed vs collected over time</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400" />Billed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />Collected
            </span>
          </div>
        </div>
        {monthlyTrend.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
            No data available yet
          </div>
        ) : (
          <FeesAreaChart data={monthlyTrend} />
        )}
      </div>

      {/* Donut — 1 col */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Collection Rate</h3>
          <p className="text-xs text-slate-400 mt-0.5">This academic year</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <CollectionDonut
            rate={collectionRate}
            totalBilled={totalBilled}
            totalPaid={totalPaid}
          />
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />Collected
              </span>
              <span className="font-semibold tabular-nums text-slate-700">${totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-200" />Outstanding
              </span>
              <span className="font-semibold tabular-nums text-slate-700">${Math.max(0, totalBilled - totalPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Total billed</span>
              <span className="font-bold tabular-nums text-slate-800">${totalBilled.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
