<script setup>
import { computed } from 'vue'
import Card from './ui/Card.vue'
import Button from './ui/Button.vue'
import { formatMoney } from '../pos/money'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
  open: { type: Boolean, default: false },
  product: { type: Object, default: null },
  selectedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'toggle', 'confirm'])

const { t, locale } = useI18n()

const addons = computed(() => props.product?.addons ?? [])
const selectedSet = computed(() => new Set(props.selectedIds))

const addonsTotalCents = computed(() => {
  const set = selectedSet.value
  return addons.value.reduce((sum, a) => sum + (set.has(a.id) ? a.priceCents : 0), 0)
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button class="absolute inset-0 bg-slate-900/30" @click="emit('close')" aria-label="Close"></button>

    <div class="relative w-full max-w-lg">
      <Card :padded="false">
        <div class="px-4 py-3">
          <div class="text-sm font-semibold text-slate-900">{{ t('addonsTitle') }}</div>
          <div class="mt-0.5 text-xs text-slate-500">{{ t('addonsSubtitle') }}</div>
          <div v-if="product" class="mt-2 text-sm font-semibold text-slate-900">{{ product.name }}</div>
        </div>

        <div class="border-t border-slate-100">
          <div class="divide-y divide-slate-100">
            <label v-for="a in addons" :key="a.id" class="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
              <div class="min-w-0">
                <div class="truncate text-sm font-medium text-slate-900">{{ a.name }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-sm font-semibold text-slate-900">
                  {{ a.priceCents === 0 ? '—' : formatMoney(a.priceCents, { locale: locale.value }) }}
                </div>
                <input
                  class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
                  type="checkbox"
                  :checked="selectedSet.has(a.id)"
                  @change="emit('toggle', a.id)"
                />
              </div>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <div class="text-xs font-semibold text-slate-600">
            + {{ formatMoney(addonsTotalCents, { locale: locale.value }) }}
          </div>
          <div class="flex items-center gap-2">
            <Button variant="secondary" @click="emit('close')">{{ t('cancel') }}</Button>
            <Button variant="primary" @click="emit('confirm')">{{ t('addItem') }}</Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>


