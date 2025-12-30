<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const { toasts } = storeToRefs(toast)
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
    <div class="w-full max-w-md space-y-2">
      <TransitionGroup name="toast" tag="div" class="space-y-2">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg shadow-slate-900/10"
        >
          <div class="min-w-0 text-sm font-semibold" :class="t.tone === 'success' ? 'text-emerald-700' : t.tone === 'danger' ? 'text-rose-700' : 'text-slate-900'">
            {{ t.message }}
          </div>
          <button class="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900" @click="toast.dismiss(t.id)">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 180ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>


