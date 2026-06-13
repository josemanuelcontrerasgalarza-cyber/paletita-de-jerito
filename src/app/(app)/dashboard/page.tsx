'use client'
import { useSales } from '@/lib/hooks/useSales'
import { useProducts } from '@/lib/hooks/useProducts'
import { useInventory } from '@/lib/hooks/useInventory'
import { usePartners } from '@/lib/hooks/usePartners'
import { StatCard } from '@/components/shared/StatCard'
import { SalesChart } from '@/components/charts/SalesChart'
import { fmtCOP } from '@/lib/calculations'

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

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard icon="💰" label="Ingresos Totales" value={fmtCOP(totalRev)} color="#00E29E" delay={0} />
        <StatCard icon="📈" label="Ganancia Neta" value={fmtCOP(totalProfit)} color="#FF6B35" delay={0.05} />
        <StatCard icon="📦" label="Stock Total" value={totalInv.toLocaleString()} color="#FFDB3C" delay={0.1} />
        <StatCard icon="🏷" label="Unidades Vendidas" value={totalSold.toLocaleString()} color="#FF6B35" delay={0.15} />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon="👥" label="Socios" value={partners.length.toString()} color="#a09aad" delay={0.2} />
        <StatCard icon="🚀" label="Fondo Reinversión" value={reinvFund} color="#FF6B35" delay={0.25} />
        <StatCard icon="💎" label="Margen Promedio" value={avgMargin} color="#00E29E" delay={0.3} />
        <StatCard icon="🍭" label="Productos" value={products.length.toString()} color="#FFDB3C" delay={0.35} />
      </div>

      <SalesChart sales={sales} />

      {/* Recent activity */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>⚡ Actividad Reciente</div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Producto','Cant.','Ingreso','Ganancia','Hora'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', fontFamily: 'Inter' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>Sin ventas aún — ¡a vender! 🍭</td></tr>
            ) : recent.map(s => (
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
      </div>
    </div>
  )
}
