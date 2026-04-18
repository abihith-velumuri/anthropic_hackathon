type Props = {
  message: string | null
}

export default function Toast({ message }: Props) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-pop">
      <div className="bg-white/95 shadow-xl rounded-full px-5 py-3 border border-gray-200 text-sm font-medium">
        {message}
      </div>
    </div>
  )
}
