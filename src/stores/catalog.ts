import { defineStore } from 'pinia'
import type { Addon, Product } from '../pos/types'

const CATALOG_STORAGE_KEY = 'celtis.catalog.v1'

const defaultProducts: Product[] = [
  {
    id: 'p_espresso',
    name: 'Espresso',
    sku: 'COF-ESP',
    priceCents: 900,
    category: 'Coffee',
    addons: [
      { id: 'a_extra_shot', name: 'Extra shot', priceCents: 300 },
      { id: 'a_decaf', name: 'Decaf', priceCents: 0 },
    ],
  },
  {
    id: 'p_latte',
    name: 'Latte',
    sku: 'COF-LAT',
    priceCents: 1400,
    category: 'Coffee',
    addons: [
      { id: 'a_oat_milk', name: 'Oat milk', priceCents: 200 },
      { id: 'a_vanilla', name: 'Vanilla syrup', priceCents: 150 },
      { id: 'a_extra_shot', name: 'Extra shot', priceCents: 300 },
    ],
  },
  {
    id: 'p_cappuccino',
    name: 'Cappuccino',
    sku: 'COF-CAP',
    priceCents: 1400,
    category: 'Coffee',
    addons: [
      { id: 'a_oat_milk', name: 'Oat milk', priceCents: 200 },
      { id: 'a_cinnamon', name: 'Cinnamon', priceCents: 50 },
    ],
  },
  { id: 'p_water', name: 'Water (500ml)', sku: 'DRK-WAT', priceCents: 500, category: 'Drinks' },
  { id: 'p_sparkling', name: 'Sparkling Water', sku: 'DRK-SPK', priceCents: 700, category: 'Drinks' },
  { id: 'p_croissant', name: 'Butter Croissant', sku: 'BKE-CRO', priceCents: 1200, category: 'Bakery' },
  { id: 'p_cookie', name: 'Chocolate Cookie', sku: 'BKE-CKY', priceCents: 800, category: 'Bakery' },
  { id: 'p_sandwich', name: 'Turkey Sandwich', sku: 'FOD-SND', priceCents: 2200, category: 'Food' },
]

function loadCatalog(): Product[] {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY)
    if (!raw) return defaultProducts
    const parsed = JSON.parse(raw) as Product[]
    return parsed && Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProducts
  } catch {
    return defaultProducts
  }
}

function saveCatalog(products: Product[]): void {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(products))
  } catch {
    console.error('Failed to save catalog to localStorage')
  }
}

function newProductId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function newAddonId(): string {
  return `a_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: loadCatalog(),
  }),
  getters: {
    productsByCategory(state): Record<string, Product[]> {
      const grouped: Record<string, Product[]> = {}
      for (const product of state.products) {
        const cat = product.category || 'Uncategorized'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(product)
      }
      return grouped
    },
  },
  actions: {
    _persist() {
      saveCatalog(this.products)
    },

    addProduct(product: Omit<Product, 'id'>): Product {
      const newProduct: Product = {
        ...product,
        id: newProductId(),
        addons: product.addons || [],
      }
      this.products = [...this.products, newProduct]
      this._persist()
      return newProduct
    },

    updateProduct(productId: string, updates: Partial<Omit<Product, 'id'>>): void {
      const idx = this.products.findIndex((p) => p.id == productId)
      if (idx == -1) return
      const updated = [...this.products]
      updated[idx] = { ...updated[idx]!, ...updates }
      this.products = updated
      this._persist()
    },

    deleteProduct(productId: string): void {
      this.products = this.products.filter((p) => p.id !== productId)
      this._persist()
    },

    addAddon(productId: string, addon: Omit<Addon, 'id'>): void {
      const product = this.products.find((p) => p.id == productId)
      if (!product) return
      const newAddon: Addon = {
        ...addon,
        id: newAddonId(),
      }
      const addons = [...(product.addons || []), newAddon]
      this.updateProduct(productId, { addons })
    },

    updateAddon(productId: string, addonId: string, updates: Partial<Omit<Addon, 'id'>>): void {
      const product = this.products.find((p) => p.id == productId)
      if (!product || !product.addons) return
      const addons = product.addons.map((a) => (a.id == addonId ? { ...a, ...updates } : a))
      this.updateProduct(productId, { addons })
    },

    deleteAddon(productId: string, addonId: string): void {
      const product = this.products.find((p) => p.id == productId)
      if (!product || !product.addons) return
      const addons = product.addons.filter((a) => a.id !== addonId)
      this.updateProduct(productId, { addons: addons.length > 0 ? addons : undefined })
    },

    resetToDefault(): void {
      this.products = defaultProducts
      this._persist()
    },
  },
})

