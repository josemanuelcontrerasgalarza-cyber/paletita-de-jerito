'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { InventoryItem } from '@/lib/types'

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pp_demo') === 'true'

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    if (isDemo) {
      setInventory([])
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
