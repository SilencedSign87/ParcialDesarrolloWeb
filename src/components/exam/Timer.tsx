import { useState, useEffect } from 'react'
import { Timer as TimerIcon } from 'lucide-react'

interface TimerProps {
  minutes: number
  onTimeUp: () => void
}

export default function Timer({ minutes, onTimeUp }: TimerProps) {
  const [seconds, setSeconds] = useState(minutes * 60)

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp()
      return
    }
    const interval = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(interval)
  }, [seconds, onTimeUp])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isWarning = seconds <= 60
  const isCritical = seconds <= 30

  return (
    <div className={`flex items-center gap-2 font-mono text-base font-bold px-4 py-2 rounded-full transition-all
      ${isCritical ? 'bg-red-100 text-red-700 animate-pulse scale-110' :
        isWarning ? 'bg-orange-100 text-orange-600' :
        'bg-indigo-100 text-indigo-600'}`}
    >
      <TimerIcon className="w-4 h-4" />
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  )
}
