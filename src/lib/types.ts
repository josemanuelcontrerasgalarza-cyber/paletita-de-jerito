export interface Profile {
  id: string
  name: string
  biz_name: string
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  emoji: string
  price: number
  cost: number
  created_at: string
}

export interface InventoryItem {
  id: string
  user_id: string
  product_id: string
  qty: number
  cost_per_unit: number
  supplier: string | null
  created_at: string
}

export interface Sale {
  id: string
  user_id: string
  product_id: string | null
  product_name: string
  qty: number
  price_per_unit: number
  cost_per_unit: number
  revenue: number
  profit: number
  created_at: string
}

export interface Partner {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  investment: number
  notes: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  qty: number
}
