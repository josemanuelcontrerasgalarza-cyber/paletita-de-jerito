'use client'
import { useState } from 'react'
import { useSales } from '@/lib/hooks/useSales'
import { usePartners } from '@/lib/hooks/usePartners'
import { useProducts } from '@/lib/hooks/useProducts'
import { fmtCOP, reinvestAmount, withdrawAmount, unitsPossible, ownershipPct } from '@/lib/calculations'

export default function ReinvestPage() {
  const [sliderPct, setSliderPct] = useState(50)
  const { sales } = useSales()
  const { partners } = usePartners()
  const { products } = useProducts()

  const totalProfit = sales.reduce((a, s) => a + s.profit, 0)
  const reinvest = reinvestAmount(totalProfit, sliderPct)
  const withdraw = withdrawAmount(totalProfit, sliderPct)
  const avgCost = products.length > 0 ? products.reduce((a, p) => a + p.cost, 0) / products.length : 800
  const units = unitsPossible(reinvest, avgCost)
  const totalInv = partners.reduce((a, p) => a + p.investment, 0)

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl p-6 mb-5 border border-purple-500/20"
        style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))' }}>
        <div className="text-base font-bold mb-1">🚀 Calculadora de Reinversión</div>
        <div className="text-xs text-[#94A3B8] mb-4">Decide qué porcentaje de ganancias reinvertir</div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-[#94A3B8]">0%</span>
          <input
            type="range" min={0} max={100} value={sliderPct}
            onChange={e => setSliderPct(Number(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#3B82F6' }}
          />
          <span className="text-xs text-[#94A3B8]">100%</span>
        </div>
        <div className="text-center text-2xl font-black text-[#3B82F6] mb-5">{sliderPct}%</div>
        <div className="grid grid-cols-3 gap-3">
          <Box label="Reinvertir" value={fmtCOP(reinvest)} color="#3B82F6" />
          <Box label="Retirar" value={fmtCOP(withdraw)} color="#22C55E" />
          <Box label="Unidades posibles" value={units.toLocaleString()} color="#F59E0B" />
        </div>
      </div>

      <div className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl p-5">
        <div className="text-sm font-bold mb-4">💰 Pago a Socios</div>
        {partners.length === 0 ? (
          <div className="text-[#94A3B8] text-sm py-4">No hay socios. Agrega socios para ver la distribución.</div>
        ) : partners.map(p => {
          const pct = ownershipPct(p.investment, totalInv)
          const earn = withdraw * (pct / 100)
          return (
            <div key={p.id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-black" style={{ background: p.color }}>
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{p.name}</div>
                <div className="text-[11px] text-[#94A3B8]">{pct.toFixed(1)}% participación</div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-[#22C55E]">{fmtCOP(earn)}</div>
                <div className="text-[10px] text-[#94A3B8]">a recibir</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Box({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/30 rounded-xl p-3 text-center">
      <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</div>
      <div className="text-xl font-black mt-1" style={{ color }}>{value}</div>
    </div>
  )
}
