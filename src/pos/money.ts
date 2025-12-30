export function formatMoney(
  cents: number,
  opts?: {
    locale?: string
    currency?: string
  },
): string {
  const value = (cents ?? 0) / 100
  return value.toLocaleString(opts?.locale, { style: 'currency', currency: opts?.currency ?? 'USD' })
}

export function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(n)))
}


