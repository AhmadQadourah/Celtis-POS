<script setup>
import { computed, ref, watch } from 'vue'
import { formatMoney } from '../pos/money'
import { usePosStore } from '../stores/pos'
import { useI18n } from '../i18n/useI18n'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import { useConfirmationStore } from '../stores/confirmation'

const pos = usePosStore()
const { t, locale } = useI18n()
const confirmation = useConfirmationStore()
const selectedId = ref(null)

const paid = computed(() => pos.history)
const selected = computed(() => selectedId.value ? paid.value.find((s) => s.id == selectedId.value) ?? null : null)

const subtotalCents = (items) => items.reduce((sum, x) => sum + x.unitPriceCents * x.qty, 0)

watch(paid, () => {
  if (!selectedId.value && paid.value[0]) {
    selectedId.value = paid.value[0].id
  }
}, { immediate: true })

const clearAll = async () => {
  const ok = await confirmation.ask({
    title: t('clearAllConfirm'),
    message: t('clearAllMessage'),
    confirmLabel: t('clearData'),
    cancelLabel: t('cancel'),
    variant: 'danger',
  })
  if (ok) {
    pos.clearAllData()
    selectedId.value = null
  }
}
</script>

<template>
  <div class="grid grid-cols-12 gap-6">
    <section class="col-span-12 lg:col-span-6">
      <Card :padded="false" class="overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-white">{{ t('historyTitle') }}</h2>
              <div class="mt-1 text-sm text-emerald-100">{{ t('historySubtitle', { count: paid.length }) }}</div>
            </div>
            <Button size="sm" variant="ghost" class="text-white hover:bg-white/20" @click="clearAll">{{ t('clearData') }}</Button>
          </div>
        </div>

        <div class="p-4">
          <div v-if="paid.length == 0" class="py-16 text-center">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200">
              <svg viewBox="0 0 24 24" fill="none" class="h-10 w-10 text-emerald-600" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="mt-4 text-base font-bold text-slate-900">{{ t('noPaid') }}</p>
            <p class="mt-1.5 text-sm text-slate-500">Complete sales from the Sell screen to see them here.</p>
          </div>

          <div v-else class="space-y-3">
            <button
              v-for="s in paid"
              :key="s.id"
              class="group w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              :class="selectedId == s.id ? 'border-emerald-500 bg-emerald-50 shadow-lg' : ''"
              @click="selectedId = s.id"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200">
                      <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6 text-emerald-600" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-bold text-slate-900">
                        {{ new Date(s.payment?.paidAt ?? s.updatedAt).toLocaleString(locale.value) }}
                      </div>
                      <div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span class="font-medium">{{ s.items.reduce((sum, x) => sum + x.qty, 0) }} items</span>
                        <span class="text-slate-300">·</span>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 font-bold uppercase tracking-wide text-slate-700">{{ (s.payment?.method ?? 'cash') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <div class="text-lg font-bold text-emerald-600">{{ formatMoney(s.payment?.amountCents ?? 0, { locale: locale.value }) }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </section>

    <aside class="col-span-12 lg:col-span-6">
      <div class="lg:sticky lg:top-[76px]">
        <Card :padded="false" class="overflow-hidden">
          <div class="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5">
            <h3 class="text-lg font-bold text-white">{{ t('receiptTitle') }}</h3>
            <div class="mt-1 text-sm text-slate-300">{{ t('receiptSubtitle') }}</div>
          </div>

          <div class="p-6">
            <div v-if="!selected" class="py-16 text-center">
              <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <svg viewBox="0 0 24 24" fill="none" class="h-10 w-10 text-slate-400" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="mt-4 text-base font-bold text-slate-900">{{ t('selectSale') }}</p>
              <p class="mt-1.5 text-sm text-slate-500">Select a sale from the list to view details.</p>
            </div>

            <div v-else>
              <div class="mb-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ t('paid') }}</div>
                    <div class="mt-1.5 text-base font-bold text-slate-900">
                      {{ new Date(selected.payment?.paidAt ?? selected.updatedAt).toLocaleString(locale.value) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ t('method') }}</div>
                    <div class="mt-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-bold uppercase text-indigo-700">
                      {{ (selected.payment?.method ?? 'cash') }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-6 space-y-3">
                <div v-for="line in selected.items" :key="line.id" class="rounded-xl border-2 border-slate-200 bg-white p-4">
                  <div class="flex items-start justify-between gap-3">
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
                      <div class="mt-2 text-xs text-slate-500">
                        {{ line.qty }} × {{ formatMoney(line.unitPriceCents, { locale: locale.value }) }}
                      </div>
                    </div>
                    <div class="shrink-0 text-right">
                      <div class="text-base font-bold text-slate-900">{{ formatMoney(line.unitPriceCents * line.qty, { locale: locale.value }) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div class="space-y-2.5 text-sm">
                  <div class="flex items-center justify-between text-slate-600">
                    <span class="font-medium">{{ t('subtotal') }}</span>
                    <span class="font-bold text-slate-900">{{ formatMoney(subtotalCents(selected.items), { locale: locale.value }) }}</span>
                  </div>
                  <div class="border-t-2 border-slate-200 pt-3">
                    <div class="flex items-center justify-between">
                      <span class="text-base font-bold text-slate-900">{{ t('total') }}</span>
                      <span class="text-2xl font-bold tabular-nums text-emerald-600">{{ formatMoney(selected.payment?.amountCents ?? 0, { locale: locale.value }) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  </div>
</template>


