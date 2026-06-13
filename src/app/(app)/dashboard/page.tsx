'use client'
import { motion } from 'framer-motion'
import { useSales } from '@/lib/hooks/useSales'
import { useProducts } from '@/lib/hooks/useProducts'
import { useInventory } from '@/lib/hooks/useInventory'
import { usePartners } from '@/lib/hooks/usePartners'
import { SalesChart } from '@/components/charts/SalesChart'
import { fmtCOP } from '@/lib/calculations'

const STATS = (totalRev: number, totalProfit: number, totalInv: number, totalSold: number, partnerCount: number, reinvFund: string, avgMargin: string, productCount: number) => [
  { icon: '💰', label: 'Ingresos', value: fmtCOP(totalRev), color: '#00E29E' },
  { icon: '📈', label: 'Ganancia', value: fmtCOP(totalProfit), color: '#FF6B35' },
  { icon: '📦', label: 'Stock', value: totalInv.toLocaleString(), color: '#FFDB3C' },
  { icon: '🏷', label: 'Vendidas', value: totalSold.toLocaleString(), color: '#FF6B35' },
  { icon: '👥', label: 'Socios', value: partnerCount.toString(), color: '#a09aad' },
  { icon: '🚀', label: 'Reinversión', value: reinvFund, color: '#FF6B35' },
  { icon: '💎', label: 'Margen', value: avgMargin, color: '#00E29E' },
  { icon: '🍭', label: 'Productos', value: productCount.toString(), color: '#FFDB3C' },
]

export default function DashboardPage() {
  const { sales } = useSales()
  const { products } = useProducts()
  const { inventory } = useInventory()
  const { partners } = usePartners()

  const totalRev = sales.reduce((a, s) => a + s.revenue, 0)
  const totalProfit = sales.reduce((a, s) => a + s.profit, 0)
  const totalSold = sales.reduce((a, s) => a + s.qty, 0)
  const totalInv = inventory.reduce((a, i) => a + i.qty, 0)
  const avgMargin = totalRev > 0 ? (totalProfit / totalRev * 100).toFixed(1) + '%' : '—'
  const reinvFund = fmtCOP(totalProfit * 0.5)
  const recent = sales.slice(0, 8)

  const stats = STATS(totalRev, totalProfit, totalInv, totalSold, partners.length, reinvFund, avgMargin, products.length)

  return (
    <div>
      {/* 2 columnas en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {stats.slice(0, 4).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3 sm:p-4 relative overflow-hidden"
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${s.color}25, transparent 70%)` }} />
            <div className="text-xl mb-2" style={{ filter: `drop-shadow(0 2px 8px ${s.color}50)` }}>{s.icon}</div>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{s.label}</div>
            <div className="text-sm sm:text-lg font-bold mono truncate" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.slice(4).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 4) * 0.05 }}
            className="glass-card p-3 sm:p-4 relative overflow-hidden"
          >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${s.color}20, transparent 70%)` }} />
            <div className="text-xl mb-2" style={{ filter: `drop-shadow(0 2px 8px ${s.color}50)` }}>{s.icon}</div>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{s.label}</div>
            <div className="text-sm sm:text-lg font-bold mono truncate" style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <SalesChart sales={sales} />

      {/* Actividad reciente */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>⚡ Actividad Reciente</div>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Sin ventas aún — ¡a vender! 🍭</div>
        ) : (
          <>
            {/* Móvil: lista compacta */}
            <div className="sm:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {recent.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{s.product_name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {s.qty} uds · {new Date(s.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
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
                  {['Producto','Cant.','Ingreso','Ganancia','Hora'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(s => (
                  <tr key={s.id} className="transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-6 py-3 text-sm font-medium">{s.product_name}</td>
                    <td className="px-6 py-3 text-sm mono">{s.qty}</td>
                    <td className="px-6 py-3 text-sm mono font-semibold" style={{ color: '#00E29E' }}>{fmtCOP(s.revenue)}</td>
                    <td className="px-6 py-3 text-sm mono font-semibold" style={{ color: '#FF6B35' }}>{fmtCOP(s.profit)}</td>
                    <td className="px-6 py-3 text-sm mono" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
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
