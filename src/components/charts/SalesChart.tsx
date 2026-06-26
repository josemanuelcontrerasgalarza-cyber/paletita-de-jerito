'use client'
import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Sale } from '@/lib/types'
import { fmtCOP } from '@/lib/calculations'

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface Props { sales: Sale[] }

export function SalesChart({ sales }: Props) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [metric, setMetric] = useState<'revenue' | 'profit'>('revenue')

  const data = useMemo(() => {
    const now = new Date()
    if (view === 'week') {
      const slots: { date: Date; key: string }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        slots.push({ date: d, key: d.toDateString() })
      }
      const map: Record<string, { revenue: number; profit: number }> = {}
      slots.forEach(s => { map[s.key] = { revenue: 0, profit: 0 } })
      sales.forEach(s => {
        const key = new Date(s.created_at).toDateString()
        if (key in map) { map[key].revenue += s.revenue; map[key].profit += s.profit }
      })
      return slots.map(s => ({ name: DAYS[s.date.getDay()], ...map[s.key] }))
    } else {
      const slots: { date: Date; label: string }[] = []
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        slots.push({ date: d, label: String(d.getDate()) })
      }
      const map: Record<string, { revenue: number; profit: number }> = {}
      slots.forEach(s => { map[s.date.toDateString()] = { revenue: 0, profit: 0 } })
      sales.forEach(s => {
        const key = new Date(s.created_at).toDateString()
        if (key in map) { map[key].revenue += s.revenue; map[key].profit += s.profit }
      })
      return slots.map(s => ({ name: s.label, ...map[s.date.toDateString()] }))
    }
  }, [sales, view])

  const isProfit = metric === 'profit'
  const color = isProfit ? '#00E29E' : '#FF6B35'
  const gradientId = isProfit ? 'colorProfit' : 'colorRev'

  return (
    <div className="glass-card p-5 mb-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📊 Historial de Ventas</div>
        <div className="flex gap-1">
          <div className="flex gap-1 p-1 rounded-xl mr-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['revenue', 'profit'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'Inter',
                  background: metric === m ? (m === 'profit' ? 'rgba(0,226,158,0.15)' : 'rgba(255,107,53,0.15)') : 'transparent',
                  color: metric === m ? (m === 'profit' ? '#00E29E' : '#FF6B35') : 'var(--text-muted)',
                  border: metric === m ? `1px solid ${m === 'profit' ? 'rgba(0,226,158,0.25)' : 'rgba(255,107,53,0.25)'}` : '1px solid transparent',
                }}
              >
                {m === 'revenue' ? 'Ingresos' : 'Ganancia'}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  fontFamily: 'Inter',
                  background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: view === v ? 'var(--text)' : 'var(--text-muted)',
                  border: view === v ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                }}
              >
                {v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E29E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E29E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#a09aad', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#a09aad', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => fmtCOP(v)} />
          <Tooltip
            contentStyle={{ background: 'rgba(14,14,19,0.95)', border: `1px solid ${color}33`, borderRadius: 12, fontSize: 12, backdropFilter: 'blur(20px)' }}
            labelStyle={{ color: '#a09aad', fontFamily: 'Inter' }}
            formatter={(v) => [fmtCOP(Number(v)), isProfit ? 'Ganancia' : 'Ingresos']}
          />
          <Area key={metric} type="monotone" dataKey={metric} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} dot={{ fill: color, strokeWidth: 0, r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
