import type { PetState } from '../types'

const KEY = 'petpal.state.v1'

export function loadState(): PetState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as PetState
  } catch {
    return null
  }
}

export function saveState(state: PetState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors for demo
  }
}

export function defaultState(): PetState {
  return {
    name: 'Mochi',
    species: 'cat',
    score: 72,
    hydration: 2,
    streakDays: 3,
    meals: [],
    lastMessage: "Hi! I'm Mochi. Feed me well and I'll thrive with you!",
    lastMessageAt: Date.now(),
  }
}
