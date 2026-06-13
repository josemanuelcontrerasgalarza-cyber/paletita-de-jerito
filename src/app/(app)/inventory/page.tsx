'use client'
import { useState } from 'react'
import { useInventory } from '@/lib/hooks/useInventory'
import { useProducts } from '@/lib/hooks/useProducts'
import { InventoryModal } from '@/components/modals/InventoryModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtCOP } from '@/lib/calculations'
import { showToast } from '@/components/shared/Toast'

export default function InventoryPage() {
  const { inventory, refetch, setInventory } = useInventory()
  const { products } = useProducts()
  const [modalOpen, setModalOpen] = useState(false)

  const low = inventory.filter(i => i.qty > 0 && i.qty < 10)
  const out = inventory.filter(i => i.qty === 0)

  function demoAdd(item: { product_id: string; qty: number; cost_per_unit: number; supplier: string | null }) {
    setInventory(prev => {
      const exists = prev.find(i => i.product_id === item.product_id)
      if (exists) return prev.map(i => i.product_id === item.product_id ? { ...i, qty: i.qty + item.qty } : i)
      return [...prev, { ...item, id: Math.random().toString(36).slice(2), user_id: 'demo', created_at: new Date().toISOString() }]
    })
    showToast(`Inventario actualizado +${item.qty} unidades`)
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => { if (products.length === 0) { showToast('Primero agrega un producto', 'error'); return } setModalOpen(true) }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          + Agregar Stock
        </button>
      </div>

      {(low.length > 0 || out.length > 0) && (
        <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-yellow-500/7 border border-yellow-500/22 rounded-xl text-sm">
          ⚠️ <strong>{out.length} agotados, {low.length} con stock bajo.</strong> Considera comprar más pronto.
        </div>
      )}

      <div className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(59,130,246,0.15)]">
          <div className="text-sm font-bold">📦 Stock Actual</div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Producto','Disponibles','Costo/u','Valor Stock','Proveedor','Estado'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-[#94A3B8] font-semibold bg-white/[0.02]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr><td colSpan={6} className="py-12"><EmptyState icon="📦" title="Sin inventario registrado" subtitle="Agrega stock para comenzar" /></td></tr>
            ) : inventory.map(item => {
              const product = products.find(p => p.id === item.product_id)
              const status = item.qty === 0
                ? <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/12 text-[#EF4444] border border-red-500/20">Agotado</span>
                : item.qty < 10
                ? <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-yellow-500/12 text-[#F59E0B] border border-yellow-500/20">Bajo</span>
                : <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/12 text-[#22C55E] border border-green-500/20">OK</span>
              return (
                <tr key={item.id} className="hover:bg-blue-500/3 transition-colors border-t border-white/[0.04]">
                  <td className="px-5 py-3 text-sm font-semibold">{product ? `${product.emoji} ${product.name}` : 'Producto eliminado'}</td>
                  <td className="px-5 py-3 text-sm font-bold">{item.qty}</td>
                  <td className="px-5 py-3 text-sm">{fmtCOP(item.cost_per_unit)}</td>
                  <td className="px-5 py-3 text-sm">{fmtCOP(item.qty * item.cost_per_unit)}</td>
                  <td className="px-5 py-3 text-sm text-[#94A3B8]">{item.supplier || '—'}</td>
                  <td className="px-5 py-3">{status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <InventoryModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refetch} products={products} demoAdd={demoAdd} />
    </div>
  )
}
