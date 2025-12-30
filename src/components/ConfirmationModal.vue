<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useConfirmationStore } from '../stores/confirmation'
import Button from './ui/Button.vue'

const confirmation = useConfirmationStore()

function handleEscape(e) {
  if (e.key == 'Escape' && confirmation.open) {
    confirmation.cancel()
  }
}

function handleBackdropClick(e) {
  if (e.target == e.currentTarget) {
    confirmation.cancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="confirmation.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="confirmation.open"
            class="w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white shadow-2xl"
            @click.stop
          >
            <div class="p-6">
              <div
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                :class="{
                  'bg-rose-100': confirmation.variant == 'danger',
                  'bg-amber-100': confirmation.variant == 'warning',
                  'bg-indigo-100': confirmation.variant == 'info',
                }"
              >
                <svg
                  v-if="confirmation.variant == 'danger'"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="h-6 w-6 text-rose-600"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <svg
                  v-else-if="confirmation.variant == 'warning'"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="h-6 w-6 text-amber-600"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  class="h-6 w-6 text-indigo-600"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 class="mb-2 text-lg font-bold text-slate-900">{{ confirmation.title }}</h3>
              <p class="text-sm text-slate-600">{{ confirmation.message }}</p>
            </div>

            <div class="flex gap-3 border-t-2 border-slate-100 bg-slate-50 p-4">
              <Button variant="secondary" block class="font-bold" @click="confirmation.cancel">
                {{ confirmation.cancelLabel }}
              </Button>
              <Button
                :variant="confirmation.variant == 'danger' ? 'danger' : 'primary'"
                block
                class="font-bold"
                @click="confirmation.confirm"
              >
                {{ confirmation.confirmLabel }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

