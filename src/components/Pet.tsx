import { MOOD_META, moodFromScore } from '../game/healthEngine'
import type { PetState } from '../types'

// Pokemon placeholder — swap these with your team's pet art later.
const POKEMON_PLACEHOLDER =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'

const MOOD_FILTER: Record<string, string> = {
  thriving: 'brightness(1.08) saturate(1.15)',
  healthy: 'none',
  neutral: 'saturate(0.85)',
  wilting: 'saturate(0.5) brightness(0.95)',
  critical: 'saturate(0.2) brightness(0.85)',
}

type Props = {
  pet: PetState
  flash?: boolean
}

export default function Pet({ pet, flash }: Props) {
  const mood = moodFromScore(pet.score)
  const meta = MOOD_META[mood]

  return (
    <div className={`card p-6 bg-gradient-to-b ${meta.bg} ${flash ? 'animate-pop' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500">Your pet</div>
          <div className="text-3xl font-bold">{pet.name}</div>
          <div className={`text-sm font-semibold ${meta.color}`}>● {meta.label}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-gray-500">Streak</div>
          <div className="text-2xl font-bold text-rose-500">
            {pet.streakDays} <span className="text-sm">day{pet.streakDays === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center items-center my-6">
        <div className={`absolute w-56 h-56 rounded-full bg-white/60 ring-8 ${meta.ring}`} />
        <img
          src={POKEMON_PLACEHOLDER}
          alt={`${pet.name} the ${pet.species}`}
          className={`relative w-52 h-52 object-contain drop-shadow-xl ${meta.animation}`}
          style={{ filter: MOOD_FILTER[mood] }}
        />
      </div>

      {/* Health bar */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Vitality</span>
          <span>{pet.score}/100</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/70 overflow-hidden border border-white">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pet.score}%`,
              background:
                mood === 'critical'
                  ? 'linear-gradient(90deg, #fb7185, #f43f5e)'
                  : mood === 'wilting'
                  ? 'linear-gradient(90deg, #fdba74, #fb923c)'
                  : mood === 'neutral'
                  ? 'linear-gradient(90deg, #fcd34d, #f59e0b)'
                  : mood === 'healthy'
                  ? 'linear-gradient(90deg, #bef264, #84cc16)'
                  : 'linear-gradient(90deg, #6ee7b7, #10b981)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
