'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Sale } from '@/lib/types'

const now = new Date()
const DEMO_SALES: Sale[] = Array.from({ length: 10 }, (_, i) => ({
  id: `s${i}`,
  user_id: 'demo',
  product_id: i % 3 === 0 ? 'p1' : i % 3 === 1 ? 'p2' : 'p3',
  product_name: i % 3 === 0 ? 'Paleta Limón' : i % 3 === 1 ? 'Paleta Fresa' : 'Paleta Mango',
  qty: Math.floor(Math.random() * 5) + 1,
  price_per_unit: i % 3 === 2 ? 3000 : 2500,
  cost_per_unit: i % 3 === 2 ? 1000 : 800,
  revenue: (i % 3 === 2 ? 3000 : 2500) * (Math.floor(Math.random() * 5) + 1),
  profit: (i % 3 === 2 ? 2000 : 1700) * (Math.floor(Math.random() * 5) + 1),
  created_at: new Date(now.getTime() - i * 3600000).toISOString(),
}))

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pp_demo') === 'true'

  const fetchSales = useCallback(async () => {
    setLoading(true)
    if (isDemo) {
      setSales(DEMO_SALES)
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('sales').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setSales(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => { fetchSales() }, [fetchSales])

  return { sales, loading, refetch: fetchSales, setSales }
}
