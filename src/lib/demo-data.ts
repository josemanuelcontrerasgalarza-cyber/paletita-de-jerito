import { Product, InventoryItem, Sale, Partner } from './types'

export const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', user_id: 'demo', name: 'Paleta Limón', emoji: '🍋', price: 3000, cost: 1200, created_at: new Date().toISOString() },
  { id: 'p2', user_id: 'demo', name: 'Paleta Fresa', emoji: '🍓', price: 3500, cost: 1400, created_at: new Date().toISOString() },
  { id: 'p3', user_id: 'demo', name: 'Paleta Mango', emoji: '🥭', price: 4000, cost: 1600, created_at: new Date().toISOString() },
]

export const DEMO_INVENTORY: InventoryItem[] = [
  { id: 'i1', user_id: 'demo', product_id: 'p1', qty: 24, cost_per_unit: 1200, supplier: 'Proveedor Local', created_at: new Date().toISOString() },
  { id: 'i2', user_id: 'demo', product_id: 'p2', qty: 8, cost_per_unit: 1400, supplier: 'Proveedor Local', created_at: new Date().toISOString() },
  { id: 'i3', user_id: 'demo', product_id: 'p3', qty: 15, cost_per_unit: 1600, supplier: null, created_at: new Date().toISOString() },
]

function daysAgo(d: number) {
  const dt = new Date()
  dt.setDate(dt.getDate() - d)
  return dt.toISOString()
}

export const DEMO_SALES: Sale[] = [
  { id: 's1', user_id: 'demo', product_id: 'p1', product_name: 'Paleta Limón', qty: 5, price_per_unit: 3000, cost_per_unit: 1200, revenue: 15000, profit: 9000, created_at: daysAgo(0) },
  { id: 's2', user_id: 'demo', product_id: 'p2', product_name: 'Paleta Fresa', qty: 3, price_per_unit: 3500, cost_per_unit: 1400, revenue: 10500, profit: 6300, created_at: daysAgo(0) },
  { id: 's3', user_id: 'demo', product_id: 'p3', product_name: 'Paleta Mango', qty: 4, price_per_unit: 4000, cost_per_unit: 1600, revenue: 16000, profit: 9600, created_at: daysAgo(1) },
  { id: 's4', user_id: 'demo', product_id: 'p1', product_name: 'Paleta Limón', qty: 6, price_per_unit: 3000, cost_per_unit: 1200, revenue: 18000, profit: 10800, created_at: daysAgo(1) },
  { id: 's5', user_id: 'demo', product_id: 'p2', product_name: 'Paleta Fresa', qty: 2, price_per_unit: 3500, cost_per_unit: 1400, revenue: 7000, profit: 4200, created_at: daysAgo(2) },
  { id: 's6', user_id: 'demo', product_id: 'p3', product_name: 'Paleta Mango', qty: 5, price_per_unit: 4000, cost_per_unit: 1600, revenue: 20000, profit: 12000, created_at: daysAgo(2) },
  { id: 's7', user_id: 'demo', product_id: 'p1', product_name: 'Paleta Limón', qty: 8, price_per_unit: 3000, cost_per_unit: 1200, revenue: 24000, profit: 14400, created_at: daysAgo(3) },
  { id: 's8', user_id: 'demo', product_id: 'p2', product_name: 'Paleta Fresa', qty: 4, price_per_unit: 3500, cost_per_unit: 1400, revenue: 14000, profit: 8400, created_at: daysAgo(4) },
  { id: 's9', user_id: 'demo', product_id: 'p3', product_name: 'Paleta Mango', qty: 3, price_per_unit: 4000, cost_per_unit: 1600, revenue: 12000, profit: 7200, created_at: daysAgo(5) },
  { id: 's10', user_id: 'demo', product_id: 'p1', product_name: 'Paleta Limón', qty: 7, price_per_unit: 3000, cost_per_unit: 1200, revenue: 21000, profit: 12600, created_at: daysAgo(6) },
]

export const DEMO_PARTNERS: Partner[] = []
