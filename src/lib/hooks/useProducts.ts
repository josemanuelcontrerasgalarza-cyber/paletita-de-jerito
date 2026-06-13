'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Product } from '@/lib/types'

// Demo products for demo mode
const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', user_id: 'demo', name: 'Paleta Limón', emoji: '🍋', price: 2500, cost: 800, created_at: new Date().toISOString() },
  { id: 'p2', user_id: 'demo', name: 'Paleta Fresa', emoji: '🍓', price: 2500, cost: 800, created_at: new Date().toISOString() },
  { id: 'p3', user_id: 'demo', name: 'Paleta Mango', emoji: '🥭', price: 3000, cost: 1000, created_at: new Date().toISOString() },
]

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const isDemo = typeof window !== 'undefined' && localStorage.getItem('pp_demo') === 'true'

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    if (isDemo) {
      setProducts(DEMO_PRODUCTS)
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setProducts(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { products, loading, refetch: fetchProducts, setProducts }
}
