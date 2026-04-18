import { useEffect, useMemo, useRef, useState } from "react";

type Species = "slime" | "cat" | "dog" | "dragon";
type Mood = "Thriving" | "Healthy" | "Okay" | "Sluggish" | "Unwell" | "Critical";

type Scores = {
  food: number;
  sleep: number;
  water: number;
  move: number;
  calm: number;
};

type Friend = {
  id: string;
  name: string;
  pet: string;
  species: Species;
  mood: Mood;
  streak: number;
  score: number;
};

type PetData = {
  name: string;
  species: Species;
  dietary: string[];
  goals: string[];
  scores: Scores;
  streak: number;
  waterToday: number;
  waterGoal: number;
};

const SPECIES: Record<Species, { emoji: string; label: string; color: string }> = {
  slime: { emoji: "🫧", label: "Slime", color: "#8BC6EC" },
  cat: { emoji: "🐱", label: "Cat", color: "#F5C2A5" },
  dog: { emoji: "🐶", label: "Dog", color: "#E1C699" },
  dragon: { emoji: "🐉", label: "Dragon", color: "#B8A7E5" },
};

const DIETARY = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Lactose intolerant",
  "Nut allergy",
  "Low sodium",
];

const FRIENDS: Friend[] = [
  { id: "1", name: "Alex", pet: "Biscuit", species: "dog", mood: "Thriving", streak: 22, score: 92 },
  { id: "2", name: "Jordan", pet: "Ember", species: "dragon", mood: "Healthy", streak: 6, score: 78 },
  { id: "3", name: "Sam", pet: "Pixel", species: "slime", mood: "Sluggish", streak: 2, score: 52 },
  { id: "4", name: "Casey", pet: "Luna", species: "cat", mood: "Okay", streak: 8, score: 64 },
  { id: "5", name: "Riley", pet: "Tofu", species: "slime", mood: "Thriving", streak: 41, score: 94 },
  { id: "6", name: "Morgan", pet: "Haku", species: "dragon", mood: "Healthy", streak: 15, score: 81 },
];

function overallScore(s: Scores) {
  return Math.round(s.food * 0.35 + s.sleep * 0.25 + s.water * 0.2 + s.move * 0.15 + s.calm * 0.05);
}

function getMood(score: number): Mood {
  if (score >= 90) return "Thriving";
  if (score >= 75) return "Healthy";
  if (score >= 60) return "Okay";
  if (score >= 40) return "Sluggish";
  if (score >= 20) return "Unwell";
  return "Critical";
}

function moodMeta(mood: Mood) {
  const map: Record<Mood, { color: string; dot: string; phrase: string }> = {
    Thriving: { color: "#3B8264", dot: "bg-emerald-500", phrase: "glowing" },
    Healthy: { color: "#4A7C59", dot: "bg-green-500", phrase: "good" },
    Okay: { color: "#8B7A3A", dot: "bg-amber-500", phrase: "okay" },
    Sluggish: { color: "#A05A2C", dot: "bg-orange-500", phrase: "tired" },
    Unwell: { color: "#7A7A7A", dot: "bg-zinc-400", phrase: "off" },
    Critical: { color: "#5A5A5A", dot: "bg-zinc-500", phrase: "needs care" },
  };
  return map[mood];
}

function Pet({ species, scores, mood }: { species: Species; scores: Scores; mood: Mood }) {
  const eyeOpen = Math.max(0.35, Math.min(1, scores.sleep / 100));
  const bounce = 3.2 - (scores.move / 100) * 1.4;
  const cracked = scores.water < 48;
  const pale = scores.food < 42;

  const base = SPECIES[species].color;
  const color = pale ? "#CBD5E1" : base;

  const eyeH = 14 * eyeOpen;

  const mouth = useMemo(() => {
    if (mood === "Thriving" || mood === "Healthy")
      return <path d="M106 158 Q122 174 138 158" stroke="#2b2b2b" strokeWidth="3" fill="none" strokeLinecap="round" />;
    if (mood === "Okay") return <line x1="110" y1="160" x2="134" y2="160" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />;
    return <path d="M106 166 Q122 154 138 166" stroke="#2b2b2b" strokeWidth="3" fill="none" strokeLinecap="round" />;
  }, [mood]);

  return (
    <div className="relative w-[260px] h-[260px] mx-auto">
      <div className="absolute inset-0 blur-3xl opacity-40" style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }} />
      <svg viewBox="0 0 244 244" className="relative w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
        <defs>
          <radialGradient id="body" cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="40%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feBlend in="SourceGraphic" in2="b" mode="normal"/>
          </filter>
        </defs>

        {/* sparkles */}
        {(mood === "Thriving" || mood === "Healthy") && (
          <g opacity="0.9">
            <circle cx="52" cy="68" r="3.2" fill="#FDE68A">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="202" cy="82" r="2.4" fill="#FDE68A">
              <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="192" cy="176" r="3" fill="#FDE68A">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* body variants */}
        <g filter="url(#soft)">
          {species === "slime" && (
            <ellipse cx="122" cy="150" rx="74" ry="58" fill="url(#body)">
              <animate attributeName="ry" values="58;62;58" dur={`${bounce}s`} repeatCount="indefinite" />
            </ellipse>
          )}
          {species === "cat" && (
            <>
              <ellipse cx="122" cy="162" rx="64" ry="48" fill="url(#body)" />
              <circle cx="122" cy="118" r="46" fill="url(#body)" />
              <path d="M86 82l10 18 12-10z" fill={color} />
              <path d="M158 82l-10 18-12-10z" fill={color} />
            </>
          )}
          {species === "dog" && (
            <>
              <ellipse cx="122" cy="164" rx="68" ry="52" fill="url(#body)" />
              <circle cx="122" cy="116" r="48" fill="url(#body)" />
              <ellipse cx="80" cy="116" rx="13" ry="22" fill={color} />
              <ellipse cx="164" cy="116" rx="13" ry="22" fill={color} />
            </>
          )}
          {species === "dragon" && (
            <>
              <ellipse cx="122" cy="164" rx="68" ry="52" fill="url(#body)" />
              <circle cx="122" cy="116" r="46" fill="url(#body)" />
              <path d="M96 78l12 16 12-12z" fill={color} />
              <path d="M148 78l-12 16-12-12z" fill={color} />
            </>
          )}
        </g>

        {/* highlight */}
        <ellipse cx="100" cy="126" rx="16" ry="9" fill="white" opacity="0.45" />

        {/* cracks if dehydrated */}
        {cracked && (
          <g stroke="#8B8B8B" strokeWidth="1.2" opacity="0.45" fill="none">
            <path d="M88 130 q6 10 12 18" />
            <path d="M152 118 q6 12 10 18" />
          </g>
        )}

        {/* eyes */}
        <ellipse cx="104" cy="132" rx="5.5" ry={eyeH / 2} fill="#1f2937" />
        <ellipse cx="140" cy="132" rx="5.5" ry={eyeH / 2} fill="#1f2937" />

        {/* mouth */}
        {mouth}
      </svg>
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [step, setStep] = useState(1);
  const [pet, setPet] = useState<PetData>({
    name: "Mochi",
    species: "slime",
    dietary: ["Vegetarian"],
    goals: ["Sleep better"],
    scores: { food: 72, sleep: 58, water: 68, move: 61, calm: 74 },
    streak: 8,
    waterToday: 44,
    waterGoal: 64,
  });
  const [showCheckin, setShowCheckin] = useState<null | "meal" | "water" | "sleep">(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pethealth:v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPet(parsed.pet);
        setOnboarded(parsed.onboarded);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pethealth:v1", JSON.stringify({ pet, onboarded }));
  }, [pet, onboarded]);

  const score = overallScore(pet.scores);
  const mood = getMood(score);
  const meta = moodMeta(mood);

  const voice = useMemo(() => {
    const s = pet.scores;
    if (s.sleep < 50) return "I slept a little sideways last night… gentle morning?";
    if (s.water < 50) return "My skin feels papery. Could we sip some water together?";
    if (s.food < 45) return "That last meal sat heavy. No stress — we’ll balance it.";
    if (pet.streak >= 7) return `Day ${pet.streak}. I'm proud of us. Little steps count.`;
    if (mood === "Thriving") return "I feel light today. Want to do something just for fun?";
    if (mood === "Critical") return "I'm not okay right now. Can we slow down and call the vet plan?";
    return "Morning. What’s one kind thing we can do for our body today?";
  }, [pet.scores, pet.streak, mood]);

  const progressWater = Math.min(1, pet.waterToday / pet.waterGoal);

  const quickLog = (kind: "meal" | "water" | "sleep") => {
    setShowCheckin(null);
    setToast(kind === "meal" ? "Logged meal · +5 food" : kind === "water" ? "Logged water · +4 hydration" : "Logged wind-down · +6 sleep");
    setTimeout(() => setToast(null), 1800);
    setPet((p) => {
      if (kind === "meal") return { ...p, scores: { ...p.scores, food: Math.min(100, p.scores.food + 5) } };
      if (kind === "water") return { ...p, waterToday: p.waterToday + 8, scores: { ...p.scores, water: Math.min(100, p.scores.water + 4) } };
      return { ...p, scores: { ...p.scores, sleep: Math.min(100, p.scores.sleep + 6) } };
    });
  };

  const nudge = (delta: Partial<Scores>) => {
    setPet((p) => ({ ...p, scores: { ...p.scores, ...Object.fromEntries(Object.entries(delta).map(([k, v]) => [k, Math.max(0, Math.min(100, (p.scores as any)[k] + (v as number)))])) } as Scores }));
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Onboarding
  if (!onboarded) {
    return (
      <div className="min-h-screen bg-[radial-gradient(1200px_800px_at_50%_-10%,#FFF1E6_0%,#FFF8F0_25%,#F0F7FF_70%,#EEF2FF_100%)] text-zinc-800">
        <div className="mx-auto max-w-[880px] px-6 py-10 md:py-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] grid place-items-center">🫧</div>
              <div className="font-[Fraunces] text-[22px] tracking-tight">PetHealth</div>
            </div>
            <div className="text-xs text-zinc-500">Mirrors, not judges</div>
          </div>

          <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-[Fraunces] text-[40px] leading-[1.05] md:text-[56px]">Meet a companion who feels how you feel.</h1>
              <p className="mt-4 text-[15px] leading-6 text-zinc-600 max-w-[48ch]">Quick setup, then your pet lives on your home screen. It gets brighter when you sleep, bouncier when you move, softer when you hydrate. No calorie counts. No shame.</p>

              <div className="mt-8 flex items-center gap-3">
                <div className="h-px w-10 bg-zinc-300" />
                <div className="text-[12px] uppercase tracking-widest text-zinc-500">30-second setup</div>
              </div>

              <div className="mt-6 rounded-[28px] bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(27,35,58,0.12)] border border-white/60 p-6">
                {step === 1 && (
                  <div>
                    <div className="text-[13px] text-zinc-500">Step 1 of 3 · Choose a species</div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {(Object.keys(SPECIES) as Species[]).map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setPet((p) => ({ ...p, species: sp }))}
                          className={`group relative rounded-2xl border bg-white p-4 text-left transition hover:shadow-md ${pet.species === sp ? "border-zinc-900/20 ring-2 ring-zinc-900/10" : "border-zinc-200"}`}
                        >
                          <div className="text-[28px]">{SPECIES[sp].emoji}</div>
                          <div className="mt-1 font-medium">{SPECIES[sp].label}</div>
                          <div className="text-xs text-zinc-500">feels your habits</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button onClick={() => setStep(2)} className="rounded-full bg-zinc-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-zinc-800">Continue</button>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <div className="text-[13px] text-zinc-500">Step 2 of 3 · Name your pet</div>
                    <input value={pet.name} onChange={(e) => setPet((p) => ({ ...p, name: e.target.value }))} className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-zinc-900/10" placeholder="Mochi" />
                    <div className="mt-5 flex items-center justify-between">
                      <button onClick={() => setStep(1)} className="text-sm text-zinc-600 hover:text-zinc-900">Back</button>
                      <button onClick={() => setStep(3)} className="rounded-full bg-zinc-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-zinc-800">Continue</button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <div className="text-[13px] text-zinc-500">Step 3 of 3 · Make it yours (optional)</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {DIETARY.map((d) => {
                        const active = pet.dietary.includes(d);
                        return (
                          <button key={d} onClick={() => setPet((p) => ({ ...p, dietary: active ? p.dietary.filter((x) => x !== d) : [...p.dietary, d] }))} className={`rounded-xl border px-3 py-2 text-sm ${active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>{d}</button>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <button onClick={() => setStep(2)} className="text-sm text-zinc-600 hover:text-zinc-900">Back</button>
                      <button onClick={() => setOnboarded(true)} className="rounded-full bg-zinc-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-zinc-800">Meet my pet</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 -z-10 bg-[radial-gradient(400px_240px_at_60%_40%,rgba(139,198,236,0.35),transparent)] blur-2xl" />
              <div className="rounded-[36px] bg-white/60 backdrop-blur-2xl border border-white/70 shadow-[0_30px_80px_rgba(16,24,40,0.12)] p-8">
                <Pet species={pet.species} scores={pet.scores} mood={getMood(overallScore(pet.scores))} />
                <div className="mx-auto mt-4 max-w-[320px] rounded-2xl bg-white/80 px-4 py-3 text-center text-[14px] italic text-zinc-700 shadow-sm border border-zinc-100">“{voice}”</div>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[
                    { k: "Food", v: pet.scores.food },
                    { k: "Sleep", v: pet.scores.sleep },
                    { k: "Water", v: pet.scores.water },
                    { k: "Move", v: pet.scores.move },
                  ].map((m) => (
                    <div key={m.k} className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 text-center">
                      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{m.k}</div>
                      <div className="mt-1 text-[18px] font-semibold">{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[radial-gradient(1200px_900px_at_50%_-20%,#FFF6ED_0%,#FFF8F0_22%,#F3F7FF_65%,#EEF2FF_100%)] text-zinc-900 selection:bg-violet-200/60">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
        html, body { font-family: Outfit, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
        .fraunces { font-family: Fraunces, Georgia, serif; }
      `}</style>

      {/* top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/50 border-b border-white/60">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-white shadow grid place-items-center">🫧</div>
            <div className="fraunces text-[20px] leading-none">PetHealth</div>
            <span className="ml-2 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] border border-zinc-200">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {mood} · {score}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => nudge({ sleep: -8, food: -6 })} className="hidden sm:inline-flex rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs hover:bg-white">simulate rough night</button>
            <button onClick={() => setOnboarded(false)} className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs hover:bg-white">reset</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1100px] px-4 sm:px-6 py-8 md:py-12">
        {/* hero */}
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          {/* pet card */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 bg-[radial-gradient(500px_300px_at_50%_30%,rgba(120,170,255,0.18),transparent)] blur-3xl" />
            <div className="rounded-[32px] border border-white/70 bg-white/65 backdrop-blur-2xl shadow-[0_30px_80px_rgba(16,24,40,0.10)] p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="fraunces text-[32px] md:text-[40px] leading-[1.05]">{pet.name}</h1>
                    <span className="text-2xl">{SPECIES[pet.species].emoji}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-zinc-600">
                    <span className={`inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
                    <span>Feeling <b className="text-zinc-800">{meta.phrase}</b> today</span>
                    <span className="opacity-40">·</span>
                    <span>🔥 {pet.streak} day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-widest text-zinc-500">Overall</div>
                  <div className="fraunces text-[44px] leading-none" style={{ color: meta.color }}>{score}</div>
                </div>
              </div>

              <div className="mt-6">
                <Pet species={pet.species} scores={pet.scores} mood={mood} />
              </div>

              <div className="mx-auto -mt-2 max-w-[420px]">
                <div className="relative rounded-[20px] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-zinc-100">
                  <div className="absolute -top-2 left-8 h-3 w-3 rotate-45 bg-white border-l border-t border-zinc-100" />
                  <p className="text-[14px] leading-6 text-zinc-700 italic">“{voice}”</p>
                </div>
              </div>

              {/* pillars */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Food", key: "food", icon: "🍎" },
                  { label: "Sleep", key: "sleep", icon: "😴" },
                  { label: "Water", key: "water", icon: "💧" },
                  { label: "Move", key: "move", icon: "🏃" },
                ].map((p) => {
                  const v = (pet.scores as any)[p.key] as number;
                  return (
                    <div key={p.key} className="group rounded-2xl border border-zinc-200/70 bg-white/80 p-3.5 hover:shadow-md transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[12px] text-zinc-600">
                          <span>{p.icon}</span> {p.label}
                        </div>
                        <div className="text-[12px] font-medium text-zinc-700">{v}</div>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: `linear-gradient(90deg, ${meta.color}, #8B8B8B)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* quick actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => setShowCheckin("meal")} className="rounded-full bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800">Log meal</button>
                <button onClick={() => setShowCheckin("water")} className="rounded-full bg-white border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">Add water</button>
                <button onClick={() => setShowCheckin("sleep")} className="rounded-full bg-white border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">Wind-down</button>
                <button onClick={() => nudge({ move: 6, calm: 4 })} className="rounded-full bg-white border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50">2-min stretch</button>
              </div>
            </div>
          </div>

          {/* right column: water + today */}
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/70 bg-white/65 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 grid place-items-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">💧</div>
                  <div>
                    <div className="text-[13px] text-zinc-500">Water today</div>
                    <div className="text-[22px] font-semibold leading-none">{pet.waterToday} <span className="text-zinc-400 text-[14px]">/ {pet.waterGoal} oz</span></div>
                  </div>
                </div>
                <div className="text-[12px] text-zinc-500">Goal auto-adjusts</div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full bg-sky-500/80 transition-all" style={{ width: `${Math.round(progressWater * 100)}%` }} />
              </div>
              <div className="mt-3 flex gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`h-7 flex-1 rounded-lg border ${i < Math.floor(pet.waterToday / 8) ? "bg-sky-500/15 border-sky-200" : "bg-zinc-50 border-zinc-200"}`} />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/65 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5">
              <div className="text-[13px] text-zinc-500">Today’s gentle plan</div>
              <ul className="mt-2 space-y-2 text-[14px]">
                <li className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white/70 px-3 py-2">
                  <span>Morning light · 5 min</span>
                  <button onClick={() => nudge({ sleep: 3, calm: 2 })} className="text-xs rounded-full border border-zinc-200 px-2.5 py-1 hover:bg-zinc-50">Done</button>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white/70 px-3 py-2">
                  <span>Protein at lunch</span>
                  <button onClick={() => nudge({ food: 4 })} className="text-xs rounded-full border border-zinc-200 px-2.5 py-1 hover:bg-zinc-50">Done</button>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white/70 px-3 py-2">
                  <span>Walk after dinner</span>
                  <button onClick={() => nudge({ move: 5 })} className="text-xs rounded-full border border-zinc-200 px-2.5 py-1 hover:bg-zinc-50">Done</button>
                </li>
              </ul>
              <p className="mt-3 text-[12px] text-zinc-500">Tiny actions, no streak pressure. Your pet reflects, never scolds.</p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/60 backdrop-blur-2xl p-5">
              <div className="text-[13px] text-zinc-500">How this works</div>
              <p className="mt-1 text-[13px] leading-5 text-zinc-600">Your pet’s eyes mirror sleep, bounce mirrors movement, cracks appear when dry, color dulls after heavy meals. It’s a mirror—not a grade.</p>
            </div>
          </div>
        </div>

        {/* friends strip — always visible */}
        <div className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="fraunces text-[22px]">Friends</h2>
            <div className="text-[12px] text-zinc-500">See how their pets feel — gentle accountability</div>
          </div>

          <div className="mt-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3 min-w-full pb-1">
              {FRIENDS.map((f) => {
                const fm = moodMeta(f.mood);
                return (
                  <div key={f.id} className="group relative shrink-0 w-[220px] rounded-[22px] border border-white/70 bg-white/70 backdrop-blur-xl p-4 shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] transition">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 grid place-items-center rounded-2xl bg-zinc-50 border border-zinc-200">
                        <span className="text-[26px]">{SPECIES[f.species].emoji}</span>
                        <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white ${fm.dot}`} title={f.mood} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-medium">{f.name} · {f.pet}</div>
                        <div className="flex items-center gap-2 text-[12px] text-zinc-600">
                          <span>{f.mood}</span>
                          <span className="opacity-40">•</span>
                          <span>🔥 {f.streak}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[11px] uppercase tracking-wide text-zinc-500">Wellbeing</div>
                      <div className="text-[15px] font-semibold" style={{ color: fm.color }}>{f.score}</div>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full" style={{ width: `${f.score}%`, background: `linear-gradient(90deg, ${fm.color}, #cbd5e1)` }} />
                    </div>
                    <button className="mt-3 w-full rounded-xl border border-zinc-200 bg-white py-1.5 text-[12px] hover:bg-zinc-50">Send high-five</button>
                  </div>
                );
              })}

              {/* invite card */}
              <div className="shrink-0 w-[220px] rounded-[22px] border border-dashed border-zinc-300 bg-white/50 backdrop-blur-xl p-4 grid place-items-center text-center">
                <div>
                  <div className="mx-auto h-10 w-10 rounded-2xl bg-zinc-100 grid place-items-center">＋</div>
                  <div className="mt-2 text-[13px] font-medium">Invite a friend</div>
                  <div className="text-[12px] text-zinc-500">Share your pet (no numbers)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* check-in sheet */}
      {showCheckin && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-zinc-950/30 backdrop-blur-sm p-0 sm:p-6" onClick={() => setShowCheckin(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-[420px] rounded-t-[28px] sm:rounded-[28px] border border-white/70 bg-white/90 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.18)] p-5">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-200 sm:hidden" />
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-medium">
                {showCheckin === "meal" ? "Log a meal" : showCheckin === "water" ? "Add water" : "Wind-down"}
              </div>
              <button onClick={() => setShowCheckin(null)} className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50">Close</button>
            </div>

            {showCheckin === "meal" && (
              <div className="mt-3 space-y-3">
                <input placeholder="What did you eat?" className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-zinc-900/10" />
                <div className="grid grid-cols-3 gap-2">
                  {["Balanced", "Light", "Heavy"].map((t) => (
                    <button key={t} onClick={() => quickLog("meal")} className="rounded-xl border border-zinc-200 bg-white py-2 text-sm hover:bg-zinc-50">{t}</button>
                  ))}
                </div>
                <p className="text-[12px] text-zinc-500">We don’t count calories. Your pet just notices how you feel after.</p>
              </div>
            )}

            {showCheckin === "water" && (
              <div className="mt-3">
                <div className="grid grid-cols-3 gap-2">
                  {[8, 12, 16].map((oz) => (
                    <button key={oz} onClick={() => quickLog("water")} className="rounded-xl border border-zinc-200 bg-white py-3 text-[15px] hover:bg-zinc-50">+{oz} oz</button>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-zinc-500">Cracks fade as you hydrate. Tiny sips count.</p>
              </div>
            )}

            {showCheckin === "sleep" && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[13px]">Try: dim lights, 4-7-8 breathing, no screens.</div>
                <button onClick={() => quickLog("sleep")} className="w-full rounded-xl bg-zinc-900 text-white py-2.5 text-sm hover:bg-zinc-800">I did a wind-down</button>
                <p className="text-[12px] text-zinc-500">Your pet’s eyes open wider tomorrow.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full border border-white/70 bg-white/90 px-4 py-2 text-[13px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">{toast}</div>
        </div>
      )}

      {/* footer hint */}
      <div className="pb-10" />
    </div>
  );
}
