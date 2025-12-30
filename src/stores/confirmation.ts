import { defineStore } from 'pinia'

type ConfirmationVariant = 'danger' | 'warning' | 'info'

interface ConfirmationOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmationVariant
}

export const useConfirmationStore = defineStore('confirmation', {
  state: (): {
    open: boolean
    title: string
    message: string
    confirmLabel: string
    cancelLabel: string
    variant: ConfirmationVariant
    resolve: ((value: boolean) => void) | null
  } => ({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'danger',
    resolve: null,
  }),
  actions: {
    ask(options: ConfirmationOptions): Promise<boolean> {
      return new Promise((resolve) => {
        this.title = options.title
        this.message = options.message
        this.confirmLabel = options.confirmLabel ?? 'Confirm'
        this.cancelLabel = options.cancelLabel ?? 'Cancel'
        this.variant = options.variant ?? 'danger'
        this.resolve = resolve
        this.open = true
      })
    },
    confirm() {
      if (this.resolve) this.resolve(true)
      this._reset()
    },
    cancel() {
      if (this.resolve) this.resolve(false)
      this._reset()
    },
    _reset() {
      this.open = false
      this.title = ''
      this.message = ''
      this.confirmLabel = 'Confirm'
      this.cancelLabel = 'Cancel'
      this.variant = 'danger'
      this.resolve = null
    },
  },
})

