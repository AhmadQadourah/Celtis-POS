import type { Sale } from './types'

export type PersistedPosState = {
  activeSale: Sale | null
  drafts: Sale[]
  history: Sale[]
  version: 1
}

const STORAGE_KEY = 'celtis.pos.v1'

export function loadPosState(): PersistedPosState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedPosState
    if (!parsed || parsed.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

export function savePosState(state: PersistedPosState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    console.error('Failed to save POS state to localStorage')
  }
}


