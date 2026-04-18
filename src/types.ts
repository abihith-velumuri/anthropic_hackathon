export type PetMood = 'thriving' | 'healthy' | 'neutral' | 'wilting' | 'critical'

export type MealEntry = {
  id: string
  timestamp: number
  label: string
  assessment: string
  delta: number
}

export type PetState = {
  name: string
  species: string
  score: number
  hydration: number
  streakDays: number
  meals: MealEntry[]
  lastMessage: string
  lastMessageAt: number
}

export type Friend = {
  id: string
  name: string
  petName: string
  score: number
  streakDays: number
  status: string
}
