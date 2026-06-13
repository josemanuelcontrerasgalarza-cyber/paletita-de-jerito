'use client'
import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { Sale } from '@/lib/types'
import { fmtCOP } from '@/lib/calculations'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface Props { sales: Sale[] }

export function SalesChart({ sales }: Props) {
  const [view, setView] = useState<'week' | 'month'>('week')

  const data = useMemo(() => {
    const now = new Date()
    if (view === 'week') {
      const map: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        map[d.toDateString()] = 0
      }
      sales.forEach(s => {
        const key = new Date(s.created_at).toDateString()
        if (key in map) map[key] += s.revenue
      })
      return Object.entries(map).map(([k, v]) => ({
        name: DAYS[new Date(k).getDay()],
        revenue: v,
      }))
    } else {
      const map: Record<number, number> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        map[d.getDate()] = 0
      }
      sales.forEach(s => {
        const d = new Date(s.created_at)
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
        if (diff < 30) map[d.getDate()] = (map[d.getDate()] ?? 0) + s.revenue
      })
      return Object.entries(map).map(([k, v]) => ({ name: k, revenue: v }))
    }
  }, [sales, view])

  return (
    <div className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold">📊 Historial de Ventas</div>
        <div className="flex gap-1">
          {(['week', 'month'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                ${view === v
                  ? 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6] border border-[rgba(59,130,246,0.3)]'
                  : 'text-[#94A3B8] hover:text-white'
                }`}
            >
              {v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtCOP(v)} />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94A3B8' }}
            formatter={(v) => [fmtCOP(Number(v)), 'Ingresos']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#3B82F6', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
