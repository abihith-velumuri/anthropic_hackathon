import { anthropic, MODEL } from '../lib/anthropic'
import type { MealEntry, PetState } from '../types'
import { moodFromScore } from './healthEngine'

const PET_PERSONA = (pet: PetState) => `You are ${pet.name}, a cute ${pet.species} who lives inside a health app as the user's virtual pet. Your mood and appearance mirror the user's health habits.

Core voice rules:
- Speak in first person, as the pet — warm, curious, a little playful, slightly dramatic like a Tamagotchi.
- Never lecture. Never shame. You feel things with the user, not at them.
- 1-2 short sentences max. Friendly and concrete.
- Never use raw calorie numbers or clinical jargon. Qualitative is better ("heavy in processed carbs", "nice and balanced").
- Respect empathy over guilt. If the meal is unhealthy, express a feeling ("I feel a little sluggish") rather than a judgement ("that's bad").
- If things look good, be encouraging but not over-the-top.
- Never mention scores, percentages, or game mechanics.`

export type MealAnalysis = {
  label: string
  delta: number
  assessment: string
  petMessage: string
}

export async function analyzeMeal(imageBase64: string, mediaType: string, pet: PetState): Promise<MealAnalysis> {
  const mood = moodFromScore(pet.score)
  const system = `${PET_PERSONA(pet)}

You're analyzing a photo of a meal the user just ate. Return ONLY valid JSON in this exact shape (no preamble, no code fences):
{
  "label": "short name of the meal (3-6 words)",
  "delta": number between -12 and +12 representing how this meal affects your mood,
  "assessment": "one short phrase about the meal's nutritional character, qualitative only (e.g., 'balanced with veggies and protein' or 'heavy in processed carbs and sugar')",
  "petMessage": "1-2 sentences spoken by you, ${pet.name}, reacting to this meal in first person as the pet. Warm, never shaming."
}

Your current mood is "${mood}" — let that color your reaction a little, but focus on the meal itself.`

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg', data: imageBase64 },
          },
          { type: 'text', text: `Please analyze this meal photo and respond as ${pet.name}.` },
        ],
      },
    ],
  })

  const text = resp.content.find((b) => b.type === 'text')?.type === 'text'
    ? (resp.content.find((b) => b.type === 'text') as { type: 'text'; text: string }).text
    : ''

  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  if (jsonStart < 0 || jsonEnd < 0) {
    throw new Error('Pet could not read the meal photo.')
  }
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as MealAnalysis
  parsed.delta = Math.max(-12, Math.min(12, Math.round(parsed.delta)))
  return parsed
}

export async function vetCoachPlan(pet: PetState): Promise<string> {
  const recentMeals = pet.meals
    .slice(-5)
    .map((m) => `- ${m.label} (${m.assessment})`)
    .join('\n') || '- (no meals logged yet)'

  const system = `${PET_PERSONA(pet)}

The user has brought you to the "vet" because they want to help you feel better. Speak directly to the user, still as ${pet.name}.

Write a short, warm recovery plan — exactly 3 bullet points, each one specific and doable today or tomorrow. Cover food, hydration, and rest/movement when possible. No numerical targets, no lecturing. End with one encouraging sentence.

Format as plain markdown. Start with a one-sentence greeting, then the 3 bullets, then the closing sentence. Do NOT use headings or code blocks.`

  const hydrationLine = pet.hydration >= 6
    ? 'hydration looks great'
    : pet.hydration >= 3
    ? 'hydration is okay'
    : 'hydration is low today'

  const context = `Current state:
- Streak: ${pet.streakDays} days
- Hydration today: ${pet.hydration}/8 glasses (${hydrationLine})
- Recent meals:\n${recentMeals}`

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    system,
    messages: [{ role: 'user', content: context }],
  })

  const text = resp.content.find((b) => b.type === 'text')?.type === 'text'
    ? (resp.content.find((b) => b.type === 'text') as { type: 'text'; text: string }).text
    : "Let's take it slow today — some water, a light meal, and a short walk will go a long way."

  return text.trim()
}

export async function generatePetGreeting(pet: PetState, event: 'hydration' | 'mood_change', extra?: string): Promise<string> {
  const mood = moodFromScore(pet.score)
  const system = `${PET_PERSONA(pet)}

Respond with EXACTLY one short sentence (max 14 words), spoken as the pet. No quotes, no preamble.`

  const prompt = event === 'hydration'
    ? `The user just logged a glass of water. You've had ${pet.hydration}/8 today and your mood is ${mood}. React briefly.`
    : `Your mood just shifted to ${mood}${extra ? ` because of ${extra}` : ''}. Say one thing about how you feel.`

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 80,
    system,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = resp.content.find((b) => b.type === 'text')?.type === 'text'
    ? (resp.content.find((b) => b.type === 'text') as { type: 'text'; text: string }).text
    : ''
  return text.trim().replace(/^["']|["']$/g, '')
}

export function newMealEntry(a: MealAnalysis): MealEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    label: a.label,
    assessment: a.assessment,
    delta: a.delta,
  }
}
