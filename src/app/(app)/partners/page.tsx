'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePartners } from '@/lib/hooks/usePartners'
import { useSales } from '@/lib/hooks/useSales'
import { PartnerModal } from '@/components/modals/PartnerModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtCOP, ownershipPct, partnerEarnings } from '@/lib/calculations'
import { Partner } from '@/lib/types'

export default function PartnersPage() {
  const { partners, refetch, setPartners } = usePartners()
  const { sales } = useSales()
  const [modalOpen, setModalOpen] = useState(false)

  const totalProfit = sales.reduce((a, s) => a + s.profit, 0)
  const totalInv = partners.reduce((a, p) => a + p.investment, 0)

  function demoAdd(p: Omit<Partner, 'id' | 'user_id' | 'created_at'>) {
    setPartners(prev => [...prev, { ...p, id: Math.random().toString(36).slice(2), user_id: 'demo', created_at: new Date().toISOString() }])
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
          + Agregar Socio
        </button>
      </div>

      {partners.length === 0 ? (
        <EmptyState icon="👥" title="Sin socios aún" subtitle="Agrega tus socios inversores para ver la distribución de ganancias" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {partners.map((p, i) => {
            const pct = ownershipPct(p.investment, totalInv)
            const earnings = partnerEarnings(totalProfit, pct)
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-black" style={{ background: p.color }}>
                    {p.emoji}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-[11px] text-[#94A3B8]">{new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white/3 rounded-xl p-3">
                    <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Inversión</div>
                    <div className="text-base font-bold text-[#3B82F6] mt-0.5">{fmtCOP(p.investment)}</div>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3">
                    <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Ganancias</div>
                    <div className="text-base font-bold text-[#22C55E] mt-0.5">{fmtCOP(earnings)}</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#94A3B8]">Participación</span>
                  <span className="text-[#3B82F6] font-bold">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/7 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
                </div>
                {p.notes && (
                  <div className="mt-3 text-[11px] text-[#94A3B8] bg-white/3 rounded-lg px-3 py-2">{p.notes}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      <PartnerModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refetch} existingPartners={partners} demoAdd={demoAdd} />
    </div>
  )
}
