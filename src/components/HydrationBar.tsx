type Props = {
  value: number
  max?: number
  onAdd: () => void
}

export default function HydrationBar({ value, max = 8, onAdd }: Props) {
  const filled = Math.min(value, max)

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-gray-500">Hydration today</div>
          <div className="text-2xl font-bold text-sky-600">
            {filled} <span className="text-sm text-gray-400">/ {max} glasses</span>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="btn-primary bg-gradient-to-b from-sky-400 to-blue-500 flex items-center gap-2"
          aria-label="Log a glass of water"
        >
          <span className="text-xl">💧</span> + Water
        </button>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-4 rounded-full transition-all ${
              i < filled
                ? 'bg-gradient-to-b from-sky-300 to-blue-500 shadow-inner'
                : 'bg-gray-200/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
