import type { App, InjectionKey } from 'vue'
import { computed, ref, watch } from 'vue'
import { messages, type Locale, type MessageKey } from './messages'

export type I18n = {
  locale: Readonly<{ value: Locale }>
  dir: Readonly<{ value: 'ltr' | 'rtl' }>
  setLocale: (next: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const STORAGE_KEY = 'celtis.pos.locale'

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`))
}

function getInitialLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'en' || raw === 'ar') return raw
  } catch {
    // ignore
  }
  return 'en'
}

export const I18N_KEY: InjectionKey<I18n> = Symbol('i18n')

export function createI18n(): I18n {
  const locale = ref<Locale>(typeof window === 'undefined' ? 'en' : getInitialLocale())
  const dir = computed<'ltr' | 'rtl'>(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))

  function setLocale(next: Locale) {
    locale.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  function t(key: MessageKey, vars?: Record<string, string | number>): string {
    const msg = (messages[locale.value] as any)[key] ?? (messages.en as any)[key] ?? key
    return interpolate(String(msg), vars)
  }

  // Keep document lang/dir aligned (nice “showoff” detail for RTL)
  watch(
    [locale, dir],
    () => {
      if (typeof document === 'undefined') return
      document.documentElement.lang = locale.value
      document.documentElement.dir = dir.value
    },
    { immediate: true },
  )

  return { locale, dir, setLocale, t }
}

export function installI18n(app: App): I18n {
  const i18n = createI18n()
  app.provide(I18N_KEY, i18n)
  return i18n
}


