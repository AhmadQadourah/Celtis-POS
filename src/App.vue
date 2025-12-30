<template>
  <div class="min-h-full" :dir="dir.value">
    <header class="sticky top-0 z-20 border-b-2 border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
        <div class="flex items-baseline gap-3">
          <div class="text-lg font-bold tracking-tight text-slate-900">{{ t('appTitle') }}</div>
          <div class="text-xs font-medium text-slate-500">{{ t('appSubtitle') }}</div>
        </div>

        <nav class="ml-auto flex items-center gap-2 text-sm font-semibold">
          <RouterLink
            to="/sell"
            class="rounded-lg px-4 py-2 text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-700"
            active-class="bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white shadow-md"
            >{{ t('navSell') }}</RouterLink
          >
          <RouterLink
            to="/parked"
            class="rounded-lg px-4 py-2 text-slate-700 transition-all hover:bg-amber-50 hover:text-amber-700"
            active-class="bg-amber-500 text-white hover:bg-amber-600 hover:text-white shadow-md"
          >
            {{ t('navParked') }}
            <Badge
              v-if="draftCount > 0"
              :class="[
                'ml-2',
                isParkedActive
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-amber-200 bg-amber-100 text-amber-700',
              ]"
              >{{ draftCount }}</Badge
            >
          </RouterLink>
          <RouterLink
            to="/history"
            class="rounded-lg px-4 py-2 text-slate-700 transition-all hover:bg-emerald-50 hover:text-emerald-700"
            active-class="bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white shadow-md"
          >
            {{ t('navHistory') }}
            <Badge
              v-if="historyCount > 0"
              :class="[
                'ml-2',
                isHistoryActive
                  ? 'border-white/30 bg-white/20 text-white'
                  : 'border-emerald-200 bg-emerald-100 text-emerald-700',
              ]"
              >{{ historyCount }}</Badge
            >
          </RouterLink>

          <div class="mx-2 h-6 w-px bg-slate-200"></div>
          <Button size="sm" variant="secondary" class="font-bold" @click="toggleLocale">
            {{ locale == 'en' ? t('langArabic') : t('langEnglish') }}
          </Button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-6">
      <RouterView />
    </main>

    <ToastHost />
    <ConfirmationModal />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePosStore } from './stores/pos'
import { useI18n } from './i18n/useI18n'
import Badge from './components/ui/Badge.vue'
import Button from './components/ui/Button.vue'
import ToastHost from './components/ToastHost.vue'
import ConfirmationModal from './components/ConfirmationModal.vue'

const route = useRoute()
const pos = usePosStore()
const draftCount = computed(() => pos.drafts.length)
const historyCount = computed(() => pos.history.length)

const isParkedActive = computed(() => route.path == '/parked')
const isHistoryActive = computed(() => route.path == '/history')

const { t, locale, dir, setLocale } = useI18n()
function toggleLocale() {
  setLocale(locale.value == 'en' ? 'ar' : 'en')
}
</script>
