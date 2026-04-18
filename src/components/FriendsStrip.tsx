import type { Friend } from '../types'
import { MOOD_META, moodFromScore } from '../game/healthEngine'

const POKEMON_PLACEHOLDER =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'

const FILTER: Record<string, string> = {
  thriving: 'brightness(1.08) saturate(1.15)',
  healthy: 'none',
  neutral: 'saturate(0.85)',
  wilting: 'saturate(0.5) brightness(0.95)',
  critical: 'saturate(0.2) brightness(0.85)',
}

type Props = {
  friends: Friend[]
  onNudge: (friend: Friend) => void
}

export default function FriendsStrip({ friends, onNudge }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-500">Friends</div>
          <div className="text-lg font-bold">Keep each other growing</div>
        </div>
        <button className="btn-ghost text-sm">+ Invite</button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {friends.map((f) => {
          const mood = moodFromScore(f.score)
          const meta = MOOD_META[mood]
          return (
            <div
              key={f.id}
              className="flex-shrink-0 w-36 card bg-white/70 p-3 text-center"
              style={{ border: '1px solid rgba(255,255,255,0.9)' }}
            >
              <div className={`relative w-full flex justify-center bg-gradient-to-b ${meta.bg} rounded-2xl py-3`}>
                <img
                  src={POKEMON_PLACEHOLDER}
                  alt={f.petName}
                  className="w-16 h-16 object-contain"
                  style={{ filter: FILTER[mood] }}
                />
              </div>
              <div className="mt-2 text-sm font-semibold">{f.name}</div>
              <div className="text-xs text-gray-500 truncate">{f.petName}</div>
              <div className={`text-xs font-semibold ${meta.color}`}>{meta.label}</div>
              <button
                onClick={() => onNudge(f)}
                className="mt-2 w-full text-xs bg-white/80 border border-gray-200 rounded-full py-1 hover:bg-white active:scale-95 transition"
              >
                {mood === 'critical' || mood === 'wilting' ? 'Send care 💌' : 'High-five 🙌'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
