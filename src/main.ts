import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { installI18n } from './i18n'
import { usePosStore } from './stores/pos'
import { useConfirmationStore } from './stores/confirmation'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia).use(router)
const i18n = installI18n(app)

// Safety: warn when leaving Sell with an active sale.
router.beforeEach(async (to, from) => {
  if (from.path == '/sell' && to.path != from.path) {
    const pos = usePosStore(pinia)
    if (pos.activeSale.items.length > 0) {
      const confirmation = useConfirmationStore(pinia)
      const ok = await confirmation.ask({
        title: i18n.t('unsavedLeaveConfirm'),
        message: i18n.t('unsavedLeaveMessage'),
        confirmLabel: i18n.t('confirm'),
        cancelLabel: i18n.t('cancel'),
        variant: 'warning',
      })
      if (!ok) return false
    }
  }
})

app.mount('#app')
