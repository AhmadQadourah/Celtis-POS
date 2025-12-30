import type { Product } from './types'

export const catalog: Product[] = [
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


