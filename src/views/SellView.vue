<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { catalog } from '../pos/catalog'
import { formatMoney } from '../pos/money'
import { usePosStore } from '../stores/pos'
import { useI18n } from '../i18n/useI18n'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Kbd from '../components/ui/Kbd.vue'
import AddonsModal from '../components/AddonsModal.vue'
import { useToastStore } from '../stores/toast'
import { useConfirmationStore } from '../stores/confirmation'

const pos = usePosStore()
const { t, locale } = useI18n()
const toast = useToastStore()
const confirmation = useConfirmationStore()

const query = ref('')
const searchEl = ref(null)
const productEls = ref([])
const activeProductIndex = ref(-1)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return catalog
  return catalog.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q))
})

const addonsOpen = ref(false)
const addonsProduct = ref(null)
const selectedAddonIds = ref([])

const openAddons = (product) => {
  addonsProduct.value = product
  selectedAddonIds.value = []
  addonsOpen.value = true
}

const toggleAddon = (addonId) => {
  const current = selectedAddonIds.value
  selectedAddonIds.value = current.includes(addonId)
    ? current.filter((x) => x !== addonId)
    : [...current, addonId]
}

const confirmAddons = () => {
  const product = addonsProduct.value
  if (!product) return
  const addons = (product.addons ?? []).filter((a) => selectedAddonIds.value.includes(a.id))
  pos.addProduct(product, addons)
  addonsOpen.value = false
  addonsProduct.value = null
  selectedAddonIds.value = []
}

const addProductOrCustomize = (product) => {
  if (product?.addons?.length > 0) {
    openAddons(product)
  } else {
    pos.addProduct(product)
  }
}

const setProductEl = (idx, el) => {
  productEls.value[idx] = el ?? null
}

async function focusProductAtIndex(idx) {
  if (filtered.value.length === 0) return
  const next = Math.max(0, Math.min(idx, filtered.value.length - 1))
  activeProductIndex.value = next
  await nextTick()
  productEls.value[next]?.focus()
}

const onSearchKeydown = (e) => {
  if (filtered.value.length === 0) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusProductAtIndex(activeProductIndex.value < 0 ? 0 : activeProductIndex.value + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusProductAtIndex(activeProductIndex.value < 0 ? filtered.value.length - 1 : activeProductIndex.value - 1)
  }
}

const onProductKeydown = (e, idx) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusProductAtIndex(idx + 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusProductAtIndex(idx - 1)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    searchEl.value?.focus()
  }
}

const onGlobalKeydown = (e) => {
  const target = e.target
  const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

  // POS ergonomics: press "/" to jump to product search (like Slack)
  if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping) {
    e.preventDefault()
    searchEl.value?.focus()
    return
  }

  // Quick-pay: Ctrl/Cmd + Enter
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canPay.value) {
    e.preventDefault()
    pay('cash')
    return
  }

  // Escape clears search
  if (e.key === 'Escape' && query.value) {
    query.value = ''
  }
}

const addFirstMatch = () => {
  const first = filtered.value[0]
  if (first) addProductOrCustomize(first)
}

watch(
  filtered,
  () => {
    if (filtered.value.length === 0) {
      activeProductIndex.value = -1
      productEls.value = []
      return
    }
    if (activeProductIndex.value >= filtered.value.length) activeProductIndex.value = filtered.value.length - 1
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
  // nice default for a POS: start ready to scan/search
  setTimeout(() => searchEl.value?.focus(), 0)
})
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))

const hasItems = computed(() => pos.activeSale.items.length > 0)
const canPark = computed(() => hasItems.value)
const canPay = computed(() => hasItems.value)

const confirmAndPark = () => {
  if (!canPark.value) return
  pos.parkActiveSale()
  toast.show('Parked sale', { tone: 'success' })
}

const confirmAndClear = async () => {
  if (!hasItems.value) return
  const ok = await confirmation.ask({
    title: t('clearConfirm'),
    message: t('clearConfirmMessage'),
    confirmLabel: t('clear'),
    cancelLabel: t('cancel'),
    variant: 'warning',
  })
  if (ok) pos.newSale()
}

const pay = async (method) => {
  if (!canPay.value) return
  const methodLabel = method === 'cash' ? 'CASH' : 'CARD'
  const ok = await confirmation.ask({
    title: t('payConfirm', { method: methodLabel }),
    message: t('payConfirmMessage', { total: formatMoney(pos.activeTotalCents, { locale: locale.value }) }),
    confirmLabel: t('confirm'),
    cancelLabel: t('cancel'),
    variant: 'info',
  })
  if (ok) {
    pos.payActiveSale(method)
    toast.show('Payment recorded', { tone: 'success' })
  }
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <section class="col-span-12 lg:col-span-7">
      <Card>
        <div class="mb-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">{{ t('productsTitle') }}</h2>
              <div class="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                <span>{{ t('productsHint') }}</span>
                <Kbd>/</Kbd>
                <span class="text-slate-300">·</span>
                <span>Enter</span>
                <Kbd>↵</Kbd>
                <span class="text-slate-300">·</span>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>navigate</span>
                <span class="text-slate-300">·</span>
                <Kbd>Esc</Kbd>
                <span>back</span>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref="searchEl"
              v-model="query"
              class="w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              :placeholder="t('searchPlaceholder')"
              type="text"
              @keydown="onSearchKeydown"
              @keydown.enter.prevent="addFirstMatch"
            />
          </div>
        </div>

        <div v-if="filtered.length === 0" class="py-16 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p class="mt-4 text-sm font-medium text-slate-600">{{ t('noMatches') }}</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="(p, idx) in filtered"
            :key="p.id"
            class="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            :class="activeProductIndex === idx ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : ''"
            :ref="(el) => setProductEl(idx, el)"
            @focus="activeProductIndex = idx"
            @keydown="(e) => onProductKeydown(e, idx)"
            @click="addProductOrCustomize(p)"
          >
            <div class="mb-3 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 transition-transform group-hover:scale-105">
              <span class="text-2xl font-bold text-slate-400">{{ p.name.charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <div class="truncate text-sm font-bold text-slate-900">{{ p.name }}</div>
              <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span class="font-mono">{{ p.sku }}</span>
                <span v-if="p.category" class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700"
                  >{{ p.category }}</span
                >
              </div>
              <div class="mt-2 text-base font-bold text-indigo-600">{{ formatMoney(p.priceCents, { locale: locale.value }) }}</div>
            </div>
            <div v-if="p.addons && p.addons.length > 0" class="absolute top-2 right-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
              +
            </div>
          </button>
        </div>
      </Card>
    </section>

    <aside class="col-span-12 lg:col-span-5">
      <div class="lg:sticky lg:top-[76px]">
        <Card :padded="false" class="overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">{{ t('currentSaleTitle') }}</h2>
                <div class="mt-1 text-xs text-indigo-100">
                  {{ t('itemsCount', { count: pos.activeItemCount }) }} ·
                  {{ t('updatedAt', { time: new Date(pos.activeSale.updatedAt).toLocaleTimeString(locale.value) }) }}
                </div>
              </div>
              <Button size="sm" variant="ghost" class="text-white hover:bg-white/20" @click="confirmAndClear">{{ t('clear') }}</Button>
            </div>
          </div>

          <div class="max-h-[50vh] overflow-auto">
            <div v-if="pos.activeSale.items.length === 0" class="px-6 py-16 text-center">
              <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200">
                <svg viewBox="0 0 24 24" fill="none" class="h-10 w-10 text-indigo-600" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2A1 1 0 0 0 6.7 19h10.6a1 1 0 0 0 1-.8L20 13M9 21h.01M15 21h.01"
                  />
                </svg>
              </div>
              <div class="mt-4 text-base font-bold text-slate-900">{{ t('emptySaleHint') }}</div>
              <div class="mt-1.5 text-sm text-slate-500">Search and hit Enter to add fast.</div>
            </div>

            <div v-else class="divide-y divide-slate-100 p-4">
              <div v-for="line in pos.activeSale.items" :key="line.id" class="group rounded-xl border-2 border-slate-100 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md">
                <div class="flex items-start gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-bold text-slate-900">{{ line.name }}</div>
                    <div v-if="line.modifiers?.length" class="mt-2 flex flex-wrap gap-1.5">
                      <span
                        v-for="m in line.modifiers"
                        :key="m.id"
                        class="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-700"
                        >{{ m.name }}</span
                      >
                    </div>
                    <div class="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span>{{ formatMoney(line.unitPriceCents, { locale: locale.value }) }} {{ t('each') }}</span>
                      <span class="text-slate-300">·</span>
                      <span class="font-bold text-slate-700">{{ t('lineTotal') }} {{ formatMoney(line.unitPriceCents * line.qty, { locale: locale.value }) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-slate-50 p-1">
                      <button class="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-white hover:text-indigo-600" @click="pos.setLineQty(line.id, line.qty - 1)">−</button>
                      <div class="w-10 text-center text-sm font-bold tabular-nums text-slate-900">{{ line.qty }}</div>
                      <button class="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-white hover:text-indigo-600" @click="pos.setLineQty(line.id, line.qty + 1)">+</button>
                    </div>
                    <Button size="sm" variant="ghost" class="text-rose-600 hover:bg-rose-50" @click="pos.removeLine(line.id)">{{ t('remove') }}</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-5">
            <div class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between text-slate-600">
                <span class="font-medium">{{ t('subtotal') }}</span>
                <span class="font-bold text-slate-900">{{ formatMoney(pos.activeSubtotalCents, { locale: locale.value }) }}</span>
              </div>
              <div class="flex items-center justify-between text-slate-600">
                <span class="font-medium">{{ t('tax') }}</span>
                <span class="font-bold text-slate-900">{{ formatMoney(pos.activeTaxCents, { locale: locale.value }) }}</span>
              </div>
              <div class="border-t-2 border-slate-200 pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-base font-bold text-slate-900">{{ t('total') }}</span>
                  <span class="text-2xl font-bold tabular-nums text-indigo-600">{{ formatMoney(pos.activeTotalCents, { locale: locale.value }) }}</span>
                </div>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-3">
              <Button :disabled="!canPark" variant="secondary" block class="font-bold" @click="confirmAndPark">{{ t('park') }}</Button>
              <Button :disabled="!canPay" variant="primary" block class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="pay('cash')">{{ t('payCash') }}</Button>
              <Button :disabled="!canPay" variant="primary" block class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="pay('card')">{{ t('payCard') }}</Button>
            </div>

            <div class="mt-4 text-center text-xs text-slate-500">
              {{ t('parkTip') }}
            </div>
          </div>
        </Card>
      </div>
    </aside>
  </div>

  <AddonsModal
    :open="addonsOpen"
    :product="addonsProduct"
    :selected-ids="selectedAddonIds"
    @toggle="toggleAddon"
    @close="addonsOpen = false"
    @confirm="confirmAddons"
  />
</template>


