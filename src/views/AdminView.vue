<script setup>
import { computed, ref } from 'vue'
import { useCatalogStore } from '../stores/catalog'
import { useI18n } from '../i18n/useI18n'
import { formatMoney } from '../pos/money'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Badge from '../components/ui/Badge.vue'
import { useConfirmationStore } from '../stores/confirmation'
import { useToastStore } from '../stores/toast'

const catalog = useCatalogStore()
const { t, locale } = useI18n()
const confirmation = useConfirmationStore()
const toast = useToastStore()

const showProductForm = ref(false)
const showAddonForm = ref(false)
const editingProduct = ref(null)
const editingProductId = ref(null)
const editingAddonId = ref(null)

const productForm = ref({
  name: '',
  sku: '',
  priceCents: 0,
  category: '',
})

const addonForm = ref({
  name: '',
  priceCents: 0,
})

const productsByCategory = computed(() => {
  const grouped = {}
  for (const product of catalog.products) {
    const cat = product.category || 'Uncategorized'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(product)
  }
  return grouped
})

const openProductForm = (product = null) => {
  editingProduct.value = product
  editingProductId.value = product?.id || null
  if (product) {
    productForm.value = {
      name: product.name,
      sku: product.sku,
      priceCents: product.priceCents,
      category: product.category || '',
    }
  } else {
    productForm.value = {
      name: '',
      sku: '',
      priceCents: 0,
      category: '',
    }
  }
  showProductForm.value = true
}

const closeProductForm = () => {
  showProductForm.value = false
  editingProduct.value = null
  editingProductId.value = null
  productForm.value = { name: '', sku: '', priceCents: 0, category: '' }
}

const saveProduct = () => {
  if (!productForm.value.name || !productForm.value.sku) {
    toast.show('Name and SKU are required', { tone: 'danger' })
    return
  }
  if (productForm.value.priceCents < 0) {
    toast.show('Price cannot be negative', { tone: 'danger' })
    return
  }

  if (editingProductId.value) {
    catalog.updateProduct(editingProductId.value, {
      name: productForm.value.name,
      sku: productForm.value.sku,
      priceCents: Math.round(productForm.value.priceCents),
      category: productForm.value.category || undefined,
      addons: editingProduct.value?.addons || [],
    })
    toast.show('Product updated', { tone: 'success' })
  } else {
    catalog.addProduct({
      name: productForm.value.name,
      sku: productForm.value.sku,
      priceCents: Math.round(productForm.value.priceCents),
      category: productForm.value.category || undefined,
      addons: [],
    })
    toast.show('Product added', { tone: 'success' })
  }
  closeProductForm()
}

const deleteProduct = async (productId) => {
  const ok = await confirmation.ask({
    title: 'Delete Product?',
    message: 'This will permanently delete the product and all its addons.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (ok) {
    catalog.deleteProduct(productId)
    toast.show('Product deleted', { tone: 'neutral' })
  }
}

const openAddonForm = (productId, addon = null) => {
  editingProductId.value = productId
  editingAddonId.value = addon?.id || null
  if (addon) {
    addonForm.value = {
      name: addon.name,
      priceCents: addon.priceCents,
    }
  } else {
    addonForm.value = {
      name: '',
      priceCents: 0,
    }
  }
  showAddonForm.value = true
}

const closeAddonForm = () => {
  showAddonForm.value = false
  editingProductId.value = null
  editingAddonId.value = null
  addonForm.value = { name: '', priceCents: 0 }
}

const saveAddon = () => {
  if (!addonForm.value.name) {
    toast.show('Addon name is required', { tone: 'danger' })
    return
  }
  if (addonForm.value.priceCents < 0) {
    toast.show('Price cannot be negative', { tone: 'danger' })
    return
  }

  if (editingAddonId.value) {
    catalog.updateAddon(editingProductId.value, editingAddonId.value, {
      name: addonForm.value.name,
      priceCents: Math.round(addonForm.value.priceCents),
    })
    toast.show('Addon updated', { tone: 'success' })
  } else {
    catalog.addAddon(editingProductId.value, {
      name: addonForm.value.name,
      priceCents: Math.round(addonForm.value.priceCents),
    })
    toast.show('Addon added', { tone: 'success' })
  }
  closeAddonForm()
}

const deleteAddon = async (productId, addonId) => {
  const ok = await confirmation.ask({
    title: 'Delete Addon?',
    message: 'This will permanently delete the addon.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (ok) {
    catalog.deleteAddon(productId, addonId)
    toast.show('Addon deleted', { tone: 'neutral' })
  }
}

const resetCatalog = async () => {
  const ok = await confirmation.ask({
    title: 'Reset Catalog?',
    message: 'This will restore the default products and delete all custom products.',
    confirmLabel: 'Reset',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (ok) {
    catalog.resetToDefault()
    toast.show('Catalog reset to default', { tone: 'success' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <Card :padded="false" class="overflow-hidden">
      <div class="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Product Catalog</h2>
            <div class="mt-1 text-sm text-slate-300">Manage products and addons</div>
          </div>
          <div class="flex gap-2">
            <Badge class="bg-white/20 text-white border-white/30">{{ catalog.products.length }} products</Badge>
            <Button variant="secondary" size="sm" class="bg-white/10 text-white hover:bg-white/20" @click="resetCatalog">Reset to Default</Button>
            <Button variant="primary" size="sm" class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="openProductForm()">+ Add Product</Button>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="catalog.products.length === 0" class="py-16 text-center">
          <p class="text-base font-bold text-slate-900">No products</p>
          <p class="mt-1.5 text-sm text-slate-500">Add your first product to get started.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="(products, category) in productsByCategory" :key="category" class="space-y-3">
            <h3 class="text-sm font-bold uppercase tracking-wide text-slate-500">{{ category }}</h3>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="product in products"
                :key="product.id"
                class="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-5 shadow-md transition-all hover:border-indigo-300 hover:shadow-lg"
              >
                <div class="mb-4 flex items-start justify-between">
                  <div>
                    <h4 class="text-lg font-bold text-slate-900">{{ product.name }}</h4>
                    <div class="mt-1 text-xs font-medium text-slate-500">{{ product.sku }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-slate-900">{{ formatMoney(product.priceCents, { locale: locale.value }) }}</div>
                  </div>
                </div>

                <div v-if="product.addons && product.addons.length > 0" class="mb-4 space-y-2">
                  <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">Addons</div>
                  <div class="space-y-1.5">
                    <div v-for="addon in product.addons" :key="addon.id" class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-slate-900">{{ addon.name }}</div>
                        <div class="text-xs text-slate-500">{{ formatMoney(addon.priceCents, { locale: locale.value }) }}</div>
                      </div>
                      <div class="flex gap-1">
                        <button
                          @click="openAddonForm(product.id, addon)"
                          class="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          @click="deleteAddon(product.id, addon.id)"
                          class="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" block class="mt-2" @click="openAddonForm(product.id)">+ Add Addon</Button>
                </div>
                <div v-else class="mb-4">
                  <Button variant="secondary" size="sm" block @click="openAddonForm(product.id)">+ Add Addon</Button>
                </div>

                <div class="flex gap-2">
                  <Button variant="primary" block class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="openProductForm(product)">Edit</Button>
                  <Button variant="secondary" block class="font-bold" @click="deleteProduct(product.id)">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <!-- Product Form Modal -->
  <div v-if="showProductForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeProductForm">
    <Card class="w-full max-w-md">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-slate-900">{{ editingProductId ? 'Edit Product' : 'Add Product' }}</h3>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name *</label>
          <input
            v-model="productForm.name"
            type="text"
            class="mt-1 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="Product name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">SKU *</label>
          <input
            v-model="productForm.sku"
            type="text"
            class="mt-1 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="Product SKU"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Price (cents)</label>
          <input
            v-model.number="productForm.priceCents"
            type="number"
            min="0"
            step="1"
            class="mt-1 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="0"
          />
          <div class="mt-1 text-xs text-slate-500">{{ formatMoney(productForm.priceCents || 0, { locale: locale.value }) }}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Category</label>
          <input
            v-model="productForm.category"
            type="text"
            class="mt-1 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="Category (optional)"
          />
        </div>
        <div class="flex gap-2">
          <Button variant="primary" block class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="saveProduct">Save</Button>
          <Button variant="secondary" block class="font-bold" @click="closeProductForm">Cancel</Button>
        </div>
      </div>
    </Card>
  </div>

  <!-- Addon Form Modal -->
  <div v-if="showAddonForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="closeAddonForm">
    <Card class="w-full max-w-md">
      <div class="mb-4">
        <h3 class="text-lg font-bold text-slate-900">{{ editingAddonId ? 'Edit Addon' : 'Add Addon' }}</h3>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700">Name *</label>
          <input
            v-model="addonForm.name"
            type="text"
            class="mt-1 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="Addon name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Price (cents)</label>
          <input
            v-model.number="addonForm.priceCents"
            type="number"
            min="0"
            step="1"
            class="mt-1 w-full rounded-lg border-2 border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            placeholder="0"
          />
          <div class="mt-1 text-xs text-slate-500">{{ formatMoney(addonForm.priceCents || 0, { locale: locale.value }) }}</div>
        </div>
        <div class="flex gap-2">
          <Button variant="primary" block class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="saveAddon">Save</Button>
          <Button variant="secondary" block class="font-bold" @click="closeAddonForm">Cancel</Button>
        </div>
      </div>
    </Card>
  </div>
</template>

