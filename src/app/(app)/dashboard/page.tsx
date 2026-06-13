'use client'
import { useSales } from '@/lib/hooks/useSales'
import { useProducts } from '@/lib/hooks/useProducts'
import { useInventory } from '@/lib/hooks/useInventory'
import { usePartners } from '@/lib/hooks/usePartners'
import { StatCard } from '@/components/shared/StatCard'
import { SalesChart } from '@/components/charts/SalesChart'
import { fmtCOP, marginPct } from '@/lib/calculations'

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

  const today = new Date().toDateString()
  const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === today)
  const recent = sales.slice(0, 8)

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <StatCard icon="💰" label="Ingresos Totales" value={fmtCOP(totalRev)} color="#22C55E" delay={0} />
        <StatCard icon="📈" label="Ganancia Neta" value={fmtCOP(totalProfit)} color="#3B82F6" delay={0.05} />
        <StatCard icon="📦" label="Inventario" value={totalInv.toLocaleString()} color="#F59E0B" delay={0.1} />
        <StatCard icon="🏷" label="Unidades Vendidas" value={totalSold.toLocaleString()} color="#EF4444" delay={0.15} />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon="👥" label="Socios" value={partners.length.toString()} color="#94A3B8" delay={0.2} />
        <StatCard icon="🚀" label="Fondo Reinversión" value={reinvFund} color="#3B82F6" delay={0.25} />
        <StatCard icon="💎" label="Margen Promedio" value={avgMargin} color="#22C55E" delay={0.3} />
        <StatCard icon="🏷" label="Productos" value={products.length.toString()} color="#94A3B8" delay={0.35} />
      </div>

      <SalesChart sales={sales} />

      <div className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(59,130,246,0.15)]">
          <div className="text-sm font-bold">⚡ Actividad Reciente</div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Producto','Cant.','Ingreso','Ganancia','Hora'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#94A3B8] font-semibold bg-white/[0.02]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-[#94A3B8] py-8 text-sm">Sin ventas aún</td></tr>
            ) : recent.map(s => (
              <tr key={s.id} className="hover:bg-blue-500/3 transition-colors border-t border-white/[0.04]">
                <td className="px-5 py-3 text-sm">{s.product_name}</td>
                <td className="px-5 py-3 text-sm">{s.qty}</td>
                <td className="px-5 py-3 text-sm text-[#22C55E]">{fmtCOP(s.revenue)}</td>
                <td className="px-5 py-3 text-sm text-[#3B82F6]">{fmtCOP(s.profit)}</td>
                <td className="px-5 py-3 text-sm text-[#94A3B8]">
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
