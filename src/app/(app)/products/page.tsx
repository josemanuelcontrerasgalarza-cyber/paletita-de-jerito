'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '@/lib/hooks/useProducts'
import { useInventory } from '@/lib/hooks/useInventory'
import { ProductModal } from '@/components/modals/ProductModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtCOP, marginPct, profitPerUnit } from '@/lib/calculations'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/components/shared/Toast'

export default function ProductsPage() {
  const { products, refetch, setProducts } = useProducts()
  const { stockFor } = useInventory()
  const [modalOpen, setModalOpen] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) {
      setProducts(prev => prev.filter(p => p.id !== id))
    } else {
      const sb = createClient()
      await sb.from('products').delete().eq('id', id)
      refetch()
    }
    showToast('Producto eliminado')
  }

  function demoAdd(p: { name: string; emoji: string; price: number; cost: number }) {
    const id = Math.random().toString(36).slice(2)
    setProducts(prev => [...prev, { ...p, id, user_id: 'demo', created_at: new Date().toISOString() }])
  }

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
          + Nuevo Producto
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="🏷" title="Sin productos aún" subtitle="Agrega tu primer producto para comenzar" />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map((p, i) => {
            const stock = stockFor(p.id)
            const margin = marginPct(p.price, p.cost)
            const unit_profit = profitPerUnit(p.price, p.cost)
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl p-5 hover:-translate-y-1 transition-transform"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.35)] to-transparent" />
                <div className="text-4xl mb-3">{p.emoji}</div>
                <div className="text-base font-bold mb-3">{p.name}</div>
                <div className="space-y-1 text-xs mb-4">
                  <div className="flex justify-between"><span className="text-[#94A3B8]">Precio</span><span className="text-[#22C55E] font-bold">{fmtCOP(p.price)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94A3B8]">Costo</span><span>{fmtCOP(p.cost)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94A3B8]">Ganancia/u</span><span className="text-[#3B82F6] font-bold">{fmtCOP(unit_profit)}</span></div>
                  <div className="flex justify-between"><span className="text-[#94A3B8]">Margen</span><span>{margin.toFixed(1)}%</span></div>
                </div>
                <div className="flex items-center justify-between">
                  {stock > 0
                    ? <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/12 text-[#22C55E] border border-green-500/20">{stock} en stock</span>
                    : <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/12 text-[#EF4444] border border-red-500/20">Sin stock</span>
                  }
                  <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/12 text-[#EF4444] border border-red-500/25 hover:bg-red-500/20 transition-all">🗑</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <ProductModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refetch} demoAdd={demoAdd} />
    </div>
  )
}
