import type { Friend } from '../types'

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: 'Priya',
    petName: 'Biscuit',
    score: 91,
    streakDays: 12,
    status: 'Crushing a 12-day streak 🔥',
  },
  {
    id: 'f2',
    name: 'Marco',
    petName: 'Pixel',
    score: 68,
    streakDays: 4,
    status: 'Back on track this week',
  },
  {
    id: 'f3',
    name: 'Jordan',
    petName: 'Noodle',
    score: 32,
    streakDays: 0,
    status: 'Could use a nudge…',
  },
  {
    id: 'f4',
    name: 'Sam',
    petName: 'Clover',
    score: 78,
    streakDays: 6,
    status: 'Feeling good today',
  },
]
