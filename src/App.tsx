import { useEffect, useMemo, useRef, useState } from "react";

import foxThrive from "@/assets/pets/fox/thrive.png";
import foxHealthy from "@/assets/pets/fox/healthy.png";
import foxSluggish from "@/assets/pets/fox/sluggish.png";
import foxUnwell from "@/assets/pets/fox/unwell.png";
import rabbitThrive from "@/assets/pets/rabbit/thrive.png";
import rabbitHealthy from "@/assets/pets/rabbit/healthy.png";
import rabbitSluggish from "@/assets/pets/rabbit/sluggish.png";
import rabbitUnwell from "@/assets/pets/rabbit/unwell.png";
import hamsterThrive from "@/assets/pets/hamster/thrive.png";
import hamsterHealthy from "@/assets/pets/hamster/healthy.png";
import hamsterSluggish from "@/assets/pets/hamster/sluggish.png";
import hamsterUnwell from "@/assets/pets/hamster/unwell.png";

type Species = "fox" | "rabbit" | "hamster";
type PetImageKey = "thrive" | "healthy" | "sluggish" | "unwell";
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

type MorningFeeling = "rested" | "okay" | "groggy" | "stressed";

type MorningData = {
  date: string;
  sleepMinutes: number;
  sleepScore: number;
  hrv: number;
  restingHr: number;
  stages: { deep: number; rem: number; light: number; awake: number };
  bedtime: string;
  wakeTime: string;
  calmScore: number;
  feeling: MorningFeeling;
  steps: number;
  activeMinutes: number;
  calories: { consumed: number; goal: number };
  macros: { carbs: number; protein: number; fat: number };
};

type PlanItem = { label: string; detail: string; delta: Partial<Scores>; addresses: string; reasoning: string };

type MealTone = "approve" | "neutral" | "warn";
type MealAnalysis = {
  label: string;
  foodDelta: number;
  note: string;
  tone: MealTone;
  reaction: string;
  reactionKey: PetImageKey;
};

type MealLog = {
  id: string;
  timestamp: number;
  image: string;
  analysis: MealAnalysis;
  macros: { calories: number; carbs: number; protein: number; fat: number };
};

function estimateMacros(tone: MealTone, seed: number): MealLog["macros"] {
  const jitter = (base: number, range: number) => base + ((seed % (range * 2 + 1)) - range);
  if (tone === "approve") {
    return { calories: jitter(460, 60), carbs: jitter(48, 6), protein: jitter(26, 4), fat: jitter(18, 3) };
  }
  if (tone === "neutral") {
    return { calories: jitter(620, 70), carbs: jitter(72, 8), protein: jitter(30, 5), fat: jitter(22, 4) };
  }
  return { calories: jitter(840, 90), carbs: jitter(96, 10), protein: jitter(28, 4), fat: jitter(40, 6) };
}

const SPECIES: Record<Species, { label: string; color: string; images: Record<PetImageKey, string> }> = {
  fox: {
    label: "Fox",
    color: "#F5C2A5",
    images: { thrive: foxThrive, healthy: foxHealthy, sluggish: foxSluggish, unwell: foxUnwell },
  },
  rabbit: {
    label: "Rabbit",
    color: "#D9DEE6",
    images: { thrive: rabbitThrive, healthy: rabbitHealthy, sluggish: rabbitSluggish, unwell: rabbitUnwell },
  },
  hamster: {
    label: "Hamster",
    color: "#E9C79A",
    images: { thrive: hamsterThrive, healthy: hamsterHealthy, sluggish: hamsterSluggish, unwell: hamsterUnwell },
  },
};

function moodToImageKey(mood: Mood): PetImageKey {
  if (mood === "Thriving") return "thrive";
  if (mood === "Healthy" || mood === "Okay") return "healthy";
  if (mood === "Sluggish") return "sluggish";
  return "unwell";
}

function petImage(species: Species, mood: Mood) {
  return SPECIES[species].images[moodToImageKey(mood)];
}

const DIETARY = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Lactose intolerant",
  "Nut allergy",
  "Low sodium",
];

const FRIENDS: Friend[] = [
  { id: "1", name: "Alex", pet: "Biscuit", species: "fox", mood: "Thriving", streak: 22, score: 92 },
  { id: "2", name: "Jordan", pet: "Ember", species: "hamster", mood: "Healthy", streak: 6, score: 78 },
  { id: "3", name: "Sam", pet: "Pixel", species: "rabbit", mood: "Sluggish", streak: 2, score: 52 },
  { id: "4", name: "Casey", pet: "Luna", species: "rabbit", mood: "Okay", streak: 8, score: 64 },
  { id: "5", name: "Riley", pet: "Tofu", species: "hamster", mood: "Thriving", streak: 41, score: 94 },
  { id: "6", name: "Morgan", pet: "Haku", species: "fox", mood: "Healthy", streak: 15, score: 81 },
];

function overallScore(s: Scores) {
  return Math.round(s.food * 0.35 + s.sleep * 0.25 + s.water * 0.2 + s.move * 0.15 + s.calm * 0.05);
}

const SLUGGISH_BASELINE: Scores = { food: 45, sleep: 45, water: 40, move: 42, calm: 48 };

const MORNING_VARIANTS: Omit<MorningData, "date">[] = [
  {
    sleepMinutes: 7 * 60 + 42,
    sleepScore: 86,
    hrv: 64,
    restingHr: 58,
    stages: { deep: 92, rem: 108, light: 240, awake: 22 },
    bedtime: "11:18 PM",
    wakeTime: "7:00 AM",
    calmScore: 78,
    feeling: "rested",
    steps: 1240,
    activeMinutes: 8,
    calories: { consumed: 0, goal: 2100 },
    macros: { carbs: 0, protein: 0, fat: 0 },
  },
  {
    sleepMinutes: 6 * 60 + 54,
    sleepScore: 71,
    hrv: 52,
    restingHr: 62,
    stages: { deep: 68, rem: 88, light: 222, awake: 36 },
    bedtime: "12:06 AM",
    wakeTime: "7:00 AM",
    calmScore: 66,
    feeling: "okay",
    steps: 640,
    activeMinutes: 4,
    calories: { consumed: 0, goal: 2100 },
    macros: { carbs: 0, protein: 0, fat: 0 },
  },
  {
    sleepMinutes: 5 * 60 + 38,
    sleepScore: 52,
    hrv: 38,
    restingHr: 68,
    stages: { deep: 42, rem: 58, light: 200, awake: 38 },
    bedtime: "1:12 AM",
    wakeTime: "6:50 AM",
    calmScore: 48,
    feeling: "groggy",
    steps: 380,
    activeMinutes: 2,
    calories: { consumed: 0, goal: 2100 },
    macros: { carbs: 0, protein: 0, fat: 0 },
  },
  {
    sleepMinutes: 6 * 60 + 12,
    sleepScore: 58,
    hrv: 31,
    restingHr: 72,
    stages: { deep: 54, rem: 64, light: 196, awake: 58 },
    bedtime: "12:48 AM",
    wakeTime: "7:00 AM",
    calmScore: 38,
    feeling: "stressed",
    steps: 520,
    activeMinutes: 3,
    calories: { consumed: 0, goal: 2100 },
    macros: { carbs: 0, protein: 0, fat: 0 },
  },
  {
    sleepMinutes: 8 * 60 + 6,
    sleepScore: 92,
    hrv: 71,
    restingHr: 55,
    stages: { deep: 104, rem: 120, light: 244, awake: 18 },
    bedtime: "10:42 PM",
    wakeTime: "6:48 AM",
    calmScore: 82,
    feeling: "rested",
    steps: 1860,
    activeMinutes: 12,
    calories: { consumed: 0, goal: 2100 },
    macros: { carbs: 0, protein: 0, fat: 0 },
  },
];

function hashDate(iso: string) {
  let h = 0;
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateMorning(date: string): MorningData {
  const variant = MORNING_VARIANTS[hashDate(date) % MORNING_VARIANTS.length];
  return { ...variant, date };
}

const PLANS: Record<MorningFeeling, PlanItem[]> = {
  rested: [
    {
      label: "Ride the good wave",
      detail: "20-min workout while energy is high",
      delta: { move: 7 },
      addresses: "High recovery capacity",
      reasoning: "Elevated HRV and a low resting heart rate mean your autonomic nervous system has room to absorb training stress. Days like this are when you build fitness without digging a hole — skip intensity when you’re depleted, push it when you’re recovered.",
    },
    {
      label: "Veggie-forward lunch",
      detail: "Double the greens today",
      delta: { food: 6 },
      addresses: "Nutrient density",
      reasoning: "Plant variety (aim for 30+ different plant foods weekly) correlates strongly with gut microbiome diversity, which in turn tracks with mood stability and immune function. A rested body also digests fiber-rich meals more comfortably.",
    },
    {
      label: "Keep the rhythm",
      detail: "Same bedtime tonight — don’t break it",
      delta: { sleep: 2, calm: 2 },
      addresses: "Circadian consistency",
      reasoning: "The single biggest lever on tomorrow’s sleep is tonight’s bedtime regularity. A 60–90 minute shift can drop your next sleep score by 10–20 points — protect the good night you just had.",
    },
  ],
  okay: [
    {
      label: "Morning light · 5 min",
      detail: "Sunlight on your face before screens",
      delta: { sleep: 3, calm: 2 },
      addresses: "Circadian alignment",
      reasoning: "Outdoor light is roughly 10,000 lux versus ~500 lux from indoor lighting. Five to ten minutes within an hour of waking sets your suprachiasmatic nucleus — it advances melatonin tonight and improves how deep you go.",
    },
    {
      label: "Protein at lunch",
      detail: "Steadier energy into the afternoon",
      delta: { food: 4 },
      addresses: "Afternoon energy dip",
      reasoning: "Lunches that clear 25–30g of protein stabilize blood sugar for the afternoon, reducing the 2–4pm dip behind most snack cravings. Eggs, chicken, Greek yogurt, lentils — they all count.",
    },
    {
      label: "Walk after dinner",
      detail: "Ten minutes is enough",
      delta: { move: 5 },
      addresses: "Post-meal glucose",
      reasoning: "A 10-minute walk within 30 minutes of finishing dinner improves post-meal glucose response by 20–30% and speeds gastric emptying. That reduces reflux risk and cuts into the restless-sleep pattern that late, heavy meals cause.",
    },
  ],
  groggy: [
    {
      label: "Hydrate before coffee",
      detail: "16oz water first — it helps more than caffeine",
      delta: { water: 5 },
      addresses: "Overnight dehydration",
      reasoning: "You lose 16–20oz of water overnight through respiration and skin. Caffeine is a mild diuretic — leading with it on an empty tank deepens the dehydration and makes the crash at 10am worse. Water first makes the caffeine work better anyway.",
    },
    {
      label: "Bright light walk · 5 min",
      detail: "Resets your circadian clock",
      delta: { sleep: 3, move: 2 },
      addresses: "Sleep debt",
      reasoning: "Bright outdoor light early in the morning is the strongest alerting signal you have. It advances tonight’s melatonin release, helping you fall asleep earlier and start repaying the debt you accumulated last night.",
    },
    {
      label: "Protein-rich breakfast",
      detail: "Carbs alone will crash you by 10",
      delta: { food: 5 },
      addresses: "Blood sugar stability",
      reasoning: "Short sleep elevates cortisol and drops insulin sensitivity the next day — a pure-carb breakfast on a bad night spikes you hard and crashes you harder. A protein-forward breakfast (25g+) buffers the whole curve.",
    },
  ],
  stressed: [
    {
      label: "4-7-8 breathing · 3 rounds",
      detail: "Your HRV is low — this nudges it up",
      delta: { calm: 6 },
      addresses: "Low vagal tone",
      reasoning: "Extended exhales are a direct lever on vagal tone — the parasympathetic ‘brake’ on your nervous system. Inhale 4, hold 7, exhale 8. Three rounds measurably raises HRV within minutes, and it’s portable when your day is loud.",
    },
    {
      label: "Screen-free lunch",
      detail: "Eat away from the desk",
      delta: { calm: 3, food: 2 },
      addresses: "Sympathetic overload",
      reasoning: "Eating while working keeps you in fight-or-flight mode, which suppresses digestion and skips the cognitive reset your brain actually needs. Twenty minutes away from screens is the cheapest stress intervention you have today.",
    },
    {
      label: "Gentle walk · 10 min",
      detail: "Movement, not intensity",
      delta: { move: 4, calm: 3 },
      addresses: "Cortisol clearance",
      reasoning: "Low-intensity movement — the kind where you can still hold a conversation — clears circulating stress hormones without adding more load. A 10-minute walk drops cortisol 10–20%. High-intensity training on a stressed day usually backfires.",
    },
  ],
};

function formatSleep(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
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

function Pet({ species, mood }: { species: Species; mood: Mood }) {
  const color = SPECIES[species].color;
  const src = petImage(species, mood);
  const sparkle = mood === "Thriving" || mood === "Healthy";

  return (
    <div className="relative w-[260px] h-[260px] mx-auto">
      <div className="absolute inset-0 blur-3xl opacity-40" style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }} />
      {sparkle && (
        <>
          <span className="absolute left-[18%] top-[18%] h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" />
          <span className="absolute right-[14%] top-[28%] h-1 w-1 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: "0.4s" }} />
          <span className="absolute right-[20%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" style={{ animationDelay: "0.8s" }} />
        </>
      )}
      <img
        src={src}
        alt={`${SPECIES[species].label} feeling ${mood.toLowerCase()}`}
        className="relative w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

type DetailMeta = { color: string; dot: string; phrase: string };

function buildInsights(m: MorningData, pet: PetData): { title: string; body: string }[] {
  const out: { title: string; body: string }[] = [];
  if (m.feeling === "rested") {
    out.push({ title: "Strong recovery", body: `HRV landed at ${m.hrv} ms — near your top quartile. Body is primed. Good day to train harder or tackle deep work.` });
  }
  if (m.feeling === "groggy") {
    const deficit = Math.max(15, 480 - m.sleepMinutes);
    out.push({ title: "Sleep debt is catching up", body: `Only ${formatSleep(m.sleepMinutes)} last night. Move bedtime ${deficit} minutes earlier tonight — don’t try to pay it back with caffeine.` });
  }
  if (m.feeling === "stressed") {
    out.push({ title: "Nervous system is loud", body: `HRV ${m.hrv} ms with resting HR ${m.restingHr} bpm points to strain. Skip the second coffee and get one real walk outside.` });
  }
  if (m.stages.rem < 75) {
    out.push({ title: "Low REM tonight", body: `${m.stages.rem} min of REM (healthy target 90+). Late meals and alcohol hit REM hardest — worth a look if this is a pattern.` });
  }
  if (pet.scores.water < 40) {
    out.push({ title: "Hydration is behind", body: "Water score is low. Front-load a glass before lunch — dehydration drags mood and focus more than people expect." });
  }
  if (pet.scores.food < 45) {
    out.push({ title: "Meals feel off", body: "Food score is trending low. Try one balanced plate today — protein + fiber + color — before grabbing anything else." });
  }
  if (out.length < 2) {
    out.push({ title: "Steady baseline", body: "No flags today. Keep the rhythm — consistency beats spikes." });
  }
  return out.slice(0, 3);
}

function DetailView({ pet, morning, mood, score, meta, onBack }: { pet: PetData; morning: MorningData; mood: Mood; score: number; meta: DetailMeta; onBack: () => void }) {
  const cals = Math.round(morning.calories.goal * (pet.scores.food / 100) * 0.85);
  const calPct = Math.min(1, cals / morning.calories.goal);
  const carbsG = Math.round((cals * 0.5) / 4);
  const proteinG = Math.round((cals * 0.25) / 4);
  const fatG = Math.round((cals * 0.25) / 9);

  const totalSleep = morning.stages.deep + morning.stages.rem + morning.stages.light + morning.stages.awake;
  const seg = (m: number) => `${(m / totalSleep) * 100}%`;

  const insights = buildInsights(morning, pet);

  const ring = (pct: number, color: string) => {
    const r = 46;
    const c = 2 * Math.PI * r;
    return (
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="#E5E7EB" strokeWidth="10" fill="none" />
        <circle cx="60" cy="60" r={r} stroke={color} strokeWidth="10" fill="none" strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <main className="mx-auto max-w-[1100px] px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-widest text-zinc-500">Today’s read</div>
          <h1 className="fraunces text-[32px] md:text-[40px] leading-[1.1]">How {pet.name} is actually doing</h1>
          <div className="mt-1 text-[13px] text-zinc-600 capitalize">
            <span className={`inline-block h-2 w-2 rounded-full align-middle ${meta.dot}`} /> <b className="text-zinc-800">{mood}</b> · overall {score} · {morning.feeling} morning
          </div>
        </div>
        <button onClick={onBack} className="hidden md:inline-flex rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-[13px] hover:bg-white">Back to home</button>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_1fr] gap-5">
        {/* Sleep card */}
        <section className="rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 grid place-items-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">😴</div>
              <div>
                <div className="text-[13px] text-zinc-500">Last night</div>
                <div className="fraunces text-[24px] leading-none">{formatSleep(morning.sleepMinutes)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Score</div>
              <div className="text-[22px] font-semibold" style={{ color: meta.color }}>{morning.sleepScore}</div>
            </div>
          </div>

          <div className="mt-5 text-[12px] text-zinc-500">{morning.bedtime} → {morning.wakeTime}</div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full bg-indigo-600" style={{ width: seg(morning.stages.deep) }} title={`Deep ${morning.stages.deep}m`} />
            <div className="h-full bg-indigo-400" style={{ width: seg(morning.stages.rem) }} title={`REM ${morning.stages.rem}m`} />
            <div className="h-full bg-indigo-200" style={{ width: seg(morning.stages.light) }} title={`Light ${morning.stages.light}m`} />
            <div className="h-full bg-zinc-300" style={{ width: seg(morning.stages.awake) }} title={`Awake ${morning.stages.awake}m`} />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-[11px] text-zinc-600">
            {[
              { k: "Deep", v: morning.stages.deep, dot: "bg-indigo-600" },
              { k: "REM", v: morning.stages.rem, dot: "bg-indigo-400" },
              { k: "Light", v: morning.stages.light, dot: "bg-indigo-200" },
              { k: "Awake", v: morning.stages.awake, dot: "bg-zinc-300" },
            ].map((s) => (
              <div key={s.k} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span>{s.k}</span>
                <span className="ml-auto tabular-nums text-zinc-500">{s.v}m</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-100 bg-white/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">HRV</div>
              <div className="mt-1 text-[20px] font-semibold">{morning.hrv} <span className="text-[12px] font-normal text-zinc-500">ms</span></div>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-white/70 p-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Resting HR</div>
              <div className="mt-1 text-[20px] font-semibold">{morning.restingHr} <span className="text-[12px] font-normal text-zinc-500">bpm</span></div>
            </div>
          </div>
        </section>

        {/* Nutrition card */}
        <section className="rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 md:p-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-xl bg-rose-50 text-rose-700 border border-rose-100">🍎</div>
            <div>
              <div className="text-[13px] text-zinc-500">Nutrition today</div>
              <div className="fraunces text-[22px] leading-none">Estimated from logs</div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-5">
            <div className="relative shrink-0">
              {ring(calPct, "#E11D48")}
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-[20px] font-semibold tabular-nums">{cals}</div>
                  <div className="text-[11px] text-zinc-500">of {morning.calories.goal} kcal</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: "Carbs", g: carbsG, color: "#F59E0B", target: 240 },
                { label: "Protein", g: proteinG, color: "#10B981", target: 110 },
                { label: "Fat", g: fatG, color: "#6366F1", target: 70 },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-zinc-700">{r.label}</span>
                    <span className="tabular-nums text-zinc-500">{r.g}g <span className="opacity-60">/ {r.target}g</span></span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (r.g / r.target) * 100)}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[12px] text-zinc-500">Estimated from meal photos you’ve logged. We don’t count calories at you — just translate them.</p>
        </section>

        {/* Movement card */}
        <section className="rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 md:p-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">🏃</div>
            <div>
              <div className="text-[13px] text-zinc-500">Movement</div>
              <div className="fraunces text-[22px] leading-none">So far today</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-100 bg-white/70 p-4">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Steps</div>
              <div className="mt-1 text-[26px] font-semibold tabular-nums">{morning.steps.toLocaleString()}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (morning.steps / 8000) * 100)}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">of 8,000 goal</div>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-white/70 p-4">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Active minutes</div>
              <div className="mt-1 text-[26px] font-semibold tabular-nums">{morning.activeMinutes}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (morning.activeMinutes / 30) * 100)}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-zinc-500">of 30-min target</div>
            </div>
          </div>
        </section>

        {/* Personalized analysis */}
        <section className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 md:p-6">
          <div className="flex items-center gap-3">
            <img src={petImage(pet.species, mood)} alt="" className="h-10 w-10 object-contain" style={{ imageRendering: "pixelated" }} />
            <div>
              <div className="text-[13px] text-zinc-500">{pet.name}’s read</div>
              <div className="fraunces text-[22px] leading-none">Personalized analysis</div>
            </div>
          </div>

          <ul className="mt-4 space-y-3">
            {insights.map((i) => (
              <li key={i.title} className="rounded-2xl border border-zinc-100 bg-white/80 p-3.5">
                <div className="text-[13px] font-semibold">{i.title}</div>
                <div className="mt-1 text-[13px] leading-5 text-zinc-600">{i.body}</div>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] text-zinc-500">Read, not verdict. Your pet notices — it doesn’t judge.</p>
        </section>
      </div>

      <div className="mt-6 md:hidden">
        <button onClick={onBack} className="w-full rounded-full border border-zinc-200 bg-white/80 px-3 py-2.5 text-[14px] hover:bg-white">Back to home</button>
      </div>
    </main>
  );
}

const MEAL_TONE_UI: Record<MealTone, { bg: string; border: string; text: string; chip: string; dot: string; label: string }> = {
  approve: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-900", chip: "bg-emerald-500", dot: "bg-emerald-500", label: "Pet approved" },
  neutral: { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-900", chip: "bg-sky-500", dot: "bg-sky-500", label: "Steady fuel" },
  warn: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-900", chip: "bg-amber-500", dot: "bg-amber-500", label: "Heavy — side-eye" },
};

function formatMealTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yest.toDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  if (isYesterday) return `Yesterday · ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} · ${time}`;
}

function MealsView({ pet, meals, onBack }: { pet: PetData; meals: MealLog[]; onBack: () => void }) {
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.macros.calories,
      carbs: acc.carbs + m.macros.carbs,
      protein: acc.protein + m.macros.protein,
      fat: acc.fat + m.macros.fat,
    }),
    { calories: 0, carbs: 0, protein: 0, fat: 0 },
  );
  const approveCount = meals.filter((m) => m.analysis.tone === "approve").length;
  const warnCount = meals.filter((m) => m.analysis.tone === "warn").length;

  return (
    <main className="mx-auto max-w-[1100px] px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-widest text-zinc-500">Meal history</div>
          <h1 className="fraunces text-[32px] md:text-[40px] leading-[1.1]">What you’ve been feeding {pet.name}</h1>
          <div className="mt-1 text-[13px] text-zinc-600">
            {meals.length} logged · <span className="text-emerald-700">{approveCount} approved</span>
            {warnCount > 0 && <> · <span className="text-amber-700">{warnCount} heavy</span></>}
          </div>
        </div>
        <button onClick={onBack} className="hidden md:inline-flex rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-[13px] hover:bg-white">Back to home</button>
      </div>

      {meals.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl p-10 text-center">
          <div className="text-[40px]">🍽️</div>
          <h2 className="fraunces mt-2 text-[22px]">Nothing here yet</h2>
          <p className="mt-1 text-[13px] text-zinc-600">Snap a photo from the home screen and your meals will show up here.</p>
          <button onClick={onBack} className="mt-5 rounded-full bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800">Back to home</button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid sm:grid-cols-4 gap-3">
            {[
              { k: "Calories", v: totals.calories, sub: "across all meals" },
              { k: "Carbs", v: `${totals.carbs}g`, sub: "total" },
              { k: "Protein", v: `${totals.protein}g`, sub: "total" },
              { k: "Fat", v: `${totals.fat}g`, sub: "total" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/70 bg-white/70 backdrop-blur-2xl p-4">
                <div className="text-[11px] uppercase tracking-wide text-zinc-500">{s.k}</div>
                <div className="mt-1 text-[22px] font-semibold tabular-nums">{s.v}</div>
                <div className="text-[11px] text-zinc-500">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {meals.map((m) => {
              const t = MEAL_TONE_UI[m.analysis.tone];
              const delta = `${m.analysis.foodDelta >= 0 ? "+" : ""}${m.analysis.foodDelta} food`;
              return (
                <article key={m.id} className={`rounded-[24px] border ${t.border} ${t.bg} p-4 md:p-5`}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative shrink-0 h-32 w-full md:w-44 overflow-hidden rounded-2xl border border-white/70 bg-white">
                      <img src={m.image} alt={m.analysis.label} className="h-full w-full object-cover" />
                      <span className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${t.chip}`}>{delta}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-600">
                        <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                        <span>{t.label}</span>
                        <span className="opacity-40">·</span>
                        <span className="normal-case tracking-normal">{formatMealTime(m.timestamp)}</span>
                      </div>
                      <div className={`mt-1 text-[17px] font-semibold ${t.text}`}>{m.analysis.label}</div>
                      <div className="mt-1 flex items-start gap-2">
                        <img
                          src={SPECIES[pet.species].images[m.analysis.reactionKey]}
                          alt=""
                          className="h-7 w-7 object-contain shrink-0"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <p className={`text-[13px] italic ${t.text}`}>“{m.analysis.reaction}”</p>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          { k: "kcal", v: m.macros.calories },
                          { k: "carbs", v: `${m.macros.carbs}g` },
                          { k: "protein", v: `${m.macros.protein}g` },
                          { k: "fat", v: `${m.macros.fat}g` },
                        ].map((s) => (
                          <div key={s.k} className="rounded-xl bg-white/70 border border-white/80 px-2.5 py-2">
                            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{s.k}</div>
                            <div className="text-[14px] font-semibold tabular-nums text-zinc-900">{s.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-6 md:hidden">
        <button onClick={onBack} className="w-full rounded-full border border-zinc-200 bg-white/80 px-3 py-2.5 text-[14px] hover:bg-white">Back to home</button>
      </div>
    </main>
  );
}

type CoachInsight = { title: string; body: string };

function buildWins(pet: PetData, morning: MorningData): CoachInsight[] {
  const out: CoachInsight[] = [];
  if (morning.sleepScore >= 75) out.push({ title: `Strong sleep · ${formatSleep(morning.sleepMinutes)}`, body: `Sleep score of ${morning.sleepScore} is in a healthy range. This is the largest lever you have on recovery, mood, and cognition — you’re pulling it consistently.` });
  if (morning.hrv >= 55) out.push({ title: `HRV in a healthy zone · ${morning.hrv}ms`, body: "Your autonomic nervous system is well-regulated. Whatever combination of sleep, movement, and stress management got you here is working." });
  if (pet.scores.calm >= 70) out.push({ title: "Stress looks managed", body: "Calm score is high. Keep whatever you’re doing to regulate — breathing, outdoor time, clear boundaries — because low-stress days compound into better sleep and steadier mood." });
  if (pet.streak >= 7) out.push({ title: `${pet.streak}-day streak`, body: "Consistency compounds. Most positive health outcomes come from showing up repeatedly over weeks, not from any single perfect day. This is how the curve bends." });
  if (pet.scores.move >= 65) out.push({ title: "Movement is consistent", body: "You’re hitting regular activity. Daily movement is one of the most underrated inputs into mood, cardiovascular health, and sleep pressure." });
  if (pet.scores.water >= 70) out.push({ title: "Hydration is on track", body: "Water score is solid. Staying ahead of thirst keeps energy, focus, and skin elasticity in a much better place than most people realize." });
  if (out.length === 0) out.push({ title: "Starting fresh", body: "Early days. Show up for the small wins in today’s plan and we’ll compound from there — the first two weeks are about the habit, not the metrics." });
  return out.slice(0, 4);
}

function buildImprovements(pet: PetData, morning: MorningData): CoachInsight[] {
  const out: CoachInsight[] = [];
  if (morning.sleepScore < 65) out.push({ title: `Short sleep · ${formatSleep(morning.sleepMinutes)}`, body: "Under 7 hours regularly costs you cognitive performance, mood regulation, and long-term metabolic health. This week, try adding 30 minutes — move bedtime, not wake time." });
  if (morning.hrv < 45) out.push({ title: `HRV is low · ${morning.hrv}ms`, body: "Low HRV usually reflects accumulated stress, under-sleeping, or over-training. Today’s plan is biased toward down-regulation — the breathing work especially moves this number quickly." });
  if (morning.stages.rem < 70) out.push({ title: `Low REM · ${morning.stages.rem} min`, body: "Healthy REM sits above 90 minutes. The usual culprits are late meals, alcohol in the evening, or an inconsistent bedtime. If this is a pattern worth watching, those are the first levers." });
  if (pet.scores.water < 55) out.push({ title: "Hydration is behind", body: "Water score is low. Dehydration masks itself as fatigue, headache, and low mood — easy fix, hard to remember. Front-load water before lunch today." });
  if (pet.scores.food < 55) out.push({ title: "Meal quality is drifting", body: "Food score is slipping. No crisis — just aim for one balanced plate today (protein + fiber + color). One good meal reliably shifts the next few choices." });
  if (pet.scores.move < 50) out.push({ title: "Activity is light", body: "Movement score is low. Even a 15-minute walk today raises tomorrow’s sleep quality and cuts into the afternoon energy dip — small input, disproportionate payoff." });
  if (out.length === 0) out.push({ title: "Nothing urgent today", body: "All your markers are in range. The job is maintenance — keep the rhythm and don’t let a good streak tempt you into over-optimizing." });
  return out.slice(0, 4);
}

function CoachView({ pet, morning, mood, plan, completedPlan, onBack }: { pet: PetData; morning: MorningData; mood: Mood; plan: PlanItem[]; completedPlan: string[]; onBack: () => void }) {
  const wins = buildWins(pet, morning);
  const improvements = buildImprovements(pet, morning);
  const score = overallScore(pet.scores);

  return (
    <main className="mx-auto max-w-[1100px] px-4 sm:px-6 py-8 md:py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-widest text-zinc-500">Coach</div>
          <h1 className="fraunces text-[32px] md:text-[40px] leading-[1.1]">How {pet.name} reads today</h1>
          <div className="mt-1 text-[13px] text-zinc-600 capitalize">
            <span className="inline-block h-2 w-2 rounded-full align-middle bg-zinc-400" /> <b className="text-zinc-800">{mood}</b> · overall {score} · {morning.feeling} morning
          </div>
        </div>
        <button onClick={onBack} className="hidden md:inline-flex rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-[13px] hover:bg-white">Back to home</button>
      </div>

      {/* Morning snapshot */}
      <section className="mt-6 rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 md:p-6">
        <div className="flex items-center gap-4">
          <img src={petImage(pet.species, mood)} alt="" className="h-14 w-14 object-contain shrink-0" style={{ imageRendering: "pixelated" }} />
          <div className="min-w-0">
            <div className="text-[13px] text-zinc-500">{pet.name}’s read</div>
            <p className="mt-0.5 text-[14px] leading-6 text-zinc-800">
              You slept {formatSleep(morning.sleepMinutes)} with an HRV of {morning.hrv}ms and resting HR at {morning.restingHr} bpm. That puts today in the <b className="capitalize">{morning.feeling}</b> bucket — the three actions below are shaped around that, not around a generic checklist.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        {/* Wins */}
        <section className="rounded-[28px] border border-emerald-100 bg-emerald-50/50 backdrop-blur-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <div className="text-[11px] uppercase tracking-wide">What you’re doing well</div>
          </div>
          <ul className="mt-3 space-y-3">
            {wins.map((w) => (
              <li key={w.title} className="rounded-2xl bg-white/80 border border-emerald-100 p-3.5">
                <div className="text-[14px] font-semibold text-emerald-900">{w.title}</div>
                <div className="mt-1 text-[13px] leading-5 text-emerald-900/80">{w.body}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Improvements */}
        <section className="rounded-[28px] border border-amber-100 bg-amber-50/50 backdrop-blur-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <div className="text-[11px] uppercase tracking-wide">What could improve</div>
          </div>
          <ul className="mt-3 space-y-3">
            {improvements.map((w) => (
              <li key={w.title} className="rounded-2xl bg-white/80 border border-amber-100 p-3.5">
                <div className="text-[14px] font-semibold text-amber-900">{w.title}</div>
                <div className="mt-1 text-[13px] leading-5 text-amber-900/80">{w.body}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Plan with reasoning */}
      <section className="mt-5 rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] text-zinc-500">Why today’s plan</div>
            <h2 className="fraunces text-[22px]">The three actions, explained</h2>
          </div>
          <div className="text-[11px] rounded-full bg-white/80 border border-zinc-200 px-2 py-0.5 capitalize text-zinc-600">
            {morning.feeling} morning
          </div>
        </div>

        <ol className="mt-4 space-y-3">
          {plan.map((item, i) => {
            const done = completedPlan.includes(item.label);
            const deltaChips = Object.entries(item.delta).map(([k, v]) => `${k} ${(v as number) > 0 ? "+" : ""}${v}`);
            return (
              <li key={item.label} className={`rounded-2xl border ${done ? "border-emerald-100 bg-emerald-50/60" : "border-zinc-100 bg-white/80"} p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 h-7 w-7 grid place-items-center rounded-full text-[12px] font-semibold ${done ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[15px] font-semibold">{item.label}</div>
                      <span className="inline-flex items-center rounded-full bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-700">
                        Addresses: {item.addresses}
                      </span>
                      {done && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px]">Done</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-zinc-500">{item.detail}</div>
                    <p className="mt-2 text-[13px] leading-5 text-zinc-700">{item.reasoning}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {deltaChips.map((d) => (
                        <span key={d} className="inline-flex items-center rounded-md bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600 capitalize">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-5 text-[12px] text-zinc-500">Your coach notices — it doesn’t scold. The plan shifts tomorrow if your morning data does.</p>

      <div className="mt-6 md:hidden">
        <button onClick={onBack} className="w-full rounded-full border border-zinc-200 bg-white/80 px-3 py-2.5 text-[14px] hover:bg-white">Back to home</button>
      </div>
    </main>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [step, setStep] = useState(1);
  const [pet, setPet] = useState<PetData>({
    name: "Mochi",
    species: "rabbit",
    dietary: ["Vegetarian"],
    goals: ["Sleep better"],
    scores: { ...SLUGGISH_BASELINE },
    streak: 0,
    waterToday: 0,
    waterGoal: 64,
  });
  const [morning, setMorning] = useState<MorningData | null>(null);
  const [view, setView] = useState<"home" | "detail" | "meals" | "coach">("home");
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [showCheckin, setShowCheckin] = useState<null | "meal" | "water" | "sleep">(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mealImage, setMealImage] = useState<string | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis | null>(null);
  const [mealAnalyzing, setMealAnalyzing] = useState(false);

  useEffect(() => {
    if (showCheckin !== "meal") {
      setMealImage(null);
      setMealAnalysis(null);
      setMealAnalyzing(false);
    }
  }, [showCheckin]);

  const onMealFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMealImage(reader.result as string);
      setMealAnalysis(null);
      setMealAnalyzing(true);
      setTimeout(() => {
        const picks: MealAnalysis[] = [
          {
            label: "Looks balanced",
            foodDelta: 6,
            note: "Protein, fiber, and color on the plate.",
            tone: "approve",
            reaction: `${pet.name} is thrilled — this is the good stuff!`,
            reactionKey: "thrive",
          },
          {
            label: "Solid choice",
            foodDelta: 4,
            note: "Gentle on the system. A sip of water pairs well.",
            tone: "neutral",
            reaction: `${pet.name} nods along. Steady fuel.`,
            reactionKey: "healthy",
          },
          {
            label: "Heavy and processed",
            foodDelta: -2,
            note: "Heavy on fried or processed bits. Your pet wants a break.",
            tone: "warn",
            reaction: `${pet.name} is giving you side-eye. Maybe greens next?`,
            reactionKey: "unwell",
          },
        ];
        setMealAnalysis(picks[file.size % picks.length]);
        setMealAnalyzing(false);
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const applyMeal = () => {
    if (!mealAnalysis || !mealImage) return;
    const { label, foodDelta } = mealAnalysis;
    const now = Date.now();
    const entry: MealLog = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now,
      image: mealImage,
      analysis: mealAnalysis,
      macros: estimateMacros(mealAnalysis.tone, mealImage.length),
    };
    setMeals((prev) => [entry, ...prev].slice(0, 40));
    setPet((p) => ({ ...p, scores: { ...p.scores, food: Math.max(0, Math.min(100, p.scores.food + foodDelta)) } }));
    setToast(`${label} · ${foodDelta >= 0 ? "+" : ""}${foodDelta} food`);
    setTimeout(() => setToast(null), 1800);
    setShowCheckin(null);
  };

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    let loadedPet: PetData | null = null;
    let loadedOnboarded = false;
    const saved = localStorage.getItem("pethealth:v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.pet && parsed.pet.species in SPECIES) {
          loadedPet = parsed.pet;
          loadedOnboarded = !!parsed.onboarded;
        } else {
          localStorage.removeItem("pethealth:v1");
        }
      } catch {}
    }

    let m: MorningData | null = null;
    const savedMorning = localStorage.getItem("pethealth:morning");
    if (savedMorning) {
      try {
        const parsed = JSON.parse(savedMorning);
        if (parsed?.date === today) m = parsed;
      } catch {}
    }

    if (!m) {
      m = generateMorning(today);
      localStorage.setItem("pethealth:morning", JSON.stringify(m));
      if (loadedPet) {
        loadedPet = {
          ...loadedPet,
          scores: { food: 48, sleep: m.sleepScore, water: 22, move: Math.min(40, Math.round(m.activeMinutes * 2.5)), calm: m.calmScore },
          waterToday: 0,
        };
      }
    }

    if (loadedPet) setPet(loadedPet);
    setOnboarded(loadedOnboarded);
    setMorning(m);

    const savedMeals = localStorage.getItem("pethealth:meals");
    if (savedMeals) {
      try {
        const parsed = JSON.parse(savedMeals);
        if (Array.isArray(parsed)) setMeals(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pethealth:v1", JSON.stringify({ pet, onboarded }));
  }, [pet, onboarded]);

  useEffect(() => {
    if (meals.length === 0) return;
    try {
      localStorage.setItem("pethealth:meals", JSON.stringify(meals));
    } catch {}
  }, [meals]);

  const score = overallScore(pet.scores);
  const mood = getMood(score);
  const meta = moodMeta(mood);

  const voice = useMemo(() => {
    const s = pet.scores;
    if (morning?.feeling === "stressed" && s.calm < 55) return `Your HRV was ${morning.hrv}ms — low side. Let’s breathe first, plan second.`;
    if (morning?.feeling === "groggy") return `Only ${formatSleep(morning.sleepMinutes)} last night. Go easy — light walk before coffee?`;
    if (s.sleep < 50) return "I slept a little sideways last night… gentle morning?";
    if (s.water < 50) return "My skin feels papery. Could we sip some water together?";
    if (s.food < 45) return "That last meal sat heavy. No stress — we’ll balance it.";
    if (morning?.feeling === "rested") return `${formatSleep(morning.sleepMinutes)} of sleep and HRV up to ${morning.hrv} — we’ve got a good one today.`;
    if (pet.streak >= 7) return `Day ${pet.streak}. I'm proud of us. Little steps count.`;
    if (mood === "Thriving") return "I feel light today. Want to do something just for fun?";
    if (mood === "Critical") return "I'm not okay right now. Can we slow down and call the vet plan?";
    return "Morning. What’s one kind thing we can do for our body today?";
  }, [pet.scores, pet.streak, mood, morning]);

  const plan = useMemo<PlanItem[]>(() => PLANS[morning?.feeling ?? "okay"], [morning]);
  const [completedPlan, setCompletedPlan] = useState<string[]>([]);

  useEffect(() => {
    setCompletedPlan([]);
  }, [morning?.date]);

  const completePlanItem = (item: PlanItem) => {
    if (completedPlan.includes(item.label)) return;
    nudge({ food: 10, sleep: 10, water: 10, move: 10, calm: 10 });
    setCompletedPlan((prev) => [...prev, item.label]);
  };

  const simulateNewDay = () => {
    const nextDate = morning ? new Date(new Date(morning.date).getTime() + 86_400_000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const m = generateMorning(nextDate);
    localStorage.setItem("pethealth:morning", JSON.stringify(m));
    setMorning(m);
    setPet((p) => ({
      ...p,
      scores: { food: 48, sleep: m.sleepScore, water: 22, move: Math.min(40, Math.round(m.activeMinutes * 2.5)), calm: m.calmScore },
      waterToday: 0,
    }));
    setToast(`New morning · ${m.feeling}`);
    setTimeout(() => setToast(null), 1800);
  };

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

  const boostHealth = () => {
    nudge({ food: 10, sleep: 10, water: 10, move: 10, calm: 10 });
    setToast("+10 health · all scores boosted");
    setTimeout(() => setToast(null), 1600);
  };

  const handleReset = () => {
    localStorage.removeItem("pethealth:v1");
    localStorage.removeItem("pethealth:morning");
    localStorage.removeItem("pethealth:meals");
    setPet({
      name: "Mochi",
      species: "rabbit",
      dietary: ["Vegetarian"],
      goals: ["Sleep better"],
      scores: { ...SLUGGISH_BASELINE },
      streak: 0,
      waterToday: 0,
      waterGoal: 64,
    });
    setMeals([]);
    setCompletedPlan([]);
    setMorning(null);
    setView("home");
    setStep(1);
    setShowCheckin(null);
    setMealImage(null);
    setMealAnalysis(null);
    setMealAnalyzing(false);
    setOnboarded(false);
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
              <div className="font-[Fraunces] text-[22px] tracking-tight">Vivo</div>
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
                          <img
                            src={SPECIES[sp].images.thrive}
                            alt={SPECIES[sp].label}
                            className="h-12 w-12 object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
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
                <Pet species={pet.species} mood="Thriving" />
                <div className="mx-auto mt-4 max-w-[320px] rounded-2xl bg-white/80 px-4 py-3 text-center text-[14px] italic text-zinc-700 shadow-sm border border-zinc-100">“I can’t wait to meet you — let’s take care of each other.”</div>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {[
                    { k: "Food", v: 82 },
                    { k: "Sleep", v: 78 },
                    { k: "Water", v: 74 },
                    { k: "Move", v: 70 },
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
          {view === "home" ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white shadow grid place-items-center">🫧</div>
              <div className="fraunces text-[20px] leading-none">Vivo</div>
              <span className="ml-2 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[11px] border border-zinc-200">
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {mood} · {score}
              </span>
            </div>
          ) : (
            <button onClick={() => setView("home")} className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-[13px] hover:bg-white">
              <span aria-hidden>←</span>
              <span>Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            {view === "home" && (
              <>
                <button onClick={boostHealth} className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 px-3 py-1.5 text-xs hover:bg-emerald-100">+10 health</button>
                <button onClick={simulateNewDay} className="hidden sm:inline-flex rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs hover:bg-white">simulate new morning</button>
              </>
            )}
            <button onClick={handleReset} className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs hover:bg-white">reset</button>
          </div>
        </div>
      </div>

      {view === "detail" && morning && (
        <DetailView pet={pet} morning={morning} mood={mood} score={score} meta={meta} onBack={() => setView("home")} />
      )}

      {view === "meals" && (
        <MealsView pet={pet} meals={meals} onBack={() => setView("home")} />
      )}

      {view === "coach" && morning && (
        <CoachView pet={pet} morning={morning} mood={mood} plan={plan} completedPlan={completedPlan} onBack={() => setView("home")} />
      )}

      {view === "home" && (
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
                    <img
                      src={SPECIES[pet.species].images.thrive}
                      alt={SPECIES[pet.species].label}
                      className="h-8 w-8 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
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

              <button
                type="button"
                onClick={() => setView("detail")}
                aria-label={`See ${pet.name}'s health details`}
                className="mt-6 block w-full rounded-[24px] transition hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
              >
                <Pet species={pet.species} mood={mood} />
                <div className="mx-auto mt-1 w-fit rounded-full bg-white/70 border border-zinc-200 px-2.5 py-0.5 text-[11px] text-zinc-600">
                  Tap {pet.name} for today’s breakdown →
                </div>
              </button>

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

            <div
              role="button"
              tabIndex={0}
              onClick={() => setView("coach")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setView("coach"); } }}
              className="group cursor-pointer rounded-[28px] border border-white/70 bg-white/65 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(16,24,40,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
              aria-label="Open coach for plan rationale"
            >
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-zinc-500">Today’s gentle plan</div>
                <div className="flex items-center gap-2">
                  {morning && (
                    <div className="text-[11px] rounded-full bg-white/80 border border-zinc-200 px-2 py-0.5 capitalize text-zinc-600">
                      {morning.feeling} morning
                    </div>
                  )}
                  <span className="text-[12px] text-zinc-500 group-hover:text-zinc-700">Open coach →</span>
                </div>
              </div>
              <ul className="mt-2 space-y-2 text-[14px]">
                {plan.filter((item) => !completedPlan.includes(item.label)).map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white/70 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate">{item.label}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{item.detail}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); completePlanItem(item); }}
                      className="shrink-0 text-xs rounded-full border border-zinc-200 bg-white px-2.5 py-1 hover:bg-zinc-50"
                    >
                      Done
                    </button>
                  </li>
                ))}
                {plan.every((item) => completedPlan.includes(item.label)) && (
                  <li className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-3 text-center text-[13px] text-emerald-800">
                    All done for today. {pet.name} noticed. ✿
                  </li>
                )}
              </ul>
              <p className="mt-3 text-[12px] text-zinc-500">Tap anywhere for the reasoning behind each action.</p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/60 backdrop-blur-2xl p-5">
              <div className="text-[13px] text-zinc-500">How this works</div>
              <p className="mt-1 text-[13px] leading-5 text-zinc-600">Your pet’s eyes mirror sleep, bounce mirrors movement, cracks appear when dry, color dulls after heavy meals. It’s a mirror—not a grade.</p>
            </div>

            <button
              type="button"
              onClick={() => setView("meals")}
              className="group block w-full text-left rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_rgba(16,24,40,0.06)] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(16,24,40,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
              aria-label="See meal history"
            >
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-zinc-500">Recent meals</div>
                <div className="text-[12px] text-zinc-500 group-hover:text-zinc-700">See history →</div>
              </div>

              {meals.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-3 py-5 text-center">
                  <div className="text-[24px]">🍽️</div>
                  <div className="mt-1 text-[13px] text-zinc-600">No meals logged yet</div>
                  <div className="text-[11px] text-zinc-500">Tap “Log meal” to snap your first one.</div>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    {meals.slice(0, 4).map((m) => {
                      const toneClr = m.analysis.tone === "approve" ? "bg-emerald-500" : m.analysis.tone === "warn" ? "bg-amber-500" : "bg-sky-500";
                      const delta = `${m.analysis.foodDelta >= 0 ? "+" : ""}${m.analysis.foodDelta}`;
                      return (
                        <div key={m.id} className="relative flex-1 aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                          <img src={m.image} alt="" className="h-full w-full object-cover" />
                          <span className={`absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white ${toneClr}`}>{delta}</span>
                        </div>
                      );
                    })}
                    {Array.from({ length: Math.max(0, 4 - meals.slice(0, 4).length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex-1 aspect-square rounded-xl border border-dashed border-zinc-200 bg-white/40" />
                    ))}
                  </div>
                  <div className="mt-3 text-[12px] text-zinc-600">
                    {meals.length} logged · latest <span className="capitalize">{meals[0].analysis.tone === "approve" ? "great choice" : meals[0].analysis.tone === "warn" ? "heavy — go easy" : "steady fuel"}</span>
                  </div>
                </>
              )}
            </button>
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
                      <div className="relative h-12 w-12 grid place-items-center rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden">
                        <img
                          src={petImage(f.species, f.mood)}
                          alt={`${f.pet} the ${SPECIES[f.species].label}`}
                          className="h-10 w-10 object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
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
      )}

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
                {!mealImage && (
                  <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-8 text-center hover:bg-zinc-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onMealFile(f);
                        e.target.value = "";
                      }}
                    />
                    <div className="text-[28px]">📷</div>
                    <div className="mt-2 text-[14px] font-medium">Snap or upload your meal</div>
                    <div className="text-[12px] text-zinc-500">Your pet reads the plate — no typing required.</div>
                  </label>
                )}

                {mealImage && (
                  <>
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      <img src={mealImage} alt="Your meal" className="h-44 w-full object-cover" />
                      {mealAnalyzing && (
                        <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-sm">
                          <div className="flex items-center gap-2 rounded-full bg-white/90 border border-zinc-200 px-3 py-1.5 text-[13px] shadow">
                            <span className="h-2 w-2 rounded-full bg-zinc-900 animate-ping" />
                            <span>Your pet is tasting…</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {mealAnalysis && !mealAnalyzing && (() => {
                      const tones: Record<MealTone, { bg: string; border: string; text: string; subtext: string; chipBg: string; ring: string }> = {
                        approve: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-900", subtext: "text-emerald-900/70", chipBg: "bg-emerald-100", ring: "ring-emerald-200" },
                        neutral: { bg: "bg-sky-50", border: "border-sky-100", text: "text-sky-900", subtext: "text-sky-900/70", chipBg: "bg-sky-100", ring: "ring-sky-200" },
                        warn: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-900", subtext: "text-amber-900/70", chipBg: "bg-amber-100", ring: "ring-amber-200" },
                      };
                      const t = tones[mealAnalysis.tone];
                      const deltaStr = `${mealAnalysis.foodDelta >= 0 ? "+" : ""}${mealAnalysis.foodDelta} food`;
                      return (
                        <div className={`flex items-start gap-3 rounded-xl ${t.bg} border ${t.border} px-3 py-3`}>
                          <div className={`relative shrink-0 h-14 w-14 rounded-2xl ${t.chipBg} ring-1 ${t.ring} grid place-items-center overflow-hidden`}>
                            <img
                              src={SPECIES[pet.species].images[mealAnalysis.reactionKey]}
                              alt={`${pet.name} reacting`}
                              className="h-12 w-12 object-contain"
                              style={{ imageRendering: "pixelated" }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[13px] font-semibold ${t.text}`}>{mealAnalysis.label} · {deltaStr}</div>
                            <div className={`mt-0.5 text-[12px] ${t.subtext}`}>{mealAnalysis.note}</div>
                            <div className={`mt-1.5 text-[12px] italic ${t.text}`}>“{mealAnalysis.reaction}”</div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setMealImage(null); setMealAnalysis(null); setMealAnalyzing(false); }}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-2 text-sm hover:bg-zinc-50"
                      >
                        Retake
                      </button>
                      <button
                        disabled={!mealAnalysis}
                        onClick={applyMeal}
                        className="flex-1 rounded-xl bg-zinc-900 text-white py-2 text-sm hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Log meal
                      </button>
                    </div>
                  </>
                )}

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
