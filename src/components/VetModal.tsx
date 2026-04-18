type Props = {
  open: boolean
  petName: string
  loading: boolean
  plan: string
  onClose: () => void
  onAccept: () => void
}

function renderMarkdown(text: string) {
  // Minimal markdown: paragraphs + bullet list lines starting with "- " or "* ".
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const out: JSX.Element[] = []
  let bulletBuf: string[] = []
  const flush = () => {
    if (bulletBuf.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-none space-y-2 my-2">
          {bulletBuf.map((b, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-rose-500 mt-1">●</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>,
      )
      bulletBuf = []
    }
  }
  for (const raw of lines) {
    const trimmed = raw.trim()
    if (/^[-*]\s+/.test(trimmed)) {
      bulletBuf.push(trimmed.replace(/^[-*]\s+/, ''))
    } else {
      flush()
      out.push(
        <p key={`p-${out.length}`} className="leading-relaxed my-2">
          {trimmed}
        </p>,
      )
    }
  }
  flush()
  return out
}

export default function VetModal({ open, petName, loading, plan, onClose, onAccept }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-w-md w-full p-6 animate-pop">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">🏥</div>
          <div>
            <div className="text-xl font-bold">{petName}'s vet visit</div>
            <div className="text-sm text-gray-500">A gentle plan to feel better</div>
          </div>
        </div>

        <div className="bg-white/70 rounded-2xl p-4 my-4 min-h-[160px] text-gray-800">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500 italic">
              <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
              <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="ml-2">The vet is listening…</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">{renderMarkdown(plan)}</div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost">
            Not now
          </button>
          <button onClick={onAccept} disabled={loading} className="btn-primary">
            Let's do this
          </button>
        </div>
      </div>
    </div>
  )
}
