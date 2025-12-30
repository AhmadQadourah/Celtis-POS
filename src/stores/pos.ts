import { defineStore } from 'pinia'
import type { Addon, LineItem, PaymentMethod, Product, Sale } from '../pos/types'
import { clampInt } from '../pos/money'
import { loadPosState, savePosState } from '../pos/storage'

function now(): number {
  return Date.now()
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function createSale(): Sale {
  const time = now()
  return {
    id: newId('sale'),
    status: 'draft',
    createdAt: time,
    updatedAt: time,
    items: [],
  }
}

function touchSale(sale: Sale): Sale {
  return { ...sale, updatedAt: now() }
}

function getModifiersSignature(modifiers?: Addon[]): string {
  if (!modifiers || modifiers.length == 0) return ''
  return modifiers
    .map((modifier) => modifier.id)
    .slice()
    .sort()
    .join(',')
}

function priceWithMods(product: Product, mods?: Addon[]): number {
  const extra = (mods ?? []).reduce((sum, m) => sum + (m.priceCents ?? 0), 0)
  return product.priceCents + extra
}

function upsertLineItem(items: LineItem[], product: Product, mods?: Addon[]): LineItem[] {
  const signature = getModifiersSignature(mods)
  const idx = items.findIndex((x) => x.productId == product.id && getModifiersSignature(x.modifiers) == signature)
  if (idx == -1) {
    return [
      ...items,
      {
        id: newId('line'),
        productId: product.id,
        name: product.name,
        unitPriceCents: priceWithMods(product, mods),
        qty: 1,
        modifiers: mods && mods.length > 0 ? mods : undefined,
      },
    ]
  }

  const updated = [...items]
  const current = updated[idx]!
  updated[idx] = { ...current, qty: current.qty + 1 }
  return updated
}

export const usePosStore = defineStore('pos', {
  state: () => {
    const persisted = typeof window !== 'undefined' ? loadPosState() : null

    const activeSale = persisted?.activeSale ?? createSale()
    const drafts = persisted?.drafts ?? []
    const history = persisted?.history ?? []

    return {
      activeSale,
      drafts,
      history,
      taxRateBps: 800, // 8.00% (simple demo tax)
      _hydrated: true as boolean,
    }
  },
  getters: {
    activeItemCount(state): number {
      return state.activeSale.items.reduce((sum, x) => sum + x.qty, 0)
    },
    activeSubtotalCents(state): number {
      return state.activeSale.items.reduce((sum, x) => sum + x.unitPriceCents * x.qty, 0)
    },
    activeTaxCents(state): number {
      return Math.round((this.activeSubtotalCents * state.taxRateBps) / 10_000)
    },
    activeTotalCents(): number {
      return this.activeSubtotalCents + this.activeTaxCents
    },
  },
  actions: {
    _persist() {
      if (!this._hydrated) return
      savePosState({
        version: 1,
        activeSale: this.activeSale,
        drafts: this.drafts,
        history: this.history,
      })
    },

    newSale() {
      this.activeSale = createSale()
      this._persist()
    },

    addProduct(product: Product, mods?: Addon[]) {
      this.activeSale = touchSale({
        ...this.activeSale,
        items: upsertLineItem(this.activeSale.items, product, mods),
      })
      this._persist()
    },

    setLineQty(lineId: string, qty: number) {
      const normalized = clampInt(qty, 0, 999)
      const items =
        normalized <= 0
          ? this.activeSale.items.filter((x) => x.id !== lineId)
          : this.activeSale.items.map((x) => (x.id == lineId ? { ...x, qty: normalized } : x))
      this.activeSale = touchSale({ ...this.activeSale, items })
      this._persist()
    },

    removeLine(lineId: string) {
      this.activeSale = touchSale({ ...this.activeSale, items: this.activeSale.items.filter((x) => x.id !== lineId) })
      this._persist()
    },

    parkActiveSale() {
      const hasItems = this.activeSale.items.length > 0
      if (!hasItems) return
      this.drafts = [touchSale(this.activeSale), ...this.drafts]
      this.activeSale = createSale()
      this._persist()
    },

    resumeDraft(saleId: string) {
      const idx = this.drafts.findIndex((s) => s.id == saleId)
      if (idx == -1) return
      const sale = this.drafts[idx]!
      this.drafts = this.drafts.filter((s) => s.id !== saleId)
      this.activeSale = touchSale(sale)
      this._persist()
    },

    deleteDraft(saleId: string) {
      this.drafts = this.drafts.filter((s) => s.id !== saleId)
      this._persist()
    },

    payActiveSale(method: PaymentMethod) {
      if (this.activeSale.items.length == 0) return
      const paid: Sale = {
        ...touchSale(this.activeSale),
        status: 'paid',
        payment: {
          method,
          amountCents: this.activeTotalCents,
          paidAt: now(),
        },
      }
      this.history = [paid, ...this.history].slice(0, 50)
      this.activeSale = createSale()
      this._persist()
    },

    clearAllData() {
      this.activeSale = createSale()
      this.drafts = []
      this.history = []
      this._persist()
    },
  },
})


