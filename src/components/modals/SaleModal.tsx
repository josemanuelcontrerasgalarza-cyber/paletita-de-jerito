'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { fmtCOP, saleRevenue, saleProfit } from '@/lib/calculations'
import { showToast } from '@/components/shared/Toast'
import { useProducts } from '@/lib/hooks/useProducts'
import { useInventory } from '@/lib/hooks/useInventory'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function SaleModal({ open, onClose, onSaved }: Props) {
  const { products } = useProducts()
  const { inventory, setInventory, refetch: refetchInv } = useInventory()
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState('1')
  const [loading, setLoading] = useState(false)

  const pid = productId || products[0]?.id
  const product = products.find(p => p.id === pid)
  const q = parseInt(qty) || 1
  const rev = product ? saleRevenue(q, product.price) : 0
  const profit = product ? saleProfit(q, product.price, product.cost) : 0

  async function handleSave() {
    if (!product) { showToast('Selecciona un producto', 'error'); return }
    setLoading(true)
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    const saleData = {
      product_id: product.id,
      product_name: product.emoji + ' ' + product.name,
      qty: q,
      price_per_unit: product.price,
      cost_per_unit: product.cost,
      revenue: rev,
      profit,
    }
    if (isDemo) {
      setInventory(prev => prev.map(i => i.product_id === product.id ? { ...i, qty: Math.max(0, i.qty - q) } : i))
    } else {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { showToast('No autenticado', 'error'); setLoading(false); return }
      await sb.from('sales').insert({ user_id: user.id, ...saleData })
      const invItem = inventory.find(i => i.product_id === product.id)
      if (invItem) {
        await sb.from('inventory').update({ qty: Math.max(0, invItem.qty - q) }).eq('id', invItem.id)
      }
      await refetchInv()
    }
    showToast(`Venta registrada — ${fmtCOP(rev)}`)
    setQty('1')
    setLoading(false)
    onSaved?.()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass specular w-full sm:w-[440px] max-w-[95vw] rounded-t-3xl sm:rounded-3xl p-7 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,226,158,0.6), rgba(255,107,53,0.4), transparent)' }} />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>✕</button>

            <div className="text-lg font-bold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>💰 Registrar Venta</div>
            <div className="text-xs mb-5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 300 }}>Ingresa los detalles de la venta</div>

            <Field label="Producto">
              <select value={pid} onChange={e => setProductId(e.target.value)} className="input-glass">
                {products.map(p => <option key={p.id} value={p.id} style={{ background: '#131318' }}>{p.emoji} {p.name}</option>)}
              </select>
            </Field>
            <div className="mt-3">
              <Field label="Cantidad">
                <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="1" className="input-glass" />
              </Field>
            </div>

            {product && (
              <div className="rounded-2xl p-4 mt-4 mb-5" style={{ background: 'rgba(0,226,158,0.05)', border: '1px solid rgba(0,226,158,0.12)' }}>
                <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>Precio unitario</span><span className="mono">{fmtCOP(product.price)}</span></div>
                <div className="flex justify-between text-xs py-1"><span style={{ color: 'var(--text-muted)' }}>Costo unitario</span><span className="mono">{fmtCOP(product.cost)}</span></div>
                <div className="flex justify-between text-xs py-1.5 mt-1 border-t font-semibold" style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#00E29E' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Ingreso total</span>
                  <span className="mono">{fmtCOP(rev)}</span>
                </div>
                <div className="flex justify-between text-xs py-0.5 font-semibold" style={{ color: '#FF6B35' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Ganancia</span>
                  <span className="mono">{fmtCOP(profit)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading || products.length === 0} className="btn-primary flex-1">
                {loading ? 'Guardando...' : '✅ Confirmar'}
              </button>
              <button onClick={onClose} className="btn-glass px-5">Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'Inter' }}>{label}</label>
      {children}
    </div>
  )
}
