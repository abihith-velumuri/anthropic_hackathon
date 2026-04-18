import { useEffect, useMemo, useState } from 'react'
import Pet from './components/Pet'
import PetBubble from './components/PetBubble'
import HydrationBar from './components/HydrationBar'
import MealScanButton from './components/MealScanButton'
import VetModal from './components/VetModal'
import FriendsStrip from './components/FriendsStrip'
import Toast from './components/Toast'
import { defaultState, loadState, saveState } from './lib/storage'
import { clampScore, moodFromScore } from './game/healthEngine'
import { analyzeMeal, newMealEntry, vetCoachPlan } from './game/petBrain'
import { fileToBase64 } from './lib/image'
import { MOCK_FRIENDS } from './lib/friends'
import type { Friend, PetState } from './types'

export default function App() {
  const [pet, setPet] = useState<PetState>(() => loadState() ?? defaultState())
  const [scanning, setScanning] = useState(false)
  const [flash, setFlash] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [vetOpen, setVetOpen] = useState(false)
  const [vetLoading, setVetLoading] = useState(false)
  const [vetPlan, setVetPlan] = useState('')

  const mood = useMemo(() => moodFromScore(pet.score), [pet.score])

  useEffect(() => {
    saveState(pet)
  }, [pet])

  const popFlash = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 450)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleHydration = () => {
    setPet((p) => {
      const next = Math.min(8, p.hydration + 1)
      const bonus = next > p.hydration ? 2 : 0
      const newScore = clampScore(p.score + bonus)
      return {
        ...p,
        hydration: next,
        score: newScore,
        lastMessage: next === 8 ? "I feel so refreshed! You're glowing today." : p.lastMessage,
        lastMessageAt: Date.now(),
      }
    })
    popFlash()
    showToast('+ Glass of water logged 💧')
  }

  const handleMealScan = async (file: File) => {
    setScanning(true)
    try {
      const { base64, mediaType } = await fileToBase64(file)
      const analysis = await analyzeMeal(base64, mediaType, pet)
      const entry = newMealEntry(analysis)
      setPet((p) => ({
        ...p,
        score: clampScore(p.score + analysis.delta),
        meals: [...p.meals, entry],
        lastMessage: analysis.petMessage,
        lastMessageAt: Date.now(),
      }))
      popFlash()
      showToast(
        analysis.delta > 0
          ? `Logged: ${analysis.label} (+${analysis.delta} vitality)`
          : analysis.delta < 0
          ? `Logged: ${analysis.label} (${analysis.delta} vitality)`
          : `Logged: ${analysis.label}`,
      )
    } catch (err) {
      console.error(err)
      showToast('Could not read that photo. Try another shot?')
    } finally {
      setScanning(false)
    }
  }

  const handleVet = async () => {
    setVetOpen(true)
    setVetLoading(true)
    setVetPlan('')
    try {
      const plan = await vetCoachPlan(pet)
      setVetPlan(plan)
    } catch (err) {
      console.error(err)
      setVetPlan(
        "Let's start small today — a glass of water, one vegetable at your next meal, and 10 minutes outside. Small things add up.",
      )
    } finally {
      setVetLoading(false)
    }
  }

  const handleVetAccept = () => {
    setPet((p) => ({
      ...p,
      score: clampScore(p.score + 8),
      lastMessage: "Thanks for looking out for me. Let's do this together.",
      lastMessageAt: Date.now(),
    }))
    setVetOpen(false)
    popFlash()
    showToast('On the road to recovery 💚')
  }

  const handleNudge = (f: Friend) => {
    showToast(`Sent ${f.name} some love for ${f.petName} 💌`)
  }

  const handleReset = () => {
    if (confirm('Reset your pet? This clears local progress.')) {
      const fresh = defaultState()
      setPet(fresh)
      showToast('Fresh start ✨')
    }
  }

  const needsVet = mood === 'critical' || mood === 'wilting'

  return (
    <div className="min-h-screen max-w-md mx-auto p-4 pb-28 space-y-4">
      <header className="flex items-center justify-between pt-2 pb-1">
        <div>
          <div className="text-2xl font-bold tracking-tight">
            <span className="text-rose-500">Pet</span>Pal
          </div>
          <div className="text-xs text-gray-500">Your health, mirrored</div>
        </div>
        <button onClick={handleReset} className="btn-ghost text-xs" title="Reset demo state">
          Reset
        </button>
      </header>

      <Pet pet={pet} flash={flash} />

      <PetBubble message={pet.lastMessage} thinking={scanning} />

      <div className="space-y-3">
        <MealScanButton onFile={handleMealScan} disabled={scanning} />

        {needsVet && (
          <button
            onClick={handleVet}
            className="w-full py-3 rounded-full border-2 border-rose-300 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 active:scale-95 transition"
          >
            🏥 Take {pet.name} to the vet
          </button>
        )}
      </div>

      <HydrationBar value={pet.hydration} onAdd={handleHydration} />

      <FriendsStrip friends={MOCK_FRIENDS} onNudge={handleNudge} />

      <VetModal
        open={vetOpen}
        petName={pet.name}
        loading={vetLoading}
        plan={vetPlan}
        onClose={() => setVetOpen(false)}
        onAccept={handleVetAccept}
      />

      <Toast message={toast} />

      <footer className="text-center text-xs text-gray-400 pt-4">
        Built with Claude · mock data for demo
      </footer>
    </div>
  )
}
