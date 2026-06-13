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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-[#111827] border border-purple-500/20 rounded-2xl p-7 w-[440px] max-w-[95vw]"
          >
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-purple-500 to-blue-500" />
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 text-[#94A3B8] hover:text-white text-sm flex items-center justify-center">✕</button>
            <div className="text-lg font-black mb-1">💰 Registrar Venta</div>
            <div className="text-xs text-[#94A3B8] mb-5">Ingresa los detalles de la venta</div>
            <Field label="Producto">
              <select value={pid} onChange={e => setProductId(e.target.value)} className={inp}>
                {products.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </Field>
            <Field label="Cantidad" cls="mt-3">
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} min="1" className={inp} />
            </Field>
            {product && (
              <div className="bg-blue-500/5 border border-[rgba(59,130,246,0.15)] rounded-xl p-3 mt-4 mb-5">
                <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">Precio unitario</span><span>{fmtCOP(product.price)}</span></div>
                <div className="flex justify-between text-xs py-1"><span className="text-[#94A3B8]">Costo unitario</span><span>{fmtCOP(product.cost)}</span></div>
                <div className="flex justify-between text-xs py-1 border-t border-white/5 mt-1 pt-2 font-bold text-[#22C55E]"><span className="text-[#94A3B8] font-normal">Ingreso total</span><span>{fmtCOP(rev)}</span></div>
                <div className="flex justify-between text-xs py-0.5 font-semibold text-[#3B82F6]"><span className="text-[#94A3B8] font-normal">Ganancia</span><span>{fmtCOP(profit)}</span></div>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={handleSave} disabled={loading || products.length === 0} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
                ✅ Confirmar
              </button>
              <button onClick={onClose} className="px-4 rounded-xl border border-white/10 bg-white/4 text-[#94A3B8] text-sm font-semibold hover:text-white transition-all">Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children, cls = '' }: { label: string; children: React.ReactNode; cls?: string }) {
  return (
    <div className={cls}>
      <label className="block text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  )
}

const inp = 'w-full bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500 transition-all placeholder:text-white/20'
