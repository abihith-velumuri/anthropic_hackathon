type Props = {
  message: string
  thinking?: boolean
}

export default function PetBubble({ message, thinking }: Props) {
  return (
    <div className="card p-4 relative">
      <div className="absolute -top-2 left-8 w-4 h-4 bg-white/80 rotate-45 border-l border-t border-white" />
      <div className="text-sm text-gray-500 mb-1">Your pet says…</div>
      {thinking ? (
        <div className="flex items-center gap-2 text-gray-500">
          <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
          <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse [animation-delay:150ms]" />
          <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-pulse [animation-delay:300ms]" />
          <span className="ml-2 italic text-sm">thinking...</span>
        </div>
      ) : (
        <div className="text-lg leading-snug text-gray-800">{message}</div>
      )}
    </div>
  )
}
