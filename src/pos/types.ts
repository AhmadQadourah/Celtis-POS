export type SaleStatus = 'draft' | 'paid'

export type PaymentMethod = 'cash' | 'card'

export type Product = {
  id: string
  name: string
  sku: string
  priceCents: number
  category?: string
  addons?: Addon[]
}

export type Addon = {
  id: string
  name: string
  priceCents: number
}

export type LineItem = {
  id: string
  productId: string
  name: string
  unitPriceCents: number
  qty: number
  modifiers?: Addon[]
}

export type Payment = {
  method: PaymentMethod
  amountCents: number
  paidAt: number
}

export type Sale = {
  id: string
  status: SaleStatus
  createdAt: number
  updatedAt: number
  items: LineItem[]
  payment?: Payment
  note?: string
}


