<script setup>
defineProps({
  variant: { type: String, default: 'neutral' }, // neutral | info
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-colors"
    :class="variant === 'info' ? 'border-slate-300 bg-slate-900 text-white' : 'border-slate-200 bg-slate-100 text-slate-700'"
  >
    <slot />
  </span>
</template>


