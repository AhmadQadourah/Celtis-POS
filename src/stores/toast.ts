import { defineStore } from 'pinia'

type ToastTone = 'neutral' | 'success' | 'danger'

interface Toast {
  id: string
  message: string
  tone: ToastTone
  timeoutMs: number
}

interface ToastOptions {
  tone?: ToastTone
  timeoutMs?: number
}

function id(): string {
  return `t_${Math.random().toString(16).slice(2)}`
}

export const useToastStore = defineStore('toast', {
  state: (): { toasts: Toast[] } => ({
    toasts: [],
  }),
  actions: {
    show(message: string, opts: ToastOptions = {}) {
      const toast: Toast = {
        id: id(),
        message,
        tone: opts.tone ?? 'neutral',
        timeoutMs: opts.timeoutMs ?? 2200,
      }
      this.toasts = [...this.toasts, toast]
      window.setTimeout(() => this.dismiss(toast.id), toast.timeoutMs)
    },
    dismiss(toastId: string) {
      this.toasts = this.toasts.filter((t) => t.id !== toastId)
    },
  },
})

