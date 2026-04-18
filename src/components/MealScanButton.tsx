import { useRef } from 'react'

type Props = {
  onFile: (file: File) => void
  disabled?: boolean
}

export default function MealScanButton({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
      >
        <span className="text-2xl">📸</span>
        <span>{disabled ? 'Analyzing meal…' : 'Scan a meal'}</span>
      </button>
    </>
  )
}
