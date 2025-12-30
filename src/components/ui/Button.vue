<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'secondary' }, // primary | secondary | ghost | danger
  size: { type: String, default: 'md' }, // sm | md
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' }, // button | submit | reset
  block: { type: Boolean, default: false },
})

const cls = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50'

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-3.5 text-sm',
  }

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-shadow',
    secondary: 'border-2 border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow transition-shadow',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-md hover:shadow-lg transition-shadow',
  }

  return [
    base,
    sizes[props.size] ?? sizes.md,
    variants[props.variant] ?? variants.secondary,
    props.block ? 'w-full' : '',
  ].join(' ')
})
</script>

<template>
  <button :type="type" :disabled="disabled" :class="cls">
    <slot />
  </button>
</template>


