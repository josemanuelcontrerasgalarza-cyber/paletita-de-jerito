'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Product, InventoryItem, Sale, Partner } from '@/lib/types'
import {
  DEMO_PRODUCTS, DEMO_INVENTORY, DEMO_SALES, DEMO_PARTNERS,
} from '@/lib/demo-data'

function isDemo() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('pp_demo') === 'true'
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (isDemo()) { setProducts(DEMO_PRODUCTS); setLoading(false); return }
    const sb = createClient()
    const { data } = await sb.from('products').select('*').order('created_at')
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { products, setProducts, loading, refetch: fetch }
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (isDemo()) { setInventory(DEMO_INVENTORY); setLoading(false); return }
    const sb = createClient()
    const { data } = await sb.from('inventory').select('*').order('created_at')
    setInventory(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const stockFor = (productId: string) =>
    inventory.find(i => i.product_id === productId)?.qty ?? 0

  return { inventory, setInventory, loading, refetch: fetch, stockFor }
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (isDemo()) { setSales(DEMO_SALES); setLoading(false); return }
    const sb = createClient()
    const { data } = await sb.from('sales').select('*').order('created_at', { ascending: false })
    setSales(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { sales, setSales, loading, refetch: fetch }
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (isDemo()) { setPartners(DEMO_PARTNERS); setLoading(false); return }
    const sb = createClient()
    const { data } = await sb.from('partners').select('*').order('created_at')
    setPartners(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { partners, setPartners, loading, refetch: fetch }
}
