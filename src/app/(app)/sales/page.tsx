'use client'
import { useSales } from '@/lib/hooks/useSales'
import { StatCard } from '@/components/shared/StatCard'
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
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard icon="📅" label="Hoy" value={fmtCOP(todayRev)} color="#22C55E" delay={0} />
        <StatCard icon="📆" label="Esta Semana" value={fmtCOP(weekRev)} color="#3B82F6" delay={0.05} />
        <StatCard icon="🗓" label="Este Mes" value={fmtCOP(monthRev)} color="#F59E0B" delay={0.1} />
      </div>

      <div className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(59,130,246,0.15)]">
          <div className="text-sm font-bold">📊 Historial Completo</div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Producto','Cantidad','Ingreso','Ganancia','Fecha'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#94A3B8] font-semibold bg-white/[0.02]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={5} className="py-12"><EmptyState icon="📊" title="Sin ventas registradas" subtitle="Registra tu primera venta para verla aquí" /></td></tr>
            ) : sales.map(s => (
              <tr key={s.id} className="hover:bg-blue-500/3 transition-colors border-t border-white/[0.04]">
                <td className="px-5 py-3 text-sm">{s.product_name}</td>
                <td className="px-5 py-3 text-sm">{s.qty}</td>
                <td className="px-5 py-3 text-sm text-[#22C55E]">{fmtCOP(s.revenue)}</td>
                <td className="px-5 py-3 text-sm text-[#3B82F6]">{fmtCOP(s.profit)}</td>
                <td className="px-5 py-3 text-sm text-[#94A3B8]">
                  {new Date(s.created_at).toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
