<script setup>
defineProps({
  padded: { type: Boolean, default: true },
})
</script>

<template>
  <div class="rounded-2xl border-2 border-slate-200/80 bg-white shadow-lg shadow-slate-900/5 transition-shadow">
    <div v-if="padded" class="p-4">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>


