'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
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
  const maxQty = Math.max(...inventory.map(i => i.qty), 1)

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
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{inventory.length} productos en stock</div>
        <button
          onClick={() => { if (products.length === 0) { showToast('Primero agrega un producto', 'error'); return } setModalOpen(true) }}
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: '13px' }}
        >
          + Agregar Stock
        </button>
      </div>

      {(low.length > 0 || out.length > 0) && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-2xl text-sm" style={{ background: 'rgba(255,219,60,0.06)', border: '1px solid rgba(255,219,60,0.18)' }}>
          ⚠️ <span><strong style={{ color: '#FFDB3C' }}>{out.length} agotados</strong> · <strong style={{ color: '#FF6B35' }}>{low.length} con stock bajo</strong> — considera comprar pronto.</span>
        </div>
      )}

      {inventory.length === 0 ? (
        <EmptyState icon="📦" title="Sin inventario registrado" subtitle="Agrega stock para comenzar" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {inventory.map((item, i) => {
            const product = products.find(p => p.id === item.product_id)
            const pct = Math.min((item.qty / maxQty) * 100, 100)
            const statusColor = item.qty === 0 ? '#FF4D4F' : item.qty < 10 ? '#FFDB3C' : '#00E29E'
            const statusLabel = item.qty === 0 ? 'Agotado' : item.qty < 10 ? 'Stock bajo' : 'OK'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 relative overflow-hidden"
              >
                {/* Glow accent */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${statusColor}18, transparent 70%)` }} />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{product?.emoji ?? '📦'}</span>
                    <div>
                      <div className="text-sm font-semibold leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{product?.name ?? 'Producto eliminado'}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.supplier || 'Sin proveedor'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                    {statusLabel}
                  </span>
                </div>

                {/* Stock bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span>Stock disponible</span>
                    <span className="font-bold mono" style={{ color: statusColor }}>{item.qty} uds</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.05 + 0.2, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${statusColor}aa, ${statusColor})`, boxShadow: `0 0 8px ${statusColor}60` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Costo/u</div>
                    <div className="text-sm font-semibold mono">{fmtCOP(item.cost_per_unit)}</div>
                  </div>
                  <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Valor total</div>
                    <div className="text-sm font-semibold mono" style={{ color: '#FFDB3C' }}>{fmtCOP(item.qty * item.cost_per_unit)}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <InventoryModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refetch} products={products} demoAdd={demoAdd} />
    </div>
  )
}
