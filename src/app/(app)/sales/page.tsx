'use client'
import { motion } from 'framer-motion'
import { useSales } from '@/lib/hooks/useSales'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtCOP } from '@/lib/calculations'

export default function SalesPage() {
  const { sales } = useSales()

  const now = new Date()
  const todayStr = now.toDateString()
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const todayRev = sales.filter(s => new Date(s.created_at).toDateString() === todayStr).reduce((a, s) => a + s.revenue, 0)
  const weekRev = sales.filter(s => new Date(s.created_at) >= weekAgo).reduce((a, s) => a + s.revenue, 0)
  const monthRev = sales.filter(s => new Date(s.created_at) >= monthStart).reduce((a, s) => a + s.revenue, 0)

  return (
    <div>
      {/* Stats compactas */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: '📅', label: 'Hoy', value: fmtCOP(todayRev), color: '#00E29E' },
          { icon: '📆', label: 'Semana', value: fmtCOP(weekRev), color: '#FF6B35' },
          { icon: '🗓', label: 'Mes', value: fmtCOP(monthRev), color: '#FFDB3C' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3 sm:p-4 relative overflow-hidden"
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full" style={{ background: `radial-gradient(circle, ${s.color}20, transparent 70%)` }} />
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{s.label}</div>
            <div className="text-sm sm:text-base font-bold mono" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Lista de ventas como tarjetas en móvil, tabla en desktop */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📊 Historial Completo</div>
        </div>

        {sales.length === 0 ? (
          <div className="py-12"><EmptyState icon="📊" title="Sin ventas registradas" subtitle="Registra tu primera venta para verla aquí" /></div>
        ) : (
          <>
            {/* Móvil: tarjetas */}
            <div className="sm:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {sales.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{s.product_name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {s.qty} uds · {new Date(s.created_at).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold mono" style={{ color: '#00E29E' }}>{fmtCOP(s.revenue)}</div>
                    <div className="text-[10px] mono" style={{ color: '#FF6B35' }}>+{fmtCOP(s.profit)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabla */}
            <table className="hidden sm:table w-full border-collapse">
              <thead>
                <tr>
                  {['Producto','Cant.','Ingreso','Ganancia','Fecha'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s.id} className="transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3 text-sm font-medium">{s.product_name}</td>
                    <td className="px-5 py-3 text-sm mono">{s.qty}</td>
                    <td className="px-5 py-3 text-sm mono font-semibold" style={{ color: '#00E29E' }}>{fmtCOP(s.revenue)}</td>
                    <td className="px-5 py-3 text-sm mono font-semibold" style={{ color: '#FF6B35' }}>{fmtCOP(s.profit)}</td>
                    <td className="px-5 py-3 text-sm mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
