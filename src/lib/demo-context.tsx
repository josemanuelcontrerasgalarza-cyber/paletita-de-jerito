'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product, InventoryItem, Sale, Partner } from './types'
import { DEMO_PRODUCTS, DEMO_INVENTORY, DEMO_SALES, DEMO_PARTNERS } from './demo-data'

interface DemoContextType {
  isDemo: boolean
  products: Product[]
  inventory: InventoryItem[]
  sales: Sale[]
  partners: Partner[]
  addProduct: (p: Omit<Product, 'id' | 'user_id' | 'created_at'>) => void
  deleteProduct: (id: string) => void
  addInventory: (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) => void
  addSale: (s: Omit<Sale, 'id' | 'user_id' | 'created_at'>) => void
  addPartner: (p: Omit<Partner, 'id' | 'user_id' | 'created_at'>) => void
}

const DemoContext = createContext<DemoContextType | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemo, setIsDemo] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [partners, setPartners] = useState<Partner[]>([])

  useEffect(() => {
    const demo = localStorage.getItem('pp_demo') === 'true'
    setIsDemo(demo)
    if (demo) {
      setProducts(DEMO_PRODUCTS)
      setInventory(DEMO_INVENTORY)
      setSales(DEMO_SALES)
      setPartners(DEMO_PARTNERS)
    }
  }, [])

  function uid() { return Math.random().toString(36).slice(2) }

  function addProduct(p: Omit<Product, 'id' | 'user_id' | 'created_at'>) {
    setProducts(prev => [...prev, { ...p, id: uid(), user_id: 'demo', created_at: new Date().toISOString() }])
  }

  function deleteProduct(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function addInventory(item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) {
    setInventory(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      if (existing) {
        return prev.map(i => i.product_id === item.product_id ? { ...i, qty: i.qty + item.qty } : i)
      }
      return [...prev, { ...item, id: uid(), user_id: 'demo', created_at: new Date().toISOString() }]
    })
  }

  function addSale(s: Omit<Sale, 'id' | 'user_id' | 'created_at'>) {
    setSales(prev => [{ ...s, id: uid(), user_id: 'demo', created_at: new Date().toISOString() }, ...prev])
    if (s.product_id) {
      setInventory(prev => prev.map(i => i.product_id === s.product_id ? { ...i, qty: Math.max(0, i.qty - s.qty) } : i))
    }
  }

  function addPartner(p: Omit<Partner, 'id' | 'user_id' | 'created_at'>) {
    setPartners(prev => [...prev, { ...p, id: uid(), user_id: 'demo', created_at: new Date().toISOString() }])
  }

  return (
    <DemoContext.Provider value={{ isDemo, products, inventory, sales, partners, addProduct, deleteProduct, addInventory, addSale, addPartner }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
