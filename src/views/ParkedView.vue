<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatMoney } from '../pos/money'
import { usePosStore } from '../stores/pos'
import { useI18n } from '../i18n/useI18n'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import Badge from '../components/ui/Badge.vue'
import { useToastStore } from '../stores/toast'
import { useConfirmationStore } from '../stores/confirmation'

const router = useRouter()
const pos = usePosStore()
const { t, locale } = useI18n()
const toast = useToastStore()
const confirmation = useConfirmationStore()

const saleSubtotalCents = (items) => items.reduce((sum, x) => sum + x.unitPriceCents * x.qty, 0)

const draftsSorted = computed(() => [...pos.drafts].sort((a, b) => b.updatedAt - a.updatedAt))

const resume = (id) => {
  pos.resumeDraft(id)
  toast.show('Resumed sale', { tone: 'neutral' })
  router.push('/sell')
}

const remove = async (id) => {
  const ok = await confirmation.ask({
    title: t('deleteDraftConfirm'),
    message: t('deleteDraftMessage'),
    confirmLabel: t('delete'),
    cancelLabel: t('cancel'),
    variant: 'danger',
  })
  if (ok) pos.deleteDraft(id)
}
</script>

<template>
  <Card :padded="false" class="overflow-hidden">
    <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">{{ t('parkedTitle') }}</h2>
          <div class="mt-1 text-sm text-amber-100">{{ t('parkedSubtitle') }}</div>
        </div>
        <Badge class="bg-white/20 text-white border-white/30">{{ t('draftsCount', { count: pos.drafts.length }) }}</Badge>
      </div>
    </div>

    <div class="p-6">
      <div v-if="draftsSorted.length === 0" class="py-16 text-center">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200">
          <svg viewBox="0 0 24 24" fill="none" class="h-10 w-10 text-amber-600" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p class="mt-4 text-base font-bold text-slate-900">{{ t('noDrafts') }}</p>
        <p class="mt-1.5 text-sm text-slate-500">Park sales from the Sell screen to resume them later.</p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="s in draftsSorted"
          :key="s.id"
          class="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white p-5 shadow-md transition-all hover:border-amber-300 hover:shadow-lg"
        >
          <div class="mb-4 flex items-start justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-200">
              <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6 text-amber-600" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span class="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">{{ t('draft') }}</span>
          </div>

          <div class="mb-4">
            <div class="text-xs font-medium text-slate-500">
              {{ t('updatedAt', { time: new Date(s.updatedAt).toLocaleString(locale.value) }) }}
            </div>
            <div class="mt-2 flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-900">{{ formatMoney(saleSubtotalCents(s.items), { locale: locale.value }) }}</span>
            </div>
            <div class="mt-1.5 text-sm text-slate-600">
              {{ t('itemsCount', { count: s.items.reduce((sum, x) => sum + x.qty, 0) }) }}
            </div>
          </div>

          <div class="flex gap-2">
            <Button variant="primary" block class="bg-indigo-600 font-bold hover:bg-indigo-700" @click="resume(s.id)">{{ t('resume') }}</Button>
            <Button variant="secondary" block class="font-bold" @click="remove(s.id)">{{ t('delete') }}</Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>


