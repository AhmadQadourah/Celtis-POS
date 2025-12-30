import { inject } from 'vue'
import { I18N_KEY, type I18n } from './index'

export function useI18n(): I18n {
  const i18n = inject(I18N_KEY, null)
  if (!i18n) {
    throw new Error('i18n not installed. Call installI18n(app) in main.ts.')
  }
  return i18n
}


