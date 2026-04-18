import type { PetMood } from '../types'

export function clampScore(s: number): number {
  return Math.max(0, Math.min(100, Math.round(s)))
}

export function moodFromScore(score: number): PetMood {
  if (score >= 85) return 'thriving'
  if (score >= 65) return 'healthy'
  if (score >= 40) return 'neutral'
  if (score >= 20) return 'wilting'
  return 'critical'
}

export const MOOD_META: Record<PetMood, { label: string; color: string; ring: string; bg: string; animation: string }> = {
  thriving: {
    label: 'Thriving',
    color: 'text-emerald-600',
    ring: 'ring-emerald-300',
    bg: 'from-emerald-100 to-emerald-50',
    animation: 'animate-bob',
  },
  healthy: {
    label: 'Healthy',
    color: 'text-lime-600',
    ring: 'ring-lime-300',
    bg: 'from-lime-100 to-lime-50',
    animation: 'animate-bob',
  },
  neutral: {
    label: 'Okay',
    color: 'text-amber-600',
    ring: 'ring-amber-300',
    bg: 'from-amber-100 to-amber-50',
    animation: 'animate-wiggle',
  },
  wilting: {
    label: 'Tired',
    color: 'text-orange-600',
    ring: 'ring-orange-300',
    bg: 'from-orange-100 to-orange-50',
    animation: 'animate-droop',
  },
  critical: {
    label: 'Needs the vet',
    color: 'text-rose-700',
    ring: 'ring-rose-400',
    bg: 'from-rose-200 to-rose-100',
    animation: 'animate-droop',
  },
}
