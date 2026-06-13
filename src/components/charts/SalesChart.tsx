'use client'
import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
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
      return Object.entries(map).map(([k, v]) => ({ name: DAYS[new Date(k).getDay()], revenue: v }))
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
    <div className="glass-card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📊 Historial de Ventas</div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['week', 'month'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                fontFamily: 'Inter',
                background: view === v ? 'rgba(255,107,53,0.15)' : 'transparent',
                color: view === v ? '#FF6B35' : 'var(--text-muted)',
                border: view === v ? '1px solid rgba(255,107,53,0.25)' : '1px solid transparent',
              }}
            >
              {v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#a09aad', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#a09aad', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => fmtCOP(v)} />
          <Tooltip
            contentStyle={{ background: 'rgba(14,14,19,0.95)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 12, fontSize: 12, backdropFilter: 'blur(20px)' }}
            labelStyle={{ color: '#a09aad', fontFamily: 'Inter' }}
            formatter={(v) => [fmtCOP(Number(v)), 'Ingresos']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} fill="url(#colorRev)" dot={{ fill: '#FF6B35', strokeWidth: 0, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
