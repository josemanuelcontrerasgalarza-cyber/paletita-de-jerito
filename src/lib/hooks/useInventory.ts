'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { InventoryItem } from '@/lib/types'

const DEMO_INVENTORY: InventoryItem[] = [
  { id: 'i1', user_id: 'demo', product_id: 'p1', qty: 45, cost_per_unit: 800, supplier: 'Proveedor A', created_at: new Date().toISOString() },
  { id: 'i2', user_id: 'demo', product_id: 'p2', qty: 8, cost_per_unit: 800, supplier: 'Proveedor A', created_at: new Date().toISOString() },
  { id: 'i3', user_id: 'demo', product_id: 'p3', qty: 30, cost_per_unit: 1000, supplier: 'Proveedor B', created_at: new Date().toISOString() },
]

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pp_demo') === 'true'

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    if (isDemo) {
      setInventory(DEMO_INVENTORY)
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('inventory').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setInventory(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => { fetchInventory() }, [fetchInventory])

  function stockFor(productId: string): number {
    const item = inventory.find(i => i.product_id === productId)
    return item?.qty ?? 0
  }

  return { inventory, loading, refetch: fetchInventory, stockFor, setInventory }
}
