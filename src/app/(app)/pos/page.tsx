'use client'
import { useState } from 'react'
import { useProducts } from '@/lib/hooks/useProducts'
import { useInventory } from '@/lib/hooks/useInventory'
import { useSales } from '@/lib/hooks/useSales'
import { EmptyState } from '@/components/shared/EmptyState'
import { fmtCOP } from '@/lib/calculations'
import { createClient } from '@/lib/supabase'
import { showToast } from '@/components/shared/Toast'
import { Product } from '@/lib/types'

export default function POSPage() {
  const { products } = useProducts()
  const { inventory, setInventory, refetch: refetchInv } = useInventory()
  const { refetch: refetchSales } = useSales()
  const [cart, setCart] = useState<Record<string, number>>({})

  function stockFor(pid: string) { return inventory.find(i => i.product_id === pid)?.qty ?? 0 }

  function addToCart(pid: string) {
    const available = stockFor(pid)
    const current = cart[pid] || 0
    if (current >= available) { showToast('Sin stock suficiente', 'error'); return }
    setCart(prev => ({ ...prev, [pid]: current + 1 }))
  }

  function changeQty(pid: string, delta: number) {
    setCart(prev => {
      const n = (prev[pid] || 0) + delta
      if (n <= 0) { const { [pid]: _, ...rest } = prev; return rest }
      if (delta > 0 && n > stockFor(pid)) { showToast('Sin stock suficiente', 'error'); return prev }
      return { ...prev, [pid]: n }
    })
  }

  function clearCart() { setCart({}) }

  const cartEntries = Object.entries(cart).map(([pid, qty]) => ({
    product: products.find(p => p.id === pid)!,
    qty,
  })).filter(e => e.product)

  const subtotal = cartEntries.reduce((a, e) => a + e.product.price * e.qty, 0)
  const totalCost = cartEntries.reduce((a, e) => a + e.product.cost * e.qty, 0)
  const profit = subtotal - totalCost

  async function checkout() {
    if (cartEntries.length === 0) { showToast('Carrito vacío', 'error'); return }
    const isDemo = localStorage.getItem('pp_demo') === 'true'
    if (isDemo) {
      setInventory(prev => prev.map(i => {
        const entry = cartEntries.find(e => e.product.id === i.product_id)
        return entry ? { ...i, qty: Math.max(0, i.qty - entry.qty) } : i
      }))
    } else {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      for (const e of cartEntries) {
        await sb.from('sales').insert({
          user_id: user.id,
          product_id: e.product.id,
          product_name: e.product.emoji + ' ' + e.product.name,
          qty: e.qty,
          price_per_unit: e.product.price,
          cost_per_unit: e.product.cost,
          revenue: e.product.price * e.qty,
          profit: (e.product.price - e.product.cost) * e.qty,
        })
        const inv = inventory.find(i => i.product_id === e.product.id)
        if (inv) await sb.from('inventory').update({ qty: Math.max(0, inv.qty - e.qty) }).eq('id', inv.id)
      }
      refetchInv()
      refetchSales()
    }
    showToast(`Cobro exitoso — ${fmtCOP(subtotal)} | Ganancia: ${fmtCOP(profit)}`)
    clearCart()
  }

  if (products.length === 0) {
    return <EmptyState icon="🏷" title="No tienes productos" subtitle="Ve a Productos y agrega tu catálogo primero" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-5">
      {/* Products */}
      <div>
        <div className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-widest mb-3">Productos</div>
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => {
            const stock = stockFor(p.id)
            const inCart = cart[p.id] || 0
            return (
              <div
                key={p.id}
                onClick={() => addToCart(p.id)}
                className={`bg-[#1a2235] border rounded-2xl p-4 cursor-pointer transition-all text-center relative
                  ${inCart > 0 ? 'border-[#3B82F6] bg-[rgba(59,130,246,0.13)]' : 'border-[rgba(59,130,246,0.15)] hover:border-[#3B82F6] hover:bg-[rgba(59,130,246,0.07)]'}`}
              >
                <div className="text-3xl mb-2">{p.emoji}</div>
                <div className="text-xs font-bold mb-0.5">{p.name}</div>
                <div className="text-sm text-[#22C55E] font-bold">{fmtCOP(p.price)}</div>
                <div className="text-[10px] text-[#94A3B8] mt-1">{stock} disponibles</div>
                {inCart > 0 && (
                  <div className="mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/12 text-[#3B82F6] border border-blue-500/20 inline-block">
                    {inCart} en carrito
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-[#1F2937] border border-[rgba(59,130,246,0.15)] rounded-2xl p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold">🛒 Carrito</span>
          <span className="text-[11px] text-[#94A3B8]">{Object.values(cart).reduce((a, b) => a + b, 0)} items</span>
        </div>

        <div className="flex-1 min-h-[120px]">
          {cartEntries.length === 0 ? (
            <div className="text-center py-8 text-[#94A3B8] text-xs">Selecciona un producto</div>
          ) : cartEntries.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center justify-between py-2.5 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold">{product.emoji} {product.name}</div>
                <div className="text-[11px] text-[#94A3B8]">{fmtCOP(product.price)} c/u</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changeQty(product.id, -1)} className="w-6 h-6 rounded-lg border border-[rgba(59,130,246,0.15)] bg-white/4 text-white flex items-center justify-center hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-all text-sm">−</button>
                <span className="text-sm font-bold min-w-[18px] text-center">{qty}</span>
                <button onClick={() => changeQty(product.id, 1)} className="w-6 h-6 rounded-lg border border-[rgba(59,130,246,0.15)] bg-white/4 text-white flex items-center justify-center hover:bg-[#3B82F6] hover:border-[#3B82F6] transition-all text-sm">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[rgba(59,130,246,0.15)]">
          <div className="flex justify-between text-xs mb-2"><span className="text-[#94A3B8]">Subtotal</span><span>{fmtCOP(subtotal)}</span></div>
          <div className="flex justify-between text-xs mb-3"><span className="text-[#94A3B8]">Costo</span><span className="text-[#EF4444]">-{fmtCOP(totalCost)}</span></div>
          <div className="flex justify-between text-lg font-black text-[#22C55E] mb-4"><span>Ganancia</span><span>{fmtCOP(profit)}</span></div>
          <button onClick={checkout} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:opacity-90 transition-all">
            💳 Cobrar
          </button>
          <button onClick={clearCart} className="w-full mt-2 py-2 rounded-xl border border-white/10 bg-white/3 text-[#94A3B8] text-xs font-semibold hover:text-white transition-all">
            🗑 Limpiar carrito
          </button>
        </div>
      </div>
    </div>
  )
}
