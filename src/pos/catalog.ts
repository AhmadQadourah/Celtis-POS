import type { Product } from './types'
import { useCatalogStore } from '../stores/catalog'

// Export a getter function that returns products from the store
// This maintains backward compatibility with existing imports
export function getCatalog(): Product[] {
  const store = useCatalogStore()
  return store.products
}

// For backward compatibility, export as computed-like access
export const catalog = {
  get value() {
    return getCatalog()
  },
}


